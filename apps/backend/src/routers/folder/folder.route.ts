import { protectedProcedure, router } from '../../trpc';
import { TRPCError } from '@trpc/server';
import { z } from 'zod';

export const folderRouter = router({
  getById: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const currentUser = await ctx.db.user.findUnique({
        where: { id: ctx.auth.userId },
      });
      const userEmail = currentUser?.email || ctx.auth.email || '';

      const folder = await ctx.db.folder.findUnique({
        where: { id: input.id },
        include: {
          shares: {
            where: { email: userEmail.toLowerCase().trim() },
          },
        },
      });

      if (!folder) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Folder not found',
        });
      }

      const isOwner = folder.ownerId === ctx.auth.userId;
      const isShared = folder.shares.length > 0;
      const isPublic = folder.isPublic;

      if (!isOwner && !isShared && !isPublic) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message:
            'Access denied: You do not have permission to open this folder.',
        });
      }

      let canUpload = false;
      if (isOwner) {
        canUpload = true;
      } else if (isShared) {
        canUpload = folder.shares[0].canUpload;
      } else if (isPublic) {
        canUpload = folder.publicCanUpload;
      }

      let ownerName: string | null = null;
      let ownerEmail: string | null = null;

      if (isOwner || folder.showOwnerName || folder.showOwnerEmail) {
        const ownerUser = await ctx.db.user.findUnique({
          where: { id: folder.ownerId },
        });
        if (ownerUser) {
          if (isOwner || folder.showOwnerName) ownerName = ownerUser.name;
          if (isOwner || folder.showOwnerEmail) ownerEmail = ownerUser.email;
        }
      }

      return {
        id: folder.id,
        name: folder.name,
        parentId: folder.parentId,
        createdAt: folder.createdAt,
        starred: folder.starred,
        trashed: folder.trashed,
        ownerId: folder.ownerId,
        isPublic: folder.isPublic,
        publicCanUpload: folder.publicCanUpload,
        showOwnerName: folder.showOwnerName,
        showOwnerEmail: folder.showOwnerEmail,
        canUpload,
        ownerName,
        ownerEmail,
      };
    }),

  list: protectedProcedure
    .input(
      z
        .object({
          parentId: z.string().uuid().nullable(),
        })
        .optional(),
    )
    .query(async ({ ctx, input }) => {
      const parentId = input?.parentId ?? null;

      if (parentId) {
        const currentUser = await ctx.db.user.findUnique({
          where: { id: ctx.auth.userId },
        });
        const userEmail = currentUser?.email || ctx.auth.email || '';

        const parentFolder = await ctx.db.folder.findUnique({
          where: { id: parentId },
          include: {
            shares: { where: { email: userEmail.toLowerCase().trim() } },
          },
        });

        if (!parentFolder) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Parent folder not found',
          });
        }

        const isOwner = parentFolder.ownerId === ctx.auth.userId;
        const isShared = parentFolder.shares.length > 0;
        const isPublic = parentFolder.isPublic;

        if (!isOwner && !isShared && !isPublic) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'Access denied to this folder',
          });
        }

        const folders = await ctx.db.folder.findMany({
          where: { parentId, trashed: false },
          orderBy: { name: 'asc' },
          select: {
            id: true,
            name: true,
            createdAt: true,
            starred: true,
            trashed: true,
            files: { select: { sizeMb: true } },
          },
        });
        return folders.map((f) => ({
          id: f.id,
          name: f.name,
          createdAt: f.createdAt,
          starred: f.starred,
          trashed: f.trashed,
          sizeMb: f.files.reduce((acc, file) => acc + file.sizeMb, 0),
        }));
      } else {
        const folders = await ctx.db.folder.findMany({
          where: { ownerId: ctx.auth.userId, parentId: null, trashed: false },
          orderBy: { name: 'asc' },
          select: {
            id: true,
            name: true,
            createdAt: true,
            starred: true,
            trashed: true,
            files: { select: { sizeMb: true } },
          },
        });
        return folders.map((f) => ({
          id: f.id,
          name: f.name,
          createdAt: f.createdAt,
          starred: f.starred,
          trashed: f.trashed,
          sizeMb: f.files.reduce((acc, file) => acc + file.sizeMb, 0),
        }));
      }
    }),

  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1),
        parentId: z.string().uuid().optional(),
      }),
    )
    .output(z.object({ id: z.string(), name: z.string() }))
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
    const folders = await ctx.db.folder.findMany({
      where: { ownerId: ctx.auth.userId, starred: true, trashed: false },
      orderBy: { name: 'asc' },
      select: {
        id: true,
        name: true,
        createdAt: true,
        starred: true,
        trashed: true,
        files: { select: { sizeMb: true } },
      },
    });
    return folders.map((f) => ({
      id: f.id,
      name: f.name,
      createdAt: f.createdAt,
      starred: f.starred,
      trashed: f.trashed,
      sizeMb: f.files.reduce((acc, file) => acc + file.sizeMb, 0),
    }));
  }),
  getTrash: protectedProcedure.query(async ({ ctx }) => {
    const folders = await ctx.db.folder.findMany({
      where: { ownerId: ctx.auth.userId, trashed: true },
      orderBy: { name: 'asc' },
      select: {
        id: true,
        name: true,
        createdAt: true,
        starred: true,
        trashed: true,
        files: { select: { sizeMb: true } },
      },
    });
    return folders.map((f) => ({
      id: f.id,
      name: f.name,
      createdAt: f.createdAt,
      starred: f.starred,
      trashed: f.trashed,
      sizeMb: f.files.reduce((acc, file) => acc + file.sizeMb, 0),
    }));
  }),
  toggleStar: protectedProcedure
    .input(z.object({ id: z.string().uuid(), starred: z.boolean() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.folder.update({
        where: { id: input.id, ownerId: ctx.auth.userId },
        data: { starred: input.starred },
      });
    }),
  toggleTrash: protectedProcedure
    .input(z.object({ id: z.string().uuid(), trashed: z.boolean() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.folder.update({
        where: { id: input.id, ownerId: ctx.auth.userId },
        data: { trashed: input.trashed },
      });
    }),

  rename: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        name: z.string().min(1).max(500),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const folder = await ctx.db.folder.findFirst({
        where: { id: input.id, ownerId: ctx.auth.userId },
      });
      if (!folder) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Folder not found',
        });
      }
      return ctx.db.folder.update({
        where: { id: input.id },
        data: { name: input.name },
      });
    }),

  listAll: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.folder.findMany({
      where: { ownerId: ctx.auth.userId, trashed: false },
      orderBy: { name: 'asc' },
      select: {
        id: true,
        name: true,
      },
    });
  }),

  getShareSettings: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const folder = await ctx.db.folder.findFirst({
        where: { id: input.id, ownerId: ctx.auth.userId },
        include: {
          shares: {
            orderBy: { email: 'asc' },
          },
        },
      });
      if (!folder) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Folder not found or you are not the owner',
        });
      }
      return {
        isPublic: folder.isPublic,
        publicCanUpload: folder.publicCanUpload,
        showOwnerName: folder.showOwnerName,
        showOwnerEmail: folder.showOwnerEmail,
        shares: folder.shares.map((s) => ({
          id: s.id,
          email: s.email,
          canUpload: s.canUpload,
        })),
      };
    }),

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
    .mutation(async ({ ctx, input }) => {
      const folder = await ctx.db.folder.findFirst({
        where: { id: input.id, ownerId: ctx.auth.userId },
      });
      if (!folder) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Folder not found or you are not the owner',
        });
      }
      return ctx.db.folder.update({
        where: { id: input.id },
        data: {
          isPublic: input.isPublic,
          publicCanUpload: input.publicCanUpload,
          showOwnerName: input.showOwnerName,
          showOwnerEmail: input.showOwnerEmail,
        },
      });
    }),

  addShare: protectedProcedure
    .input(
      z.object({
        folderId: z.string().uuid(),
        email: z.string().email(),
        canUpload: z.boolean(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const folder = await ctx.db.folder.findFirst({
        where: { id: input.folderId, ownerId: ctx.auth.userId },
      });
      if (!folder) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Folder not found or you are not the owner',
        });
      }
      return ctx.db.folderShare.upsert({
        where: {
          folderId_email: {
            folderId: input.folderId,
            email: input.email.toLowerCase().trim(),
          },
        },
        create: {
          folderId: input.folderId,
          email: input.email.toLowerCase().trim(),
          canUpload: input.canUpload,
        },
        update: {
          canUpload: input.canUpload,
        },
      });
    }),

  removeShare: protectedProcedure
    .input(
      z.object({
        folderId: z.string().uuid(),
        shareId: z.string().uuid(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const folder = await ctx.db.folder.findFirst({
        where: { id: input.folderId, ownerId: ctx.auth.userId },
      });
      if (!folder) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Folder not found or you are not the owner',
        });
      }
      return ctx.db.folderShare.delete({
        where: { id: input.shareId },
      });
    }),

  listShared: protectedProcedure.query(async ({ ctx }) => {
    const currentUser = await ctx.db.user.findUnique({
      where: { id: ctx.auth.userId },
    });
    const userEmail = currentUser?.email || ctx.auth.email || '';

    const shares = await ctx.db.folderShare.findMany({
      where: {
        email: userEmail.toLowerCase().trim(),
        folder: { trashed: false },
      },
      include: {
        folder: {
          include: {
            files: { select: { sizeMb: true } },
          },
        },
      },
    });

    const folderList = [];
    for (const share of shares) {
      const folder = share.folder;

      let ownerName: string | null = null;
      let ownerEmail: string | null = null;

      if (folder.showOwnerName || folder.showOwnerEmail) {
        const owner = await ctx.db.user.findUnique({
          where: { id: folder.ownerId },
        });
        if (owner) {
          if (folder.showOwnerName) ownerName = owner.name;
          if (folder.showOwnerEmail) ownerEmail = owner.email;
        }
      }

      folderList.push({
        id: folder.id,
        name: folder.name,
        createdAt: folder.createdAt,
        ownerName,
        ownerEmail,
        canUpload: share.canUpload,
        sizeMb: folder.files.reduce((acc, file) => acc + file.sizeMb, 0),
      });
    }

    return folderList;
  }),
});
