import type { Context } from '../../../context';
import { resolvePublicFileUrl } from '../../../utils/r2';

export interface SearchInput {
  query: string;
}

export const searchHandler = async ({
  ctx,
  input,
}: {
  ctx: Context & { auth: { userId: string } };
  input: SearchInput;
}) => {
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
};
