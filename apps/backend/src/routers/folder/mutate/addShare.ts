import { TRPCError } from '@trpc/server';
import type { Context } from '../../../context';

export interface AddShareInput {
  folderId: string;
  email: string;
  canUpload: boolean;
}

export const addShareHandler = async ({
  ctx,
  input,
}: {
  ctx: Context & { auth: { userId: string } };
  input: AddShareInput;
}) => {
  const folder = await ctx.db.folder.findFirst({
    where: { id: input.folderId, ownerId: ctx.auth.userId },
  });
  if (!folder) {
    throw new TRPCError({
      code: 'NOT_FOUND',
      message: 'Folder not found or you are not the owner',
    });
  }

  const email = input.email.toLowerCase().trim();

  const existingShare = await ctx.db.folderShare.findUnique({
    where: {
      folderId_email: {
        folderId: input.folderId,
        email,
      },
    },
  });

  const result = await ctx.db.folderShare.upsert({
    where: {
      folderId_email: {
        folderId: input.folderId,
        email,
      },
    },
    create: {
      folderId: input.folderId,
      email,
      canUpload: input.canUpload,
    },
    update: {
      canUpload: input.canUpload,
    },
  });

  // If newly shared, check if recipient user is registered and create a Notification
  if (!existingShare) {
    const recipient = await ctx.db.user.findFirst({
      where: {
        email: {
          equals: email,
          mode: 'insensitive',
        },
      },
    });
    if (recipient) {
      const sharer = await ctx.db.user.findUnique({
        where: { id: ctx.auth.userId },
        select: { name: true, email: true },
      });
      const sharerName = sharer?.name || sharer?.email || 'Someone';

      await ctx.db.notification.create({
        data: {
          userId: recipient.id,
          title: 'Folder Shared',
          message: `${sharerName} shared the folder "${folder.name}" with you.`,
        },
      });
    }
  }

  return result;
};
