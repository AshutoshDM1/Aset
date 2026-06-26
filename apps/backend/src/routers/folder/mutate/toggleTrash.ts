import type { Context } from '../../../context';

export interface ToggleTrashInput {
  id: string;
  trashed: boolean;
}

export const toggleTrashHandler = async ({
  ctx,
  input,
}: {
  ctx: Context & { auth: { userId: string } };
  input: ToggleTrashInput;
}) => {
  return ctx.db.folder.update({
    where: { id: input.id, ownerId: ctx.auth.userId },
    data: { trashed: input.trashed },
  });
};
