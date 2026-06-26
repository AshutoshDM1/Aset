import type { Context } from '../../../context';

export const getProcessingFilesHandler = async ({
  ctx,
}: {
  ctx: Context & { auth: { userId: string } };
}) => {
  return ctx.db.file.findMany({
    where: {
      ownerId: ctx.auth.userId,
      processingStatus: 'processing',
      trashed: false,
    },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      name: true,
      sizeMb: true,
      createdAt: true,
    },
  });
};
