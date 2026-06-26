import { protectedProcedure, router } from '../../trpc';
import { z } from 'zod';
import { createHandler } from './mutate/create';
import { getOrCreateHandler } from './mutate/getOrCreate';
import { toggleStarHandler } from './mutate/toggleStar';
import { toggleTrashHandler } from './mutate/toggleTrash';
import { deletePermanentlyHandler } from './mutate/deletePermanently';
import { renameHandler } from './mutate/rename';
import { moveHandler } from './mutate/move';
import { moveManyHandler } from './mutate/moveMany';
import { toggleStarManyHandler } from './mutate/toggleStarMany';
import { toggleTrashManyHandler } from './mutate/toggleTrashMany';
import { deleteManyPermanentlyHandler } from './mutate/deleteManyPermanently';
import { updateShareSettingsHandler } from './mutate/updateShareSettings';
import { addShareHandler } from './mutate/addShare';
import { removeShareHandler } from './mutate/removeShare';

export const folderMutationRouter = router({
  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1),
        parentId: z.string().uuid().optional(),
      }),
    )
    .output(z.object({ id: z.string(), name: z.string() }))
    .mutation(createHandler),

  getOrCreate: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1),
        parentId: z.string().uuid().nullable().optional(),
      }),
    )
    .mutation(getOrCreateHandler),

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

  move: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        parentId: z.string().uuid().nullable(),
      }),
    )
    .mutation(moveHandler),

  moveMany: protectedProcedure
    .input(
      z.object({
        ids: z.array(z.string().uuid()),
        parentId: z.string().uuid().nullable(),
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

  updateShareSettings: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        isPublic: z.boolean(),
        publicCanUpload: z.boolean(),
        showOwnerName: z.boolean(),
        showOwnerEmail: z.boolean(),
      }),
    )
    .mutation(updateShareSettingsHandler),

  addShare: protectedProcedure
    .input(
      z.object({
        folderId: z.string().uuid(),
        email: z.string().email(),
        canUpload: z.boolean(),
      }),
    )
    .mutation(addShareHandler),

  removeShare: protectedProcedure
    .input(
      z.object({
        folderId: z.string().uuid(),
        shareId: z.string().uuid(),
      }),
    )
    .mutation(removeShareHandler),
});
