import { TRPCError } from '@trpc/server';
import type { Context } from '../../../context';

export interface UpdateShareSettingsInput {
  id: string;
  isPublic: boolean;
  publicCanUpload: boolean;
  showOwnerName: boolean;
  showOwnerEmail: boolean;
}

export const updateShareSettingsHandler = async ({
  ctx,
  input,
}: {
  ctx: Context & { auth: { userId: string } };
  input: UpdateShareSettingsInput;
}) => {
  const folder = await ctx.db.folder.findFirst({
    where: { id: input.id, ownerId: ctx.auth.userId },
  });
  if (!folder) {
    throw new TRPCError({
      code: 'NOT_FOUND',
      message: 'Folder not found or you are not the owner',
    });
  }
  return ctx.db.folder.update({
    where: { id: input.id },
    data: {
      isPublic: input.isPublic,
      publicCanUpload: input.publicCanUpload,
      showOwnerName: input.showOwnerName,
      showOwnerEmail: input.showOwnerEmail,
    },
  });
};
