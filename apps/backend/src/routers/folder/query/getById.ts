import { TRPCError } from '@trpc/server';
import type { Context } from '../../../context';

export interface GetByIdInput {
  id: string;
}

export const getByIdHandler = async ({
  ctx,
  input,
}: {
  ctx: Context & { auth: { userId: string } };
  input: GetByIdInput;
}) => {
  const currentUser = await ctx.db.user.findUnique({
    where: { id: ctx.auth.userId },
  });
  const userEmail = currentUser?.email || ctx.auth.email || '';

  const folder = await ctx.db.folder.findUnique({
    where: { id: input.id },
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

  let canUpload = false;
  if (isOwner) {
    canUpload = true;
  } else if (isShared) {
    canUpload = folder.shares[0].canUpload;
  } else if (isPublic) {
    canUpload = folder.publicCanUpload;
  }

  let ownerName: string | null = null;
  let ownerEmail: string | null = null;

  if (isOwner || folder.showOwnerName || folder.showOwnerEmail) {
    const ownerUser = await ctx.db.user.findUnique({
      where: { id: folder.ownerId },
    });
    if (ownerUser) {
      if (isOwner || folder.showOwnerName) ownerName = ownerUser.name;
      if (isOwner || folder.showOwnerEmail) ownerEmail = ownerUser.email;
    }
  }

  return {
    id: folder.id,
    name: folder.name,
    parentId: folder.parentId,
    createdAt: folder.createdAt,
    starred: folder.starred,
    trashed: folder.trashed,
    ownerId: folder.ownerId,
    isPublic: folder.isPublic,
    publicCanUpload: folder.publicCanUpload,
    showOwnerName: folder.showOwnerName,
    showOwnerEmail: folder.showOwnerEmail,
    canUpload,
    ownerName,
    ownerEmail,
  };
};
