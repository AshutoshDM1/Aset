import type { Context } from '../../../context';

export interface ToggleStarInput {
  id: string;
  starred: boolean;
}

export const toggleStarHandler = async ({
  ctx,
  input,
}: {
  ctx: Context & { auth: { userId: string } };
  input: ToggleStarInput;
}) => {
  return ctx.db.folder.update({
    where: { id: input.id, ownerId: ctx.auth.userId },
    data: { starred: input.starred },
  });
};
