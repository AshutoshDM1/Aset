import { db } from '../utils/db';

async function main() {
  console.log(
    'Resetting all users to the Free 5 GB plan and setting hasUsedTrial to false...',
  );

  const result = await db.userStorage.updateMany({
    data: {
      plan: 'free',
      totalStorage: 5 * 1024, // 5 GB in MB (5120 MB)
      trialExpiresAt: null,
      hasUsedTrial: false,
    },
  });

  console.log(`Successfully reset storage records for ${result.count} users.`);
}

main()
  .catch((e) => {
    console.error('Error resetting user storage:', e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
