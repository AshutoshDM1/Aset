import { protectedProcedure, router } from '../../trpc';
import { z } from 'zod';
import { presignUploadHandler } from './mutate/presignUpload';
import { createHandler } from './mutate/create';
import { toggleStarHandler } from './mutate/toggleStar';
import { toggleTrashHandler } from './mutate/toggleTrash';
import { deletePermanentlyHandler } from './mutate/deletePermanently';
import { renameHandler } from './mutate/rename';
import { getDownloadUrlHandler } from './mutate/getDownloadUrl';
import { moveHandler } from './mutate/move';
import { moveManyHandler } from './mutate/moveMany';
import { toggleStarManyHandler } from './mutate/toggleStarMany';
import { toggleTrashManyHandler } from './mutate/toggleTrashMany';
import { deleteManyPermanentlyHandler } from './mutate/deleteManyPermanently';

export const fileMutationRouter = router({
  presignUpload: protectedProcedure
    .input(
      z.object({
        folderId: z.string().uuid(),
        fileName: z.string().min(1).max(500),
        contentType: z.string().max(200).optional(),
        sizeMb: z.number().nonnegative(),
      }),
    )
    .mutation(presignUploadHandler),

  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1).max(500),
        folderId: z.string().uuid(),
        objectKey: z.string().min(1).max(2000),
        sizeMb: z.number().nonnegative(),
        decodingEnabled: z.boolean().optional(),
      }),
    )
    .mutation(createHandler),

  toggleStar: protectedProcedure
    .input(z.object({ id: z.string().uuid(), starred: z.boolean() }))
    .mutation(toggleStarHandler),

  toggleTrash: protectedProcedure
    .input(z.object({ id: z.string().uuid(), trashed: z.boolean() }))
    .mutation(toggleTrashHandler),

  deletePermanently: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(deletePermanentlyHandler),

  rename: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        name: z.string().min(1).max(500),
      }),
    )
    .mutation(renameHandler),

  getDownloadUrl: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
      }),
    )
    .mutation(getDownloadUrlHandler),

  move: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        folderId: z.string().uuid().nullable(),
      }),
    )
    .mutation(moveHandler),

  moveMany: protectedProcedure
    .input(
      z.object({
        ids: z.array(z.string().uuid()),
        folderId: z.string().uuid().nullable(),
      }),
    )
    .mutation(moveManyHandler),

  toggleStarMany: protectedProcedure
    .input(
      z.object({
        ids: z.array(z.string().uuid()),
        starred: z.boolean(),
      }),
    )
    .mutation(toggleStarManyHandler),

  toggleTrashMany: protectedProcedure
    .input(
      z.object({
        ids: z.array(z.string().uuid()),
        trashed: z.boolean(),
      }),
    )
    .mutation(toggleTrashManyHandler),

  deleteManyPermanently: protectedProcedure
    .input(
      z.object({
        ids: z.array(z.string().uuid()),
      }),
    )
    .mutation(deleteManyPermanentlyHandler),
});
