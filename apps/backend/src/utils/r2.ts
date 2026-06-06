import {
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { randomUUID } from 'node:crypto';

export function getR2Client(): S3Client {
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

const r2Client = getR2Client;

function publicBase(): string {
  return (
    process.env.R2_PUBLIC_BASE_URL?.trim().replace(/\/$/, '') ||
    process.env.R2_PUBLIC_URL?.trim().replace(/\/$/, '') ||
    ''
  );
}

export function sanitizeFileName(name: string): string {
  const base = name.replace(/^.*[/\\]/, '').replace(/\0/g, '');
  const cleaned = base.replace(/[^\w.\-()+ ]+/g, '_').slice(0, 200);
  return cleaned || 'file';
}

export function buildObjectKey(
  userId: string,
  folderId: string | number,
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

/** Value stored in DB: public URL when `R2_PUBLIC_BASE_URL` is set, else object key. */
export function storageUrlForKey(objectKey: string): string {
  const base = publicBase();
  if (base) return `${base}/${objectKey}`;
  return objectKey;
}

/** Browser URL for a DB value (full URL or key + public base). */
export function resolvePublicFileUrl(stored: string): string {
  const s = stored.trim();
  if (/^https?:\/\//i.test(s)) return s;
  const base = publicBase();
  if (base) return `${base}/${s}`;
  return '';
}

export function objectKeyPrefix(
  userId: string,
  folderId: string | number,
): string {
  return `${userId}/${folderId}/`;
}

export function extractObjectKey(storedUrl: string): string {
  const base = publicBase();
  if (base && storedUrl.startsWith(base)) {
    return storedUrl.slice(base.length).replace(/^\//, '');
  }
  if (/^https?:\/\//i.test(storedUrl)) {
    try {
      const url = new URL(storedUrl);
      return decodeURIComponent(url.pathname.replace(/^\//, ''));
    } catch {
      return storedUrl;
    }
  }
  return storedUrl;
}

export async function presignGet(
  objectKey: string,
  fileName: string,
): Promise<string> {
  const bucket = process.env.R2_BUCKET?.trim();
  if (!bucket) throw new Error('R2_BUCKET is required');
  const client = r2Client();
  const command = new GetObjectCommand({
    Bucket: bucket,
    Key: objectKey,
    ResponseContentDisposition: `attachment; filename="${sanitizeFileName(fileName)}"`,
  });
  return getSignedUrl(client, command, { expiresIn: 300 });
}

export async function deleteObject(objectKey: string): Promise<void> {
  const bucket = process.env.R2_BUCKET?.trim();
  if (!bucket) throw new Error('R2_BUCKET is required');
  const client = r2Client();
  const command = new DeleteObjectCommand({
    Bucket: bucket,
    Key: objectKey,
  });
  await client.send(command);
}

export async function uploadObject(
  objectKey: string,
  body: Buffer,
  contentType: string,
): Promise<void> {
  const bucket = process.env.R2_BUCKET?.trim();
  if (!bucket) throw new Error('R2_BUCKET is required');
  const client = r2Client();
  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: objectKey,
    Body: body,
    ContentType: contentType,
  });
  await client.send(command);
}
