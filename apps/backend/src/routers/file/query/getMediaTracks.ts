import { TRPCError } from '@trpc/server';
import type { Context } from '../../../context';
import { resolvePublicFileUrl } from '../../../utils/r2';

export interface GetMediaTracksInput {
  fileId: string;
}

export const getMediaTracksHandler = async ({
  ctx,
  input,
}: {
  ctx: Context & { auth: { userId: string } };
  input: GetMediaTracksInput;
}) => {
  const file = await ctx.db.file.findUnique({
    where: { id: input.fileId },
    include: {
      subtitles: true,
      audioTracks: true,
    },
  });

  if (!file) {
    throw new TRPCError({
      code: 'NOT_FOUND',
      message: 'File not found',
    });
  }

  return {
    subtitles: file.subtitles.map((sub) => ({
      id: sub.id,
      label: sub.label,
      language: sub.language,
      url: resolvePublicFileUrl(sub.s3Url),
    })),
    audioTracks: file.audioTracks.map((audio) => ({
      id: audio.id,
      label: audio.label,
      language: audio.language,
      url: resolvePublicFileUrl(audio.s3Url),
    })),
  };
};
