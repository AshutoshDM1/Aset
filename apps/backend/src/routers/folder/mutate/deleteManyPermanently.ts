import type { Context } from '../../../context';
import { extractObjectKey, deleteObject } from '../../../utils/r2';
import { getAllDescendantFolderIds } from './helpers';

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
  const folders = await ctx.db.folder.findMany({
    where: { id: { in: input.ids }, ownerId: ctx.auth.userId },
  });
  if (folders.length === 0) return { success: true };

  const allFolderIds: string[] = [];
  for (const id of input.ids) {
    const descendants = await getAllDescendantFolderIds(ctx.db, id);
    allFolderIds.push(...descendants);
  }
  const uniqueFolderIds = Array.from(new Set(allFolderIds));

  const files = await ctx.db.file.findMany({
    where: { folderId: { in: uniqueFolderIds } },
    select: { id: true, s3Url: true, sizeMb: true },
  });

  for (const file of files) {
    try {
      const objectKey = extractObjectKey(file.s3Url);
      await deleteObject(objectKey);
    } catch (err) {
      console.error(`Failed to delete file ${file.id} from R2:`, err);
    }
  }

  const totalSizeMb = files.reduce((sum, f) => sum + f.sizeMb, 0);

  const transactions: any[] = [
    ctx.db.folder.deleteMany({
      where: { id: { in: uniqueFolderIds } },
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
