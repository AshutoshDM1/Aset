import { protectedProcedure, router } from '../../trpc';
import { z } from 'zod';
import { listByFolderHandler } from './query/listByFolder';
import { getRecentHandler } from './query/getRecent';
import { getStarredHandler } from './query/getStarred';
import { getTrashHandler } from './query/getTrash';
import { getMediaTracksHandler } from './query/getMediaTracks';
import { getProcessingFilesHandler } from './query/getProcessingFiles';
import { getDecodingHistoryHandler } from './query/getDecodingHistory';

export const fileQueryRouter = router({
  listByFolder: protectedProcedure
    .input(z.object({ folderId: z.string().uuid() }))
    .query(listByFolderHandler),

  getRecent: protectedProcedure.query(getRecentHandler),

  getStarred: protectedProcedure.query(getStarredHandler),

  getTrash: protectedProcedure.query(getTrashHandler),

  getMediaTracks: protectedProcedure
    .input(z.object({ fileId: z.string().uuid() }))
    .query(getMediaTracksHandler),

  getProcessingFiles: protectedProcedure.query(getProcessingFilesHandler),

  getDecodingHistory: protectedProcedure.query(getDecodingHistoryHandler),
});
