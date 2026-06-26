/* eslint-disable @typescript-eslint/no-explicit-any */
export async function getAllDescendantFolderIds(
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
