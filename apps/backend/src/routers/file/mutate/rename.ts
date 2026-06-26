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
  const file = await ctx.db.file.findFirst({
    where: { id: input.id, ownerId: ctx.auth.userId },
  });
  if (!file) {
    throw new TRPCError({
      code: 'NOT_FOUND',
      message: 'File not found',
    });
  }
  return ctx.db.file.update({
    where: { id: input.id },
    data: { name: input.name },
  });
};
