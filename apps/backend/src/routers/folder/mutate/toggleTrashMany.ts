import type { Context } from '../../../context';

export interface ToggleTrashManyInput {
  ids: string[];
  trashed: boolean;
}

export const toggleTrashManyHandler = async ({
  ctx,
  input,
}: {
  ctx: Context & { auth: { userId: string } };
  input: ToggleTrashManyInput;
}) => {
  return ctx.db.folder.updateMany({
    where: { id: { in: input.ids }, ownerId: ctx.auth.userId },
    data: { trashed: input.trashed },
  });
};
