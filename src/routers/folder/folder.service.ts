import { TRPCError } from '@trpc/server';
import { and, eq, isNull } from 'drizzle-orm';
import { folders } from '../../db/schema';
import { type Db } from '../../utils/drizzle';
import type {
  FolderCreateInput,
  FolderGetInput,
  FolderListInput,
  FolderRow,
} from './folder.types';

export async function createFolder(
  database: Db,
  input: FolderCreateInput,
): Promise<FolderRow> {
  if (input.parentId != null) {
    const [parent] = await database
      .select({ id: folders.id })
      .from(folders)
      .where(
        and(eq(folders.id, input.parentId), eq(folders.ownerId, input.ownerId)),
      )
      .limit(1);
    if (!parent) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'Parent folder not found',
      });
    }
  }

  const [row] = await database
    .insert(folders)
    .values({
      ownerId: input.ownerId,
      name: input.name,
      parentId: input.parentId,
    })
    .returning();

  if (!row) {
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Failed to create folder',
    });
  }

  return row;
}

export async function listFolders(
  database: Db,
  input: FolderListInput,
): Promise<FolderRow[]> {
  const owner = eq(folders.ownerId, input.ownerId);
  const parent =
    input.parentId === null
      ? isNull(folders.parentId)
      : eq(folders.parentId, input.parentId);

  return database.select().from(folders).where(and(owner, parent));
}

export async function getFolder(
  database: Db,
  input: FolderGetInput,
): Promise<FolderRow> {
  const [row] = await database
    .select()
    .from(folders)
    .where(and(eq(folders.id, input.id), eq(folders.ownerId, input.ownerId)))
    .limit(1);

  if (!row) {
    throw new TRPCError({
      code: 'NOT_FOUND',
      message: 'Folder not found',
    });
  }

  return row;
}
