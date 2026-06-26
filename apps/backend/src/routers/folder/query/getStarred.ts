import type { Context } from '../../../context';

export const getStarredHandler = async ({
  ctx,
}: {
  ctx: Context & { auth: { userId: string } };
}) => {
  const folders = await ctx.db.folder.findMany({
    where: { ownerId: ctx.auth.userId, starred: true, trashed: false },
    orderBy: { name: 'asc' },
    select: {
      id: true,
      name: true,
      createdAt: true,
      starred: true,
      trashed: true,
      files: { select: { sizeMb: true } },
    },
  });
  return folders.map((f) => ({
    id: f.id,
    name: f.name,
    createdAt: f.createdAt,
    starred: f.starred,
    trashed: f.trashed,
    sizeMb: f.files.reduce((acc, file) => acc + file.sizeMb, 0),
  }));
};
