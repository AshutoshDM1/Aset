import { TRPCError } from '@trpc/server';
import type { Context } from '../../../context';
import { getAllDescendantFolderIds } from './helpers';

export interface MoveInput {
  id: string;
  parentId: string | null;
}

export const moveHandler = async ({
  ctx,
  input,
}: {
  ctx: Context & { auth: { userId: string } };
  input: MoveInput;
}) => {
  if (input.parentId === input.id) {
    throw new TRPCError({
      code: 'BAD_REQUEST',
      message: 'Cannot move a folder into itself',
    });
  }
  if (input.parentId) {
    const descendants = await getAllDescendantFolderIds(ctx.db, input.id);
    if (descendants.includes(input.parentId)) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'Cannot move a folder into one of its subfolders',
      });
    }
  }
  return ctx.db.folder.update({
    where: { id: input.id, ownerId: ctx.auth.userId },
    data: { parentId: input.parentId },
  });
};
