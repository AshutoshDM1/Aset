import { TRPCError } from '@trpc/server';
import type { Context } from '../../../context';
import {
  buildObjectKey,
  presignPut,
  storageUrlForKey,
  resolvePublicFileUrl,
} from '../../../utils/r2';

export interface PresignUploadInput {
  folderId: string;
  fileName: string;
  contentType?: string;
  sizeMb: number;
}

export const presignUploadHandler = async ({
  ctx,
  input,
}: {
  ctx: Context & { auth: { userId: string } };
  input: PresignUploadInput;
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

  let canUpload = false;
  if (isOwner) {
    canUpload = true;
  } else if (isShared) {
    canUpload = folder.shares[0].canUpload;
  } else if (isPublic) {
    canUpload = folder.publicCanUpload;
  }

  if (!canUpload) {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'You do not have permission to upload files to this folder.',
    });
  }

  const storage = await ctx.db.userStorage.findUnique({
    where: { userId: ctx.auth.userId },
    select: { totalStorage: true, usedStorage: true },
  });
  if (!storage) {
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'User storage not provisioned',
    });
  }
  if (storage.usedStorage + input.sizeMb > storage.totalStorage) {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'Not enough storage available',
    });
  }
  const contentType = input.contentType?.trim() || 'application/octet-stream';
  const objectKey = buildObjectKey(
    ctx.auth.userId,
    input.folderId,
    input.fileName,
  );
  try {
    const uploadUrl = await presignPut(objectKey, contentType);
    const stored = storageUrlForKey(objectKey);
    return {
      uploadUrl,
      objectKey,
      contentType,
      url: resolvePublicFileUrl(stored),
    };
  } catch {
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Could not prepare upload (check R2 env vars)',
    });
  }
};
