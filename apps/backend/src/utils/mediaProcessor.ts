import { db } from './db';
import { getR2Client, extractObjectKey, storageUrlForKey } from './r2';
import { GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import { createWriteStream, existsSync, chmodSync } from 'fs';
import fs from 'fs/promises';
import { pipeline } from 'stream/promises';
import path from 'path';
import os from 'os';
import { exec, execSync } from 'child_process';
import { promisify } from 'util';
import { randomUUID } from 'crypto';
// @ts-ignore
import ffmpeg from 'ffmpeg-static';
// @ts-ignore
import ffprobe from 'ffprobe-static';

const execAsync = promisify(exec);

function resolveBinaryPath(bin: any): string {
  if (typeof bin === 'string') return bin;
  if (bin && typeof bin === 'object') {
    if (typeof bin.path === 'string') return bin.path;
    if (bin.default) {
      if (typeof bin.default === 'string') return bin.default;
      if (typeof bin.default.path === 'string') return bin.default.path;
    }
  }
  return String(bin);
}

function resolveExecutable(localBin: any, fallbackName: string): string {
  const localPath = resolveBinaryPath(localBin);

  if (localPath && existsSync(localPath)) {
    if (process.platform !== 'win32') {
      try {
        chmodSync(localPath, 0o755);
      } catch (e) {
        console.warn(
          `[MediaProcessor] Failed to chmod ${fallbackName} binary:`,
          e,
        );
      }
    }
    try {
      execSync(`"${localPath}" -version`, { stdio: 'ignore' });
      console.log(`[MediaProcessor] Using working static binary: ${localPath}`);
      return localPath;
    } catch (e) {
      console.warn(
        `[MediaProcessor] Static binary at ${localPath} is not working:`,
        e,
      );
    }
  }

  try {
    execSync(`${fallbackName} -version`, { stdio: 'ignore' });
    console.log(
      `[MediaProcessor] Using system-installed fallback: ${fallbackName}`,
    );
    return fallbackName;
  } catch (e) {
    console.error(
      `[MediaProcessor] System-installed ${fallbackName} is also not available in PATH!`,
    );
  }

  return localPath || fallbackName;
}

const ffmpegPath = resolveExecutable(ffmpeg, 'ffmpeg');
const ffprobePath = resolveExecutable(ffprobe, 'ffprobe');

export async function processVideoTracks(fileId: string) {
  const file = await db.file.findUnique({
    where: { id: fileId },
  });

  if (!file) {
    console.error(`[MediaProcessor] File not found: ${fileId}`);
    return;
  }

  // Supported extensions
  const nameLower = file.name.toLowerCase();
  const isVideo =
    nameLower.endsWith('.mkv') ||
    nameLower.endsWith('.mp4') ||
    nameLower.endsWith('.mov') ||
    nameLower.endsWith('.webm');
  if (!isVideo) {
    return;
  }

  const objectKey = extractObjectKey(file.s3Url);
  const bucket = process.env.R2_BUCKET?.trim();
  if (!bucket) {
    console.error(`[MediaProcessor] R2_BUCKET not configured`);
    return;
  }

  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'aset-extractor-'));
  const inputFilePath = path.join(
    tempDir,
    `input_${randomUUID()}_${path.basename(file.name)}`,
  );

  try {
    console.log(
      `[MediaProcessor] Downloading file: ${file.name} to ${inputFilePath}`,
    );
    const client = getR2Client();
    const getCommand = new GetObjectCommand({
      Bucket: bucket,
      Key: objectKey,
    });
    const response = await client.send(getCommand);
    if (!response.Body) {
      throw new Error('Empty response body from R2');
    }

    const writeStream = createWriteStream(inputFilePath);
    await pipeline(response.Body as any, writeStream);
    console.log(
      `[MediaProcessor] Download completed. Probing file metadata...`,
    );

    // Run ffprobe to get streams in JSON format
    const ffprobeCmd = `"${ffprobePath}" -v error -show_entries stream=index,codec_type,codec_name:stream_tags=language,title -of json "${inputFilePath}"`;
    const { stdout } = await execAsync(ffprobeCmd);
    const metadata = JSON.parse(stdout);

    const streams = metadata.streams || [];
    console.log(`[MediaProcessor] Found ${streams.length} streams`);

    // Tracks lists
    const subtitleTracks: any[] = [];
    const audioTracks: any[] = [];

    // Filter subtitle and audio streams
    let subtitleIndex = 0;
    let audioIndex = 0;

    for (const stream of streams) {
      const type = stream.codec_type;
      const idx = stream.index;
      const tags = stream.tags || {};
      const language = tags.language || 'und';
      const title = tags.title || '';

      if (type === 'subtitle') {
        subtitleTracks.push({
          streamIndex: idx,
          extractorIndex: subtitleIndex++,
          language,
          title: title || `Subtitle #${subtitleIndex}`,
          codec: stream.codec_name,
        });
      } else if (type === 'audio') {
        audioTracks.push({
          streamIndex: idx,
          extractorIndex: audioIndex++,
          language,
          title: title || `Audio Track #${audioIndex}`,
          codec: stream.codec_name,
        });
      }
    }

    // Process subtitle tracks: extract to WebVTT
    for (const sub of subtitleTracks) {
      console.log(
        `[MediaProcessor] Extracting subtitle track ${sub.streamIndex} (${sub.title})`,
      );
      const vttTempPath = path.join(tempDir, `sub_${sub.streamIndex}.vtt`);
      const subExtractCmd = `"${ffmpegPath}" -i "${inputFilePath}" -map 0:s:${sub.extractorIndex} -y "${vttTempPath}"`;
      try {
        await execAsync(subExtractCmd);

        // Upload vtt file to R2
        const vttBuffer = await fs.readFile(vttTempPath);
        const subId = randomUUID();
        const subObjectKey = `${file.ownerId}/${file.folderId || 'root'}/extracted/subtitles/${subId}.vtt`;

        const putCommand = new PutObjectCommand({
          Bucket: bucket,
          Key: subObjectKey,
          Body: vttBuffer,
          ContentType: 'text/vtt',
        });
        await client.send(putCommand);

        const subS3Url = storageUrlForKey(subObjectKey);

        // Save to DB
        await db.subtitleTrack.create({
          data: {
            id: subId,
            fileId: file.id,
            label: sub.title || `Subtitles (${sub.language.toUpperCase()})`,
            language: sub.language,
            s3Url: subS3Url,
          },
        });
        console.log(
          `[MediaProcessor] Successfully extracted and saved subtitle: ${sub.title}`,
        );
      } catch (subErr) {
        console.error(
          `[MediaProcessor] Failed to extract subtitle track ${sub.streamIndex}:`,
          subErr,
        );
      }
    }

    // Process secondary audio tracks (index > 0)
    for (const audio of audioTracks) {
      if (audio.extractorIndex === 0) {
        // Skip default audio track since browser plays it natively
        continue;
      }
      console.log(
        `[MediaProcessor] Extracting secondary audio track ${audio.streamIndex} (${audio.title})`,
      );
      const audioTempPath = path.join(
        tempDir,
        `audio_${audio.streamIndex}.m4a`,
      );
      const audioExtractCmd = `"${ffmpegPath}" -i "${inputFilePath}" -map 0:a:${audio.extractorIndex} -c:a aac -y "${audioTempPath}"`;
      try {
        await execAsync(audioExtractCmd);

        // Upload m4a file to R2
        const audioBuffer = await fs.readFile(audioTempPath);
        const audioId = randomUUID();
        const audioObjectKey = `${file.ownerId}/${file.folderId || 'root'}/extracted/audio/${audioId}.m4a`;

        const putCommand = new PutObjectCommand({
          Bucket: bucket,
          Key: audioObjectKey,
          Body: audioBuffer,
          ContentType: 'audio/mp4',
        });
        await client.send(putCommand);

        const audioS3Url = storageUrlForKey(audioObjectKey);

        // Save to DB
        await db.audioTrack.create({
          data: {
            id: audioId,
            fileId: file.id,
            label: audio.title || `Audio (${audio.language.toUpperCase()})`,
            language: audio.language,
            s3Url: audioS3Url,
          },
        });
        console.log(
          `[MediaProcessor] Successfully extracted and saved audio: ${audio.title}`,
        );
      } catch (audioErr) {
        console.error(
          `[MediaProcessor] Failed to extract audio track ${audio.streamIndex}:`,
          audioErr,
        );
      }
    }
  } catch (err) {
    console.error(
      `[MediaProcessor] Error processing media tracks for file ${fileId}:`,
      err,
    );
  } finally {
    // Cleanup temporary files
    try {
      await fs.rm(tempDir, { recursive: true, force: true });
      console.log(`[MediaProcessor] Cleaned up temp directory: ${tempDir}`);
    } catch (cleanErr) {
      console.error(`[MediaProcessor] Failed to clean up temp dir:`, cleanErr);
    }
  }
}
