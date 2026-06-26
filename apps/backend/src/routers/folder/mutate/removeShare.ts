import { TRPCError } from '@trpc/server';
import type { Context } from '../../../context';

export interface RemoveShareInput {
  folderId: string;
  shareId: string;
}

export const removeShareHandler = async ({
  ctx,
  input,
}: {
  ctx: Context & { auth: { userId: string } };
  input: RemoveShareInput;
}) => {
  const folder = await ctx.db.folder.findFirst({
    where: { id: input.folderId, ownerId: ctx.auth.userId },
  });
  if (!folder) {
    throw new TRPCError({
      code: 'NOT_FOUND',
      message: 'Folder not found or you are not the owner',
    });
  }
  return ctx.db.folderShare.delete({
    where: { id: input.shareId },
  });
};
