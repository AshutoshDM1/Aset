import type { Context } from '../../../context';

export const getDecodingHistoryHandler = async ({
  ctx,
}: {
  ctx: Context & { auth: { userId: string } };
}) => {
  return ctx.db.decodingJob.findMany({
    where: {
      ownerId: ctx.auth.userId,
    },
    orderBy: { completedAt: 'desc' },
    select: {
      id: true,
      fileId: true,
      fileName: true,
      fileSizeMb: true,
      status: true,
      durationMs: true,
      audioTracksCount: true,
      subtitleTracksCount: true,
      startedAt: true,
      completedAt: true,
    },
  });
};
