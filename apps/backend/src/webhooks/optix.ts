import type { Request, Response } from 'express';
import { db } from '../utils/db';
import {
  buildObjectKey,
  storageUrlForKey,
  resolvePublicFileUrl,
  deleteObject,
  extractObjectKey,
  uploadObject,
} from '../utils/r2';

export async function optixUpdateFileHandler(req: Request, res: Response) {
  const secret = req.headers['x-optix-secret'];
  const expectedSecret = process.env.OPTIX_SECRET || 'optix-super-secret-key';

  console.log('secret: = ' + secret);
  console.log('expectedSecret: =' + expectedSecret);
  if (secret !== expectedSecret) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  const { fileId, webpBase64, fileName } = req.body;
  if (!fileId || !webpBase64 || !fileName) {
    res.status(400).json({ error: 'Missing required fields' });
    return;
  }

  try {
    const file = await db.file.findUnique({
      where: { id: fileId },
    });

    if (!file) {
      res.status(404).json({ error: 'File not found' });
      return;
    }

    // 1. Decode compressed WebP bytes from base64
    const buffer = Buffer.from(webpBase64, 'base64');
    const newSizeMb = buffer.length / (1024 * 1024);

    // 2. Generate a clean object key for the new WebP file
    const newObjectKey = buildObjectKey(
      file.ownerId,
      file.folderId || 'root',
      fileName,
    );

    // 3. Upload to Cloudflare R2
    await uploadObject(newObjectKey, buffer, 'image/webp');

    // 4. Delete old object from Cloudflare R2
    try {
      const oldObjectKey = extractObjectKey(file.s3Url);
      await deleteObject(oldObjectKey);
    } catch (err) {
      console.error('Failed to delete old object from R2:', err);
    }

    // 5. Update database atomically inside a transaction
    const newS3Url = storageUrlForKey(newObjectKey);
    const sizeDiff = newSizeMb - file.sizeMb;

    const [updatedFile] = await db.$transaction([
      db.file.update({
        where: { id: fileId },
        data: {
          name: fileName,
          s3Url: newS3Url,
          sizeMb: newSizeMb,
        },
        select: { id: true, name: true, s3Url: true, sizeMb: true },
      }),
      db.userStorage.update({
        where: { userId: file.ownerId },
        data: { usedStorage: { increment: sizeDiff } },
      }),
    ]);

    res.status(200).json({
      id: updatedFile.id,
      name: updatedFile.name,
      url: resolvePublicFileUrl(updatedFile.s3Url),
      sizeMb: updatedFile.sizeMb,
    });
  } catch (error: any) {
    console.error('[Optix Update File Callback Error]:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
}

export async function optixRegisterTracksHandler(req: Request, res: Response) {
  const secret = req.headers['x-optix-secret'];
  const expectedSecret = process.env.OPTIX_SECRET || 'optix-super-secret-key';

  if (secret !== expectedSecret) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  const { fileId, subtitles, audioTracks, status } = req.body;
  if (!fileId || !status) {
    res.status(400).json({ error: 'Missing required fields' });
    return;
  }

  try {
    const file = await db.file.findUnique({
      where: { id: fileId },
    });

    if (!file) {
      res.status(404).json({ error: 'File not found' });
      return;
    }

    // Update the processing status of the file
    await db.file.update({
      where: { id: fileId },
      data: {
        processingStatus: status, // 'completed' or 'failed'
      },
    });

    if (status === 'completed') {
      // Clean up any old tracks for this file to avoid duplicates
      await db.subtitleTrack.deleteMany({ where: { fileId } });
      await db.audioTrack.deleteMany({ where: { fileId } });

      // Create new tracks in batch
      if (Array.isArray(subtitles) && subtitles.length > 0) {
        await db.subtitleTrack.createMany({
          data: subtitles.map((sub: any) => ({
            fileId,
            label: sub.label,
            language: sub.language,
            s3Url: sub.s3Url,
          })),
        });
      }

      if (Array.isArray(audioTracks) && audioTracks.length > 0) {
        await db.audioTrack.createMany({
          data: audioTracks.map((audio: any) => ({
            fileId,
            label: audio.label,
            language: audio.language,
            s3Url: audio.s3Url,
          })),
        });
      }
    }

    console.log(
      `[Optix Webhook] Successfully registered tracks for file ${fileId} with status ${status}`,
    );
    res.status(200).json({ success: true });
  } catch (error: any) {
    console.error('[Optix Register Tracks Callback Error]:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
}

export async function optixRegisterThumbnailHandler(
  req: Request,
  res: Response,
) {
  const secret = req.headers['x-optix-secret'];
  const expectedSecret = process.env.OPTIX_SECRET || 'optix-super-secret-key';

  if (secret !== expectedSecret) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  const { fileId, thumbnailUrl } = req.body;
  if (!fileId || !thumbnailUrl) {
    res.status(400).json({ error: 'Missing required fields' });
    return;
  }

  try {
    const file = await db.file.findUnique({
      where: { id: fileId },
    });

    if (!file) {
      res.status(404).json({ error: 'File not found' });
      return;
    }

    // Update the thumbnailUrl of the file
    const updatedFile = await db.file.update({
      where: { id: fileId },
      data: {
        thumbnailUrl,
      },
    });

    console.log(
      `[Optix Webhook] Successfully registered thumbnail for file ${fileId}: ${thumbnailUrl}`,
    );
    res.status(200).json({
      success: true,
      fileId: updatedFile.id,
      thumbnailUrl: updatedFile.thumbnailUrl,
    });
  } catch (error: any) {
    console.error('[Optix Register Thumbnail Callback Error]:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
}
