import { TRPCError } from '@trpc/server';
import type { Context } from '../../../context';

export interface ListInput {
  parentId?: string | null;
}

export const listHandler = async ({
  ctx,
  input,
}: {
  ctx: Context & { auth: { userId: string } };
  input?: ListInput;
}) => {
  const parentId = input?.parentId ?? null;

  if (parentId) {
    const currentUser = await ctx.db.user.findUnique({
      where: { id: ctx.auth.userId },
    });
    const userEmail = currentUser?.email || ctx.auth.email || '';

    const parentFolder = await ctx.db.folder.findUnique({
      where: { id: parentId },
      include: {
        shares: { where: { email: userEmail.toLowerCase().trim() } },
      },
    });

    if (!parentFolder) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Parent folder not found',
      });
    }

    const isOwner = parentFolder.ownerId === ctx.auth.userId;
    const isShared = parentFolder.shares.length > 0;
    const isPublic = parentFolder.isPublic;

    if (!isOwner && !isShared && !isPublic) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: 'Access denied to this folder',
      });
    }

    const folders = await ctx.db.folder.findMany({
      where: { parentId, trashed: false },
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
  } else {
    const folders = await ctx.db.folder.findMany({
      where: { ownerId: ctx.auth.userId, parentId: null, trashed: false },
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
  }
};
