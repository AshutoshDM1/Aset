import type { Context } from '../../../context';
import { extractObjectKey, deleteObject } from '../../../utils/r2';

export interface DeleteManyPermanentlyInput {
  ids: string[];
}

export const deleteManyPermanentlyHandler = async ({
  ctx,
  input,
}: {
  ctx: Context & { auth: { userId: string } };
  input: DeleteManyPermanentlyInput;
}) => {
  const files = await ctx.db.file.findMany({
    where: { id: { in: input.ids }, ownerId: ctx.auth.userId },
    include: { subtitles: true, audioTracks: true },
  });
  if (files.length === 0) return { success: true };

  const keysToDelete: string[] = [];
  for (const file of files) {
    keysToDelete.push(extractObjectKey(file.s3Url));
    if (file.thumbnailUrl) {
      keysToDelete.push(extractObjectKey(file.thumbnailUrl));
    }
    file.subtitles.forEach((sub) => {
      keysToDelete.push(extractObjectKey(sub.s3Url));
    });
    file.audioTracks.forEach((aud) => {
      keysToDelete.push(extractObjectKey(aud.s3Url));
    });
  }

  for (const key of keysToDelete) {
    try {
      await deleteObject(key);
    } catch (err) {
      console.error(`Failed to delete S3 asset ${key}:`, err);
    }
  }

  const totalSizeMb = files.reduce((sum, f) => sum + f.sizeMb, 0);

  const transactions: any[] = [
    ctx.db.file.deleteMany({
      where: { id: { in: input.ids }, ownerId: ctx.auth.userId },
    }),
  ];
  if (totalSizeMb > 0) {
    transactions.push(
      ctx.db.userStorage.update({
        where: { userId: ctx.auth.userId },
        data: { usedStorage: { decrement: totalSizeMb } },
      }),
    );
  }
  await ctx.db.$transaction(transactions);

  return { success: true };
};
