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
    include: { subtitles: true, audioTracks: true },
  });
  if (!file) {
    throw new TRPCError({
      code: 'NOT_FOUND',
      message: 'File not found',
    });
  }

  const keysToDelete: string[] = [];
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

  for (const key of keysToDelete) {
    try {
      await deleteObject(key);
    } catch (err) {
      console.error(`Failed to delete S3 asset ${key}:`, err);
    }
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
