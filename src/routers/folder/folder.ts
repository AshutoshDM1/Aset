import { publicProcedure, router } from '../../trpc';
import { createFolder, getFolder, listFolders } from './folder.service';
import {
  folderCreateInputSchema,
  folderGetInputSchema,
  folderListInputSchema,
} from './folder.validation';

export const folderRouter = router({
  create: publicProcedure
    .input(folderCreateInputSchema)
    .mutation(({ ctx, input }) => createFolder(ctx.db, input)),

  list: publicProcedure
    .input(folderListInputSchema)
    .query(({ ctx, input }) => listFolders(ctx.db, input)),

  get: publicProcedure
    .input(folderGetInputSchema)
    .query(({ ctx, input }) => getFolder(ctx.db, input)),
});
