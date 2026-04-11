import {
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { randomUUID } from 'node:crypto';

function r2Client(): S3Client {
  const endpoint = process.env.R2_ENDPOINT?.trim();
  const accessKeyId = process.env.R2_ACCESS_KEY_ID?.trim();
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY?.trim();
  if (!endpoint || !accessKeyId || !secretAccessKey) {
    throw new Error(
      'R2_ENDPOINT, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY are required',
    );
  }
  return new S3Client({
    region: 'auto',
    endpoint,
    credentials: { accessKeyId, secretAccessKey },
    forcePathStyle: true,
  });
}

export function sanitizeFileName(name: string): string {
  const base = name.replace(/^.*[/\\]/, '').replace(/\0/g, '');
  const cleaned = base.replace(/[^\w.\-()+ ]+/g, '_').slice(0, 200);
  return cleaned || 'file';
}

export function buildObjectKey(
  userId: string,
  folderId: number,
  fileName: string,
): string {
  const safe = sanitizeFileName(fileName);
  return `${userId}/${folderId}/${randomUUID()}-${safe}`;
}

export async function presignPut(
  objectKey: string,
  contentType: string,
): Promise<string> {
  const bucket = process.env.R2_BUCKET?.trim();
  if (!bucket) throw new Error('R2_BUCKET is required');
  const client = r2Client();
  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: objectKey,
    ContentType: contentType,
  });
  return getSignedUrl(client, command, { expiresIn: 300 });
}

/** Public URL if R2_PUBLIC_BASE_URL is set; otherwise stores the object key only. */
export function storageUrlForKey(objectKey: string): string {
  const base = process.env.R2_PUBLIC_BASE_URL?.trim().replace(/\/$/, '');
  if (base) return `${base}/${objectKey}`;
  return objectKey;
}

function publicBase(): string {
  return (
    process.env.R2_PUBLIC_BASE_URL?.trim().replace(/\/$/, '') ||
    process.env.R2_PUBLIC_URL?.trim().replace(/\/$/, '') ||
    ''
  );
}

/** DB value may be a full URL or an object key; returns a browser URL or "" if not public. */
export function resolvePublicFileUrl(stored: string): string {
  const s = stored.trim();
  if (/^https?:\/\//i.test(s)) return s;
  const base = publicBase();
  if (base) return `${base}/${s}`;
  return '';
}

/** S3 object key from DB (raw key or path of a public URL we stored). */
export function objectKeyFromStored(stored: string): string {
  const s = stored.trim();
  if (!s) return s;
  if (/^https?:\/\//i.test(s)) {
    try {
      return new URL(s).pathname.replace(/^\//, '');
    } catch {
      return s;
    }
  }
  return s;
}

export async function presignGetObject(objectKey: string): Promise<string> {
  const bucket = process.env.R2_BUCKET?.trim();
  if (!bucket) throw new Error('R2_BUCKET is required');
  const client = r2Client();
  const command = new GetObjectCommand({
    Bucket: bucket,
    Key: objectKey,
  });
  return getSignedUrl(client, command, { expiresIn: 3600 });
}

/** Public URL when R2_PUBLIC_BASE_URL is set; otherwise a time-limited presigned GET URL. */
export async function urlForStoredFile(stored: string): Promise<string> {
  const direct = resolvePublicFileUrl(stored);
  if (direct) return direct;
  const key = objectKeyFromStored(stored);
  if (!key) return '';
  try {
    return await presignGetObject(key);
  } catch {
    return '';
  }
}

export function objectKeyPrefix(userId: string, folderId: number): string {
  return `${userId}/${folderId}/`;
}
