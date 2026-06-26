import { TRPCError } from '@trpc/server';
import type { Context } from '../../../context';

export interface RenameInput {
  id: string;
  name: string;
}

export const renameHandler = async ({
  ctx,
  input,
}: {
  ctx: Context & { auth: { userId: string } };
  input: RenameInput;
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
  return ctx.db.folder.update({
    where: { id: input.id },
    data: { name: input.name },
  });
};
