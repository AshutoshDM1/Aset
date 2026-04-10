import { onboardedProcedure, router } from '../../trpc';
import { createFolder, getFolder, listFolders } from './folder.service';
import {
  folderCreateInputSchema,
  folderGetInputSchema,
  folderListInputSchema,
} from './folder.validation';

export const folderRouter = router({
  create: onboardedProcedure
    .input(folderCreateInputSchema)
    .mutation(({ ctx, input }) =>
      createFolder(ctx.db, { ...input, ownerId: ctx.auth.userId }),
    ),

  list: onboardedProcedure
    .input(folderListInputSchema)
    .query(({ ctx, input }) =>
      listFolders(ctx.db, { ...input, ownerId: ctx.auth.userId }),
    ),

  get: onboardedProcedure
    .input(folderGetInputSchema)
    .query(({ ctx, input }) =>
      getFolder(ctx.db, { ...input, ownerId: ctx.auth.userId }),
    ),
});
