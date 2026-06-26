import { TRPCError } from '@trpc/server';
import type { Context } from '../../../context';
import { extractObjectKey, presignGet } from '../../../utils/r2';

export interface GetDownloadUrlInput {
  id: string;
}

export const getDownloadUrlHandler = async ({
  ctx,
  input,
}: {
  ctx: Context & { auth: { userId: string } };
  input: GetDownloadUrlInput;
}) => {
  const file = await ctx.db.file.findUnique({
    where: { id: input.id },
  });
  if (!file) {
    throw new TRPCError({
      code: 'NOT_FOUND',
      message: 'File not found',
    });
  }

  const isFileOwner = file.ownerId === ctx.auth.userId;
  let hasAccess = isFileOwner;

  if (!hasAccess && file.folderId) {
    const currentUser = await ctx.db.user.findUnique({
      where: { id: ctx.auth.userId },
    });
    const userEmail = currentUser?.email || ctx.auth.email || '';

    const folder = await ctx.db.folder.findUnique({
      where: { id: file.folderId },
      include: {
        shares: {
          where: { email: userEmail.toLowerCase().trim() },
        },
      },
    });

    if (folder) {
      const isFolderOwner = folder.ownerId === ctx.auth.userId;
      const isFolderShared = folder.shares.length > 0;
      const isFolderPublic = folder.isPublic;

      if (isFolderOwner || isFolderShared || isFolderPublic) {
        hasAccess = true;
      }
    }
  }

  if (!hasAccess) {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message:
        'Access denied: You do not have permission to download this file.',
    });
  }

  const objectKey = extractObjectKey(file.s3Url);
  const downloadUrl = await presignGet(objectKey, file.name);

  await ctx.db.fileDownload.create({
    data: {
      fileId: file.id,
      userId: ctx.auth.userId,
    },
  });

  return { downloadUrl };
};
