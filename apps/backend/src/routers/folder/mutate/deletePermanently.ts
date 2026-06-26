import { TRPCError } from '@trpc/server';
import type { Context } from '../../../context';
import { extractObjectKey, deleteObject } from '../../../utils/r2';
import { getAllDescendantFolderIds } from './helpers';

export interface DeletePermanentlyInput {
  id: string;
}

export const deletePermanentlyHandler = async ({
  ctx,
  input,
}: {
  ctx: Context & { auth: { userId: string } };
  input: DeletePermanentlyInput;
}) => {
  const folder = await ctx.db.folder.findFirst({
    where: { id: input.id, ownerId: ctx.auth.userId },
  });
  if (!folder) {
    throw new TRPCError({
      code: 'NOT_FOUND',
      message: 'Folder not found',
    });
  }

  // 1. Get all descendant folder IDs recursively
  const allFolderIds = await getAllDescendantFolderIds(ctx.db, input.id);

  // 2. Find all files inside these folders
  const files = await ctx.db.file.findMany({
    where: { folderId: { in: allFolderIds } },
    select: { id: true, s3Url: true, sizeMb: true },
  });

  // 3. Delete files from R2/S3
  for (const file of files) {
    try {
      const objectKey = extractObjectKey(file.s3Url);
      await deleteObject(objectKey);
    } catch (err) {
      console.error(`Failed to delete file ${file.id} from R2:`, err);
    }
  }

  // 4. Calculate total storage size to reclaim
  const totalSizeMb = files.reduce((sum, f) => sum + f.sizeMb, 0);

  // 5. Delete root folder from DB (which cascades child folders & files) & Decrement storage
  const transactions: any[] = [
    ctx.db.folder.delete({
      where: { id: input.id },
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
