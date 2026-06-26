import { TRPCError } from '@trpc/server';
import type { Context } from '../../../context';
import { resolvePublicFileUrl } from '../../../utils/r2';

export interface ListByFolderInput {
  folderId: string;
}

export const listByFolderHandler = async ({
  ctx,
  input,
}: {
  ctx: Context & { auth: { userId: string } };
  input: ListByFolderInput;
}) => {
  const currentUser = await ctx.db.user.findUnique({
    where: { id: ctx.auth.userId },
  });
  const userEmail = currentUser?.email || ctx.auth.email || '';

  const folder = await ctx.db.folder.findUnique({
    where: { id: input.folderId },
    include: {
      shares: {
        where: { email: userEmail.toLowerCase().trim() },
      },
    },
  });

  if (!folder) {
    throw new TRPCError({
      code: 'NOT_FOUND',
      message: 'Folder not found',
    });
  }

  const isOwner = folder.ownerId === ctx.auth.userId;
  const isShared = folder.shares.length > 0;
  const isPublic = folder.isPublic;

  if (!isOwner && !isShared && !isPublic) {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'Access denied: You do not have permission to open this folder.',
    });
  }

  const rows = await ctx.db.file.findMany({
    where: {
      folderId: input.folderId,
      trashed: false,
    },
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
  }));
};
