import { useQuery } from '@tanstack/react-query';
import { trpc } from '@/utils/trpc';
import FolderComponent, {
  type FolderColor,
} from '@/shared/Dashboard/FolderComponent';
import Loader from '@/shared/PageLoader/Loader';
import { useViewMode } from '@/context/ViewModeContext';
import { FolderTable } from './FolderTable';

export type FolderListMode =
  | 'all'
  | 'starred'
  | 'trash'
  | 'children'
  | 'shared';

type FolderListProps = {
  /** Only used if mode is 'children' */
  parentFolderId?: string;
  mode?: FolderListMode;
};

const COLOR_CYCLE: FolderColor[] = ['cyan', 'yellow', 'pink', 'black'];

export function FolderList({ mode = 'all', parentFolderId }: FolderListProps) {
  const { viewMode } = useViewMode();

  const normalQuery = useQuery({
    ...trpc.folder.list.queryOptions(
      mode === 'children' && parentFolderId !== undefined
        ? { parentId: parentFolderId }
        : undefined,
    ),
    enabled: mode !== 'starred' && mode !== 'trash' && mode !== 'shared',
  });

  const starredQuery = useQuery({
    ...trpc.folder.getStarred.queryOptions(),
    enabled: mode === 'starred',
  });

  const trashQuery = useQuery({
    ...trpc.folder.getTrash.queryOptions(),
    enabled: mode === 'trash',
  });

  const sharedQuery = useQuery({
    ...trpc.folder.listShared.queryOptions(),
    enabled: mode === 'shared',
  });

  const activeQuery =
    mode === 'starred'
      ? starredQuery
      : mode === 'trash'
        ? trashQuery
        : mode === 'shared'
          ? sharedQuery
          : normalQuery;

  const { data: folders, isLoading, isError, error, refetch } = activeQuery;
  if (isLoading) {
    return (
      <div className="py-10">
        <Loader />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-2xl border border-border bg-card p-4 text-sm text-destructive">
        {error.message}
        <button
          type="button"
          className="mt-2 text-primary underline underline-offset-2"
          onClick={() => void refetch()}
        >
          Try again
        </button>
      </div>
    );
  }

  if (!folders?.length) {
    let emptyMessage = 'No folders yet. Create one to get started.';
    if (mode === 'starred') emptyMessage = 'No starred folders yet.';
    if (mode === 'trash') emptyMessage = 'Trash is empty.';
    if (mode === 'shared')
      emptyMessage = 'No folders have been shared with you yet.';

    return (
      <p className="rounded-2xl border border-dashed border-border bg-muted/20 px-4 py-8 text-center text-sm text-muted-foreground">
        {emptyMessage}
      </p>
    );
  }

  const isOwner = mode !== 'shared';

  if (viewMode === 'table') {
    return (
      <FolderTable
        onRefetch={refetch}
        isOwner={isOwner}
        folders={folders.map((f) => ({
          ...f,
          starred: (f as any).starred ?? false,
          trashed: (f as any).trashed ?? false,
          createdAt: new Date(f.createdAt),
        }))}
      />
    );
  }

  return (
    <ul className="grid gap-4 grid-cols-3 md:grid-cols-4 lg:grid-cols-9">
      {folders.map((folder, index) => (
        <li key={folder.id}>
          <FolderComponent
            folderId={folder.id}
            folderName={folder.name}
            color={COLOR_CYCLE[index % COLOR_CYCLE.length]}
            starred={(folder as any).starred ?? false}
            trashed={(folder as any).trashed ?? false}
            onRefetch={refetch}
            isOwner={isOwner}
            createdAt={folder.createdAt}
            sizeMb={folder.sizeMb}
          />
        </li>
      ))}
    </ul>
  );
}
