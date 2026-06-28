import type { Context } from '../../../context';
import { resolvePublicFileUrl } from '../../../utils/r2';

export const getTrashHandler = async ({
  ctx,
}: {
  ctx: Context & { auth: { userId: string } };
}) => {
  const rows = await ctx.db.file.findMany({
    where: { ownerId: ctx.auth.userId, trashed: true },
    orderBy: { name: 'asc' },
    select: {
      id: true,
      name: true,
      createdAt: true,
      s3Url: true,
      sizeMb: true,
      starred: true,
      trashed: true,
      processingStatus: true,
      thumbnailUrl: true,
    },
  });
  return rows.map((f) => ({
    id: f.id,
    name: f.name,
    createdAt: f.createdAt,
    sizeMb: f.sizeMb,
    starred: f.starred,
    trashed: f.trashed,
    processingStatus: f.processingStatus,
    url: resolvePublicFileUrl(f.s3Url),
    thumbnailUrl: f.thumbnailUrl ? resolvePublicFileUrl(f.thumbnailUrl) : null,
  }));
};
