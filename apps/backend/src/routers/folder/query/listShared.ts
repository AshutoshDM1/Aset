import type { Context } from '../../../context';

export const listSharedHandler = async ({
  ctx,
}: {
  ctx: Context & { auth: { userId: string } };
}) => {
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
};
