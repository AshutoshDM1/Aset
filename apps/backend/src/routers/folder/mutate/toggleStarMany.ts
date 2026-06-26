import type { Context } from '../../../context';

export interface ToggleStarManyInput {
  ids: string[];
  starred: boolean;
}

export const toggleStarManyHandler = async ({
  ctx,
  input,
}: {
  ctx: Context & { auth: { userId: string } };
  input: ToggleStarManyInput;
}) => {
  return ctx.db.folder.updateMany({
    where: { id: { in: input.ids }, ownerId: ctx.auth.userId },
    data: { starred: input.starred },
  });
};
