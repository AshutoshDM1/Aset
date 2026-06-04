import { Router, Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { db } from '../utils/db';
import { decryptSecret } from '../utils/crypto';
import {
  buildObjectKey,
  presignPut,
  storageUrlForKey,
  resolvePublicFileUrl,
  objectKeyPrefix,
} from '../utils/r2';

export const sdkRouter = Router();

// Helper to canonicalize objects by sorting keys to prevent JSON stringification order mismatches
function canonicalize(obj: any): string {
  if (!obj || typeof obj !== 'object' || Object.keys(obj).length === 0)
    return '';
  const sorted: any = {};
  Object.keys(obj)
    .sort()
    .forEach((key) => {
      sorted[key] = obj[key];
    });
  return JSON.stringify(sorted);
}

// Extend Request interface to hold SDK credentials
export interface SdkRequest extends Request {
  sdkUser?: {
    id: string;
    allowedFolderId: string | null;
  };
}

/**
 * Middleware to verify Option B: Signed HMAC Requests
 */
async function authenticateSdk(
  req: SdkRequest,
  res: Response,
  next: NextFunction,
) {
  const apiKeyId = req.headers['x-aset-key'] as string;
  const timestampStr = req.headers['x-aset-timestamp'] as string;
  const signature = req.headers['x-aset-signature'] as string;

  if (!apiKeyId || !timestampStr || !signature) {
    res
      .status(401)
      .json({ error: 'Missing required SDK authentication headers' });
    return;
  }

  // 1. Verify timestamp is within 5 minutes sliding window (prevent replay attacks)
  const timestamp = Number(timestampStr);
  const now = Date.now();
  if (isNaN(timestamp) || Math.abs(now - timestamp) > 5 * 60 * 1000) {
    res
      .status(401)
      .json({ error: 'Request timestamp is invalid or has expired' });
    return;
  }

  try {
    // 2. Fetch the API Key from database
    const apiKey = await db.apiKey.findUnique({
      where: { keyId: apiKeyId },
    });

    if (!apiKey) {
      res.status(401).json({ error: 'Invalid API Key ID' });
      return;
    }

    // 3. Decrypt the stored secret key
    const rawSecret = decryptSecret(apiKey.secretHash);

    // 4. Reconstruct the canonical request string
    // Format: METHOD\nPATH\nTIMESTAMP\nCANONICAL_QUERY\nCANONICAL_BODY
    const canonicalQuery = canonicalize(req.query);
    const canonicalBody = req.method !== 'GET' ? canonicalize(req.body) : '';
    const fullPath = (req.baseUrl + req.path).replace(/\/+/g, '/');
    const canonicalString = [
      req.method,
      fullPath,
      timestampStr,
      canonicalQuery,
      canonicalBody,
    ].join('\n');

    // 5. Verify the HMAC signature
    const computedSignature = crypto
      .createHmac('sha256', rawSecret)
      .update(canonicalString)
      .digest('hex');

    const signatureBuffer = Buffer.from(signature, 'hex');
    const computedBuffer = Buffer.from(computedSignature, 'hex');

    if (
      signatureBuffer.length !== computedBuffer.length ||
      !crypto.timingSafeEqual(signatureBuffer, computedBuffer)
    ) {
      res.status(401).json({ error: 'Invalid HMAC signature' });
      return;
    }

    // 6. Set authenticated user details on request
    req.sdkUser = {
      id: apiKey.userId,
      allowedFolderId: apiKey.folderId,
    };

    next();
  } catch (err: any) {
    console.error('[SDK Auth Error]:', err);
    res.status(500).json({ error: 'Internal SDK authentication error' });
  }
}

/**
 * 1. POST /api/sdk/presign-upload
 * Prepares a presigned upload URL directly to R2/S3
 */
sdkRouter.post(
  '/presign-upload',
  authenticateSdk,
  async (req: SdkRequest, res: Response) => {
    const { fileName, contentType, sizeMb, folderId } = req.body;
    const userId = req.sdkUser!.id;
    const allowedFolderId = req.sdkUser!.allowedFolderId;

    if (!fileName || !sizeMb) {
      res.status(400).json({ error: 'Missing fileName or sizeMb' });
      return;
    }

    // Enforce folder restriction if the API key is tied to a specific folder
    const targetFolderId = allowedFolderId || folderId || 'root';

    if (allowedFolderId && folderId && folderId !== allowedFolderId) {
      res.status(403).json({
        error:
          'Access denied: This API key is restricted to a specific folder.',
      });
      return;
    }

    try {
      // Check user storage quota
      const storage = await db.userStorage.findUnique({
        where: { userId },
      });

      if (!storage) {
        res.status(500).json({ error: 'User storage quota not initialized' });
        return;
      }

      if (storage.usedStorage + Number(sizeMb) > storage.totalStorage) {
        res
          .status(403)
          .json({ error: 'Upload exceeds available storage quota' });
        return;
      }

      // Build S3 Object Key and generate presigned URL
      const resolvedContentType = contentType || 'application/octet-stream';
      const objectKey = buildObjectKey(userId, targetFolderId, fileName);
      const uploadUrl = await presignPut(objectKey, resolvedContentType);
      const publicUrl = storageUrlForKey(objectKey);

      res.status(200).json({
        uploadUrl,
        objectKey,
        publicUrl: resolvePublicFileUrl(publicUrl),
      });
    } catch (err: any) {
      console.error('[SDK Presign Error]:', err);
      res.status(550).json({ error: err.message || 'Internal server error' });
    }
  },
);

/**
 * 2. POST /api/sdk/register-file
 * Registers a successfully uploaded S3 object in the DB and updates user storage quota
 */
sdkRouter.post(
  '/register-file',
  authenticateSdk,
  async (req: SdkRequest, res: Response) => {
    const { name, objectKey, sizeMb, folderId } = req.body;
    const userId = req.sdkUser!.id;
    const allowedFolderId = req.sdkUser!.allowedFolderId;

    if (!name || !objectKey || !sizeMb) {
      res.status(400).json({ error: 'Missing name, objectKey, or sizeMb' });
      return;
    }

    const targetFolderId = allowedFolderId || folderId || 'root';

    // Verify the object key belongs to this user and folder prefix to prevent spoofing
    const prefix = objectKeyPrefix(userId, targetFolderId);
    if (!objectKey.startsWith(prefix)) {
      res.status(403).json({ error: 'Invalid object key prefix' });
      return;
    }

    try {
      const s3Url = storageUrlForKey(objectKey);

      const [newFile] = await db.$transaction([
        db.file.create({
          data: {
            name,
            s3Url,
            sizeMb: Number(sizeMb),
            ownerId: userId,
            folderId: targetFolderId === 'root' ? null : targetFolderId,
          },
        }),
        db.userStorage.update({
          where: { userId },
          data: { usedStorage: { increment: Number(sizeMb) } },
        }),
      ]);

      res.status(200).json({
        id: newFile.id,
        name: newFile.name,
        url: resolvePublicFileUrl(newFile.s3Url),
        sizeMb: newFile.sizeMb,
        createdAt: newFile.createdAt,
      });
    } catch (err: any) {
      console.error('[SDK Register Error]:', err);
      res
        .status(500)
        .json({ error: err.message || 'Failed to register file in database' });
    }
  },
);

/**
 * 3. GET /api/sdk/list-files
 * Fetches all files/images inside a specified folder
 */
sdkRouter.get(
  '/list-files',
  authenticateSdk,
  async (req: SdkRequest, res: Response) => {
    const folderId = req.query.folderId as string;
    const userId = req.sdkUser!.id;
    const allowedFolderId = req.sdkUser!.allowedFolderId;

    const targetFolderId = allowedFolderId || folderId || 'root';

    if (allowedFolderId && folderId && folderId !== allowedFolderId) {
      res.status(403).json({
        error:
          'Access denied: This API key is restricted to a specific folder.',
      });
      return;
    }

    try {
      const files = await db.file.findMany({
        where: {
          ownerId: userId,
          folderId: targetFolderId === 'root' ? null : targetFolderId,
          trashed: false,
        },
        orderBy: { createdAt: 'desc' },
      });

      const result = files.map((f) => ({
        id: f.id,
        name: f.name,
        url: resolvePublicFileUrl(f.s3Url),
        sizeMb: f.sizeMb,
        starred: f.starred,
        createdAt: f.createdAt,
      }));

      res.status(200).json({ files: result });
    } catch (err: any) {
      console.error('[SDK List Files Error]:', err);
      res.status(500).json({ error: err.message || 'Failed to list files' });
    }
  },
);
