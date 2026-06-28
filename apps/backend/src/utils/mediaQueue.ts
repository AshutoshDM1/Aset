import 'dotenv/config';
import Redis from 'ioredis';

// Lazy-initialized Redis client
let redisClient: Redis | null = null;

export function getRedisClient(): Redis {
  if (!redisClient) {
    // Read URL inside the function — not at module load time.
    // This ensures dotenv has already populated process.env before we use it.
    const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

    // ioredis needs an explicit `tls` option for rediss:// (TLS) connections.
    const redisTls = redisUrl.startsWith('rediss://')
      ? { rejectUnauthorized: false }
      : undefined;

    redisClient = new Redis(redisUrl, {
      maxRetriesPerRequest: null, // required for queue patterns (BLPop-style)
      tls: redisTls,
    });
    redisClient.on('error', (err) => {
      console.error('[Redis] Connection error:', err);
    });
    redisClient.on('connect', () => {
      console.log(
        '[Redis] Connected successfully to:',
        redisUrl.replace(/:([^@]+)@/, ':***@'),
      );
    });
  }
  return redisClient;
}

export interface MediaJobPayload {
  fileId: string;
  s3Url: string;
  fileName: string;
  ownerId: string;
  folderId: string | null;
}

/**
 * Enqueues a video processing task to the Redis task list.
 */
export async function enqueueMediaProcess(payload: MediaJobPayload) {
  try {
    const client = getRedisClient();
    const queueKey = 'aset:media_tasks';
    const data = JSON.stringify(payload);

    // We push to the right of the list (RPUSH)
    await client.rpush(queueKey, data);
    console.log(
      `[MediaQueue] Enqueued media process job for file ${payload.fileId}`,
    );
  } catch (err) {
    console.error('[MediaQueue] Failed to enqueue job:', err);
  }
}

/**
 * Enqueues a thumbnail processing task to the Redis task list.
 */
export async function enqueueThumbnailProcess(payload: MediaJobPayload) {
  try {
    const client = getRedisClient();
    const queueKey = 'aset:thumbnail_tasks';
    const data = JSON.stringify(payload);

    // We push to the right of the list (RPUSH)
    await client.rpush(queueKey, data);
    console.log(
      `[MediaQueue] Enqueued thumbnail process job for file ${payload.fileId}`,
    );
  } catch (err) {
    console.error('[MediaQueue] Failed to enqueue thumbnail job:', err);
  }
}
