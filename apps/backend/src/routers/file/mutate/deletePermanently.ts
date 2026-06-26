import { TRPCError } from '@trpc/server';
import type { Context } from '../../../context';
import { extractObjectKey, deleteObject } from '../../../utils/r2';

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
  const file = await ctx.db.file.findFirst({
    where: { id: input.id, ownerId: ctx.auth.userId },
  });
  if (!file) {
    throw new TRPCError({
      code: 'NOT_FOUND',
      message: 'File not found',
    });
  }

  try {
    const objectKey = extractObjectKey(file.s3Url);
    await deleteObject(objectKey);
  } catch (err) {
    console.error('Failed to delete file from S3:', err);
  }

  await ctx.db.$transaction([
    ctx.db.file.delete({
      where: { id: input.id },
    }),
    ctx.db.userStorage.update({
      where: { userId: ctx.auth.userId },
      data: { usedStorage: { decrement: file.sizeMb } },
    }),
  ]);

  return { success: true };
};
