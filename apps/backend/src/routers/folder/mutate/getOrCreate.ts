import type { Context } from '../../../context';

export interface GetOrCreateInput {
  name: string;
  parentId?: string | null;
}

export const getOrCreateHandler = async ({
  ctx,
  input,
}: {
  ctx: Context & { auth: { userId: string } };
  input: GetOrCreateInput;
}) => {
  const parentId = input.parentId ?? null;
  const existing = await ctx.db.folder.findFirst({
    where: {
      name: input.name,
      parentId,
      ownerId: ctx.auth.userId,
      trashed: false,
    },
  });
  if (existing) {
    return { id: existing.id, name: existing.name };
  }
  const folder = await ctx.db.folder.create({
    data: {
      name: input.name,
      ownerId: ctx.auth.userId,
      parentId,
    },
  });
  return { id: folder.id, name: folder.name };
};
