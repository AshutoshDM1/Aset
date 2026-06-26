import { TRPCError } from '@trpc/server';
import type { Context } from '../../../context';

export interface MoveManyInput {
  ids: string[];
  folderId: string | null;
}

export const moveManyHandler = async ({
  ctx,
  input,
}: {
  ctx: Context & { auth: { userId: string } };
  input: MoveManyInput;
}) => {
  if (input.folderId) {
    const folder = await ctx.db.folder.findFirst({
      where: {
        id: input.folderId,
        ownerId: ctx.auth.userId,
        trashed: false,
      },
    });
    if (!folder) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Target folder not found',
      });
    }
  }
  return ctx.db.file.updateMany({
    where: { id: { in: input.ids }, ownerId: ctx.auth.userId },
    data: { folderId: input.folderId },
  });
};
