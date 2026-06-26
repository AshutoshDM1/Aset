import { protectedProcedure, router } from '../../trpc';
import { z } from 'zod';
import { getByIdHandler } from './query/getById';
import { listHandler } from './query/list';
import { getStarredHandler } from './query/getStarred';
import { getTrashHandler } from './query/getTrash';
import { listAllHandler } from './query/listAll';
import { getShareSettingsHandler } from './query/getShareSettings';
import { listSharedHandler } from './query/listShared';
import { searchHandler } from './query/search';

export const folderQueryRouter = router({
  getById: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(getByIdHandler),

  list: protectedProcedure
    .input(
      z
        .object({
          parentId: z.string().uuid().nullable(),
        })
        .optional(),
    )
    .query(listHandler),

  getStarred: protectedProcedure.query(getStarredHandler),

  getTrash: protectedProcedure.query(getTrashHandler),

  listAll: protectedProcedure.query(listAllHandler),

  getShareSettings: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(getShareSettingsHandler),

  listShared: protectedProcedure.query(listSharedHandler),

  search: protectedProcedure
    .input(z.object({ query: z.string() }))
    .query(searchHandler),
});
