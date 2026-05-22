/* eslint-disable @typescript-eslint/no-explicit-any */
import { protectedProcedure, router } from '../../trpc';
import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import {
  extractObjectKey,
  deleteObject,
  resolvePublicFileUrl,
} from '../../utils/r2';

async function getAllDescendantFolderIds(
  db: any,
  folderId: string,
): Promise<string[]> {
  const result: string[] = [folderId];
  const children = await db.folder.findMany({
    where: { parentId: folderId },
    select: { id: true },
  });
  for (const child of children) {
    const subIds = await getAllDescendantFolderIds(db, child.id);
    result.push(...subIds);
  }
  return result;
}

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
  getOrCreate: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1),
        parentId: z.string().uuid().nullable().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const parentId = input.parentId ?? null;
      const existing = await ctx.db.folder.findFirst({
        where: {
          name: input.name,
          parentId,
          ownerId: ctx.auth.userId,
          trashed: false,
        },
      });
      if (existing) {
        return { id: existing.id, name: existing.name };
      }
      const folder = await ctx.db.folder.create({
        data: {
          name: input.name,
          ownerId: ctx.auth.userId,
          parentId,
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

  deletePermanently: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
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

      // 1. Get all descendant folder IDs recursively
      const allFolderIds = await getAllDescendantFolderIds(ctx.db, input.id);

      // 2. Find all files inside these folders
      const files = await ctx.db.file.findMany({
        where: { folderId: { in: allFolderIds } },
        select: { id: true, s3Url: true, sizeMb: true },
      });

      // 3. Delete files from R2/S3
      for (const file of files) {
        try {
          const objectKey = extractObjectKey(file.s3Url);
          await deleteObject(objectKey);
        } catch (err) {
          console.error(`Failed to delete file ${file.id} from R2:`, err);
        }
      }

      // 4. Calculate total storage size to reclaim
      const totalSizeMb = files.reduce((sum, f) => sum + f.sizeMb, 0);

      // 5. Delete root folder from DB (which cascades child folders & files) & Decrement storage
      const transactions: any[] = [
        ctx.db.folder.delete({
          where: { id: input.id },
        }),
      ];
      if (totalSizeMb > 0) {
        transactions.push(
          ctx.db.userStorage.update({
            where: { userId: ctx.auth.userId },
            data: { usedStorage: { decrement: totalSizeMb } },
          }),
        );
      }
      await ctx.db.$transaction(transactions);

      return { success: true };
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
        parentId: true,
      },
    });
  }),

  move: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        parentId: z.string().uuid().nullable(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (input.parentId === input.id) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Cannot move a folder into itself',
        });
      }
      if (input.parentId) {
        const descendants = await getAllDescendantFolderIds(ctx.db, input.id);
        if (descendants.includes(input.parentId)) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Cannot move a folder into one of its subfolders',
          });
        }
      }
      return ctx.db.folder.update({
        where: { id: input.id, ownerId: ctx.auth.userId },
        data: { parentId: input.parentId },
      });
    }),

  moveMany: protectedProcedure
    .input(
      z.object({
        ids: z.array(z.string().uuid()),
        parentId: z.string().uuid().nullable(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      for (const id of input.ids) {
        if (input.parentId === id) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Cannot move a folder into itself',
          });
        }
        if (input.parentId) {
          const descendants = await getAllDescendantFolderIds(ctx.db, id);
          if (descendants.includes(input.parentId)) {
            throw new TRPCError({
              code: 'BAD_REQUEST',
              message: 'Cannot move a folder into one of its subfolders',
            });
          }
        }
      }
      return ctx.db.folder.updateMany({
        where: { id: { in: input.ids }, ownerId: ctx.auth.userId },
        data: { parentId: input.parentId },
      });
    }),

  toggleStarMany: protectedProcedure
    .input(
      z.object({
        ids: z.array(z.string().uuid()),
        starred: z.boolean(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.folder.updateMany({
        where: { id: { in: input.ids }, ownerId: ctx.auth.userId },
        data: { starred: input.starred },
      });
    }),

  toggleTrashMany: protectedProcedure
    .input(
      z.object({
        ids: z.array(z.string().uuid()),
        trashed: z.boolean(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.folder.updateMany({
        where: { id: { in: input.ids }, ownerId: ctx.auth.userId },
        data: { trashed: input.trashed },
      });
    }),

  deleteManyPermanently: protectedProcedure
    .input(
      z.object({
        ids: z.array(z.string().uuid()),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const folders = await ctx.db.folder.findMany({
        where: { id: { in: input.ids }, ownerId: ctx.auth.userId },
      });
      if (folders.length === 0) return { success: true };

      const allFolderIds: string[] = [];
      for (const id of input.ids) {
        const descendants = await getAllDescendantFolderIds(ctx.db, id);
        allFolderIds.push(...descendants);
      }
      const uniqueFolderIds = Array.from(new Set(allFolderIds));

      const files = await ctx.db.file.findMany({
        where: { folderId: { in: uniqueFolderIds } },
        select: { id: true, s3Url: true, sizeMb: true },
      });

      for (const file of files) {
        try {
          const objectKey = extractObjectKey(file.s3Url);
          await deleteObject(objectKey);
        } catch (err) {
          console.error(`Failed to delete file ${file.id} from R2:`, err);
        }
      }

      const totalSizeMb = files.reduce((sum, f) => sum + f.sizeMb, 0);

      const transactions: any[] = [
        ctx.db.folder.deleteMany({
          where: { id: { in: uniqueFolderIds } },
        }),
      ];
      if (totalSizeMb > 0) {
        transactions.push(
          ctx.db.userStorage.update({
            where: { userId: ctx.auth.userId },
            data: { usedStorage: { decrement: totalSizeMb } },
          }),
        );
      }
      await ctx.db.$transaction(transactions);

      return { success: true };
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

      const email = input.email.toLowerCase().trim();

      const existingShare = await ctx.db.folderShare.findUnique({
        where: {
          folderId_email: {
            folderId: input.folderId,
            email,
          },
        },
      });

      const result = await ctx.db.folderShare.upsert({
        where: {
          folderId_email: {
            folderId: input.folderId,
            email,
          },
        },
        create: {
          folderId: input.folderId,
          email,
          canUpload: input.canUpload,
        },
        update: {
          canUpload: input.canUpload,
        },
      });

      // If newly shared, check if recipient user is registered and create a Notification
      if (!existingShare) {
        const recipient = await ctx.db.user.findFirst({
          where: {
            email: {
              equals: email,
              mode: 'insensitive',
            },
          },
        });
        if (recipient) {
          const sharer = await ctx.db.user.findUnique({
            where: { id: ctx.auth.userId },
            select: { name: true, email: true },
          });
          const sharerName = sharer?.name || sharer?.email || 'Someone';

          await ctx.db.notification.create({
            data: {
              userId: recipient.id,
              title: 'Folder Shared',
              message: `${sharerName} shared the folder "${folder.name}" with you.`,
            },
          });
        }
      }

      return result;
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

  search: protectedProcedure
    .input(z.object({ query: z.string() }))
    .query(async ({ ctx, input }) => {
      const queryStr = input.query.trim();
      if (!queryStr) {
        return { folders: [], files: [] };
      }

      // 1. Fetch folders owned by user matching name
      const folders = await ctx.db.folder.findMany({
        where: {
          ownerId: ctx.auth.userId,
          trashed: false,
          name: { contains: queryStr, mode: 'insensitive' },
        },
        select: {
          id: true,
          name: true,
          createdAt: true,
          starred: true,
          trashed: true,
        },
      });

      // 2. Fetch shared folders matching name
      const currentUser = await ctx.db.user.findUnique({
        where: { id: ctx.auth.userId },
      });
      const userEmail = currentUser?.email || ctx.auth.email || '';

      const sharedShares = await ctx.db.folderShare.findMany({
        where: {
          email: userEmail.toLowerCase().trim(),
          folder: {
            trashed: false,
            name: { contains: queryStr, mode: 'insensitive' },
          },
        },
        include: {
          folder: {
            select: {
              id: true,
              name: true,
              createdAt: true,
              starred: true,
              trashed: true,
            },
          },
        },
      });

      const sharedFolders = sharedShares.map((s) => s.folder);

      // Merge and deduplicate folders
      const allFoldersMap = new Map<string, (typeof folders)[number]>();
      folders.forEach((f) => allFoldersMap.set(f.id, f));
      sharedFolders.forEach((f) => allFoldersMap.set(f.id, f));
      const allFolders = Array.from(allFoldersMap.values());

      // 3. Fetch files owned by user matching name
      const files = await ctx.db.file.findMany({
        where: {
          ownerId: ctx.auth.userId,
          trashed: false,
          name: { contains: queryStr, mode: 'insensitive' },
        },
        select: {
          id: true,
          name: true,
          createdAt: true,
          starred: true,
          trashed: true,
          sizeMb: true,
          s3Url: true,
          folderId: true,
        },
      });

      const resolvedFiles = files.map((f) => ({
        id: f.id,
        name: f.name,
        createdAt: f.createdAt,
        starred: f.starred,
        trashed: f.trashed,
        sizeMb: f.sizeMb,
        url: resolvePublicFileUrl(f.s3Url),
        folderId: f.folderId,
      }));

      return {
        folders: allFolders,
        files: resolvedFiles,
      };
    }),
});
