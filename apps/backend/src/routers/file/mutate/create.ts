import { TRPCError } from '@trpc/server';
import type { Context } from '../../../context';
import { enqueueMediaProcess } from '../../../utils/mediaQueue';
import {
  objectKeyPrefix,
  storageUrlForKey,
  resolvePublicFileUrl,
} from '../../../utils/r2';

export interface CreateInput {
  name: string;
  folderId: string;
  objectKey: string;
  sizeMb: number;
  decodingEnabled?: boolean;
}

export const createHandler = async ({
  ctx,
  input,
}: {
  ctx: Context & { auth: { userId: string } };
  input: CreateInput;
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

  const prefix = objectKeyPrefix(ctx.auth.userId, input.folderId);
  if (!input.objectKey.startsWith(prefix)) {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'Invalid object key',
    });
  }
  const s3Url = storageUrlForKey(input.objectKey);
  const nameLower = input.name.toLowerCase();
  const isVideo =
    nameLower.endsWith('.mkv') ||
    nameLower.endsWith('.mp4') ||
    nameLower.endsWith('.mov') ||
    nameLower.endsWith('.webm');
  const decodingRequested = input.decodingEnabled !== false; // default to true
  const shouldDecodeVideo = isVideo && decodingRequested;

  const [file] = await ctx.db.$transaction([
    ctx.db.file.create({
      data: {
        name: input.name,
        s3Url,
        sizeMb: input.sizeMb,
        ownerId: ctx.auth.userId,
        folderId: input.folderId,
        processingStatus: shouldDecodeVideo ? 'processing' : null,
        decodingEnabled: decodingRequested,
      },
      select: { id: true, name: true, s3Url: true },
    }),
    ctx.db.userStorage.update({
      where: { userId: ctx.auth.userId },
      data: { usedStorage: { increment: input.sizeMb } },
    }),
  ]);

  if (shouldDecodeVideo) {
    enqueueMediaProcess({
      fileId: file.id,
      s3Url: file.s3Url,
      fileName: file.name,
      ownerId: ctx.auth.userId,
      folderId: input.folderId,
    }).catch((err) => {
      console.error(
        `[FileRoute] Failed to enqueue background media processing for ${file.id}:`,
        err,
      );
    });
  }

  return {
    id: file.id,
    name: file.name,
    url: resolvePublicFileUrl(file.s3Url),
  };
};
