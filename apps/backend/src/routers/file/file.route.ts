import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { router, protectedProcedure } from '../../trpc';
import {
  buildObjectKey,
  objectKeyPrefix,
  presignPut,
  resolvePublicFileUrl,
  storageUrlForKey,
} from '../../utils/r2';

export const fileRouter = router({
  listByFolder: protectedProcedure
    .input(z.object({ folderId: z.number().int().positive() }))
    .query(async ({ ctx, input }) => {
      const folder = await ctx.db.folder.findFirst({
        where: { id: input.folderId, ownerId: ctx.auth.userId },
      });
      if (!folder) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Folder not found',
        });
      }
      const rows = await ctx.db.file.findMany({
        where: {
          ownerId: ctx.auth.userId,
          folderId: input.folderId,
          trashed: false,
        },
        orderBy: { name: 'asc' },
        select: {
          id: true,
          name: true,
          createdAt: true,
          s3Url: true,
          sizeMb: true,
        },
      });
      return rows.map((f) => ({
        id: f.id,
        name: f.name,
        createdAt: f.createdAt,
        sizeMb: f.sizeMb,
        url: resolvePublicFileUrl(f.s3Url),
      }));
    }),

  presignUpload: protectedProcedure
    .input(
      z.object({
        folderId: z.number().int().positive(),
        fileName: z.string().min(1).max(500),
        contentType: z.string().max(200).optional(),
        sizeMb: z.number().nonnegative(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const folder = await ctx.db.folder.findFirst({
        where: { id: input.folderId, ownerId: ctx.auth.userId },
      });
      if (!folder) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Folder not found',
        });
      }
      const storage = await ctx.db.userStorage.findUnique({
        where: { userId: ctx.auth.userId },
        select: { totalStorage: true, usedStorage: true },
      });
      if (!storage) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'User storage not provisioned',
        });
      }
      if (storage.usedStorage + input.sizeMb > storage.totalStorage) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Not enough storage available',
        });
      }
      const contentType =
        input.contentType?.trim() || 'application/octet-stream';
      const objectKey = buildObjectKey(
        ctx.auth.userId,
        input.folderId,
        input.fileName,
      );
      try {
        const uploadUrl = await presignPut(objectKey, contentType);
        const stored = storageUrlForKey(objectKey);
        return {
          uploadUrl,
          objectKey,
          contentType,
          url: resolvePublicFileUrl(stored),
        };
      } catch {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Could not prepare upload (check R2 env vars)',
        });
      }
    }),

  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1).max(500),
        folderId: z.number().int().positive(),
        objectKey: z.string().min(1).max(2000),
        sizeMb: z.number().nonnegative(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const folder = await ctx.db.folder.findFirst({
        where: { id: input.folderId, ownerId: ctx.auth.userId },
      });
      if (!folder) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Folder not found',
        });
      }
      const prefix = objectKeyPrefix(ctx.auth.userId, input.folderId);
      if (!input.objectKey.startsWith(prefix)) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Invalid object key',
        });
      }
      const s3Url = storageUrlForKey(input.objectKey);
      const [file] = await ctx.db.$transaction([
        ctx.db.file.create({
          data: {
            name: input.name,
            s3Url,
            sizeMb: input.sizeMb,
            ownerId: ctx.auth.userId,
            folderId: input.folderId,
          },
          select: { id: true, name: true, s3Url: true },
        }),
        ctx.db.userStorage.update({
          where: { userId: ctx.auth.userId },
          data: { usedStorage: { increment: input.sizeMb } },
        }),
      ]);
      return {
        id: file.id,
        name: file.name,
        url: resolvePublicFileUrl(file.s3Url),
      };
    }),

  getRecent: protectedProcedure.query(async ({ ctx }) => {
    const rows = await ctx.db.file.findMany({
      where: { ownerId: ctx.auth.userId, trashed: false },
      orderBy: { createdAt: 'desc' },
      take: 20,
      select: {
        id: true,
        name: true,
        createdAt: true,
        s3Url: true,
        sizeMb: true,
        starred: true,
        trashed: true,
      },
    });
    return rows.map((f) => ({
      id: f.id,
      name: f.name,
      createdAt: f.createdAt,
      sizeMb: f.sizeMb,
      starred: f.starred,
      trashed: f.trashed,
      url: resolvePublicFileUrl(f.s3Url),
    }));
  }),

  toggleStar: protectedProcedure
    .input(z.object({ id: z.number(), starred: z.boolean() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.file.update({
        where: { id: input.id, ownerId: ctx.auth.userId },
        data: { starred: input.starred },
      });
    }),

  toggleTrash: protectedProcedure
    .input(z.object({ id: z.number(), trashed: z.boolean() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.file.update({
        where: { id: input.id, ownerId: ctx.auth.userId },
        data: { trashed: input.trashed },
      });
    }),

  getStarred: protectedProcedure.query(async ({ ctx }) => {
    const rows = await ctx.db.file.findMany({
      where: { ownerId: ctx.auth.userId, starred: true, trashed: false },
      orderBy: { name: 'asc' },
      select: {
        id: true,
        name: true,
        createdAt: true,
        s3Url: true,
        sizeMb: true,
        starred: true,
        trashed: true,
      },
    });
    return rows.map((f) => ({
      id: f.id,
      name: f.name,
      createdAt: f.createdAt,
      sizeMb: f.sizeMb,
      starred: f.starred,
      trashed: f.trashed,
      url: resolvePublicFileUrl(f.s3Url),
    }));
  }),

  getTrash: protectedProcedure.query(async ({ ctx }) => {
    const rows = await ctx.db.file.findMany({
      where: { ownerId: ctx.auth.userId, trashed: true },
      orderBy: { name: 'asc' },
      select: {
        id: true,
        name: true,
        createdAt: true,
        s3Url: true,
        sizeMb: true,
        starred: true,
        trashed: true,
      },
    });
    return rows.map((f) => ({
      id: f.id,
      name: f.name,
      createdAt: f.createdAt,
      sizeMb: f.sizeMb,
      starred: f.starred,
      trashed: f.trashed,
      url: resolvePublicFileUrl(f.s3Url),
    }));
  }),
});
