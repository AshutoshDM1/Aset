import { TRPCError } from '@trpc/server';
import type { Context } from '../../../context';
import { getAllDescendantFolderIds } from './helpers';

export interface MoveManyInput {
  ids: string[];
  parentId: string | null;
}

export const moveManyHandler = async ({
  ctx,
  input,
}: {
  ctx: Context & { auth: { userId: string } };
  input: MoveManyInput;
}) => {
  for (const id of input.ids) {
    if (input.parentId === id) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'Cannot move a folder into itself',
      });
    }
    if (input.parentId) {
      const descendants = await getAllDescendantFolderIds(ctx.db, id);
      if (descendants.includes(input.parentId)) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Cannot move a folder into one of its subfolders',
        });
      }
    }
  }
  return ctx.db.folder.updateMany({
    where: { id: { in: input.ids }, ownerId: ctx.auth.userId },
    data: { parentId: input.parentId },
  });
};
