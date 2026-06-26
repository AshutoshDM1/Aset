import { TRPCError } from '@trpc/server';
import type { Context } from '../../../context';

export interface GetShareSettingsInput {
  id: string;
}

export const getShareSettingsHandler = async ({
  ctx,
  input,
}: {
  ctx: Context & { auth: { userId: string } };
  input: GetShareSettingsInput;
}) => {
  const folder = await ctx.db.folder.findFirst({
    where: { id: input.id, ownerId: ctx.auth.userId },
    include: {
      shares: {
        orderBy: { email: 'asc' },
      },
    },
  });
  if (!folder) {
    throw new TRPCError({
      code: 'NOT_FOUND',
      message: 'Folder not found or you are not the owner',
    });
  }
  return {
    isPublic: folder.isPublic,
    publicCanUpload: folder.publicCanUpload,
    showOwnerName: folder.showOwnerName,
    showOwnerEmail: folder.showOwnerEmail,
    shares: folder.shares.map((s) => ({
      id: s.id,
      email: s.email,
      canUpload: s.canUpload,
    })),
  };
};
