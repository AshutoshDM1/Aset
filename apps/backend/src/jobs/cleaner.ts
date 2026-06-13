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

// Background task to expire storage trials older than 15 days
export async function checkAndExpireTrials() {
  try {
    const now = new Date();
    const result = await db.userStorage.updateMany({
      where: {
        plan: 'trial',
        trialExpiresAt: {
          lte: now,
        },
      },
      data: {
        plan: 'free',
        totalStorage: 5 * 1024, // 5 GB free limit in MB
        trialExpiresAt: null,
      },
    });
    if (result.count > 0) {
      console.log(
        `[Cleaner] Automatically expired ${result.count} storage trials.`,
      );
    }
  } catch (err) {
    console.error('[Cleaner] Failed to clean up expired trials:', err);
  }
}

export function startStaleDecodingsCleaner() {
  // Run immediately on startup, and check every 15 minutes
  checkAndFailLongRunningDecodings();
  setInterval(checkAndFailLongRunningDecodings, 15 * 60 * 1000);

  // Check trial expiries on startup, and run every 24 hours
  checkAndExpireTrials();
  setInterval(checkAndExpireTrials, 24 * 60 * 60 * 1000);
}
