import { TRPCError } from '@trpc/server';
import type { Context } from '../../../context';

export interface CreateInput {
  name: string;
  parentId?: string;
}

export const createHandler = async ({
  ctx,
  input,
}: {
  ctx: Context & { auth: { userId: string } };
  input: CreateInput;
}) => {
  if (input.parentId != null) {
    const parent = await ctx.db.folder.findFirst({
      where: { id: input.parentId, ownerId: ctx.auth.userId },
    });
    if (!parent) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Parent folder not found',
      });
    }
  }
  const folder = await ctx.db.folder.create({
    data: {
      name: input.name,
      ownerId: ctx.auth.userId,
      parentId: input.parentId ?? null,
    },
  });
  return { id: folder.id, name: folder.name };
};
