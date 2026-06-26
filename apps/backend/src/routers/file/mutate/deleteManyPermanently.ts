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
    select: { id: true, s3Url: true, sizeMb: true },
  });
  if (files.length === 0) return { success: true };

  for (const file of files) {
    try {
      const objectKey = extractObjectKey(file.s3Url);
      await deleteObject(objectKey);
    } catch (err) {
      console.error(`Failed to delete file from S3:`, err);
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
