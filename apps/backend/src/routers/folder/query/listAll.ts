import type { Context } from '../../../context';

export const listAllHandler = async ({
  ctx,
}: {
  ctx: Context & { auth: { userId: string } };
}) => {
  return ctx.db.folder.findMany({
    where: { ownerId: ctx.auth.userId, trashed: false },
    orderBy: { name: 'asc' },
    select: {
      id: true,
      name: true,
      parentId: true,
    },
  });
};
