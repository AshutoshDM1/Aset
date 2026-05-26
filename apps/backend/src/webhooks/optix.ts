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
