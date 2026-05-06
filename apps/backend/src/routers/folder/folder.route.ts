import { protectedProcedure, router } from '../../trpc';
import { TRPCError } from '@trpc/server';
import { z } from 'zod';

export const folderRouter = router({
  getById: protectedProcedure
    .input(z.object({ id: z.number().int().positive() }))
    .query(async ({ ctx, input }) => {
      const folder = await ctx.db.folder.findFirst({
        where: { id: input.id, ownerId: ctx.auth.userId },
        select: { id: true, name: true, parentId: true, createdAt: true },
      });
      if (!folder) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Folder not found',
        });
      }
      return folder;
    }),

  list: protectedProcedure
    .input(
      z
        .object({
          parentId: z.number().int().positive().nullable(),
        })
        .optional(),
    )
    .query(async ({ ctx, input }) => {
      const parentId = input?.parentId ?? null;
      return ctx.db.folder.findMany({
        where: { ownerId: ctx.auth.userId, parentId },
        orderBy: { name: 'asc' },
        select: { id: true, name: true, createdAt: true },
      });
    }),

  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1),
        parentId: z.number().int().positive().optional(),
      }),
    )
    .output(z.object({ id: z.number(), name: z.string() }))
    .mutation(async ({ ctx, input }) => {
      if (input.parentId != null) {
        const parent = await ctx.db.folder.findFirst({
          where: { id: input.parentId, ownerId: ctx.auth.userId },
        });
        if (!parent) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Parent folder not found',
          });
        }
      }
      const folder = await ctx.db.folder.create({
        data: {
          name: input.name,
          ownerId: ctx.auth.userId,
          parentId: input.parentId ?? null,
        },
      });
      return { id: folder.id, name: folder.name };
    }),
  getStarred: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.folder.findMany({
      where: { ownerId: ctx.auth.userId, starred: true },
      orderBy: { name: 'asc' },
      select: { id: true, name: true, createdAt: true },
    });
  }),
  getTrash: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.folder.findMany({
      where: { ownerId: ctx.auth.userId, trashed: true },
      orderBy: { name: 'asc' },
      select: { id: true, name: true, createdAt: true },
    });
  }),
});
