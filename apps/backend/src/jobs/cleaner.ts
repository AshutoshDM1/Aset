import { db } from '../utils/db';

// Background task to automatically fail video decodings that take > 5 hours
export async function checkAndFailLongRunningDecodings() {
  try {
    const fiveHoursAgo = new Date(Date.now() - 5 * 60 * 60 * 1000);
    const result = await db.file.updateMany({
      where: {
        processingStatus: 'processing',
        createdAt: {
          lt: fiveHoursAgo,
        },
      },
      data: {
        processingStatus: 'failed',
      },
    });
    if (result.count > 0) {
      console.log(
        `[Cleaner] Automatically marked ${result.count} stale video decodings as failed.`,
      );
    }
  } catch (err) {
    console.error('[Cleaner] Failed to clean up stale decodings:', err);
  }
}

export function startStaleDecodingsCleaner() {
  // Run immediately on startup, and check every 15 minutes
  checkAndFailLongRunningDecodings();
  setInterval(checkAndFailLongRunningDecodings, 15 * 60 * 1000);
}
