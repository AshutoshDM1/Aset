import { useQuery } from '@tanstack/react-query';
import { trpc } from '@/utils/trpc';
import FolderComponent, {
  type FolderColor,
} from '@/shared/Dashboard/FolderComponent';
import Loader from '@/shared/PageLoader/Loader';
import { useViewMode } from '@/context/ViewModeContext';
import { FolderTable } from './FolderTable';

export type FolderListMode = 'all' | 'starred' | 'trash' | 'children';

type FolderListProps = {
  /** Only used if mode is 'children' */
  parentFolderId?: number;
  mode?: FolderListMode;
};

const COLOR_CYCLE: FolderColor[] = ['cyan', 'yellow', 'pink', 'black'];

export function FolderList({ mode = 'all', parentFolderId }: FolderListProps) {
  const { viewMode } = useViewMode();
  let listQuery;

  if (mode === 'starred') {
    listQuery = trpc.folder.getStarred.queryOptions();
  } else if (mode === 'trash') {
    listQuery = trpc.folder.getTrash.queryOptions();
  } else if (mode === 'children' && parentFolderId !== undefined) {
    listQuery = trpc.folder.list.queryOptions({ parentId: parentFolderId });
  } else {
    // default to root level folders
    listQuery = trpc.folder.list.queryOptions();
  }

  const {
    data: folders,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery(listQuery);

  console.log(isError, error);
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

    return (
      <p className="rounded-2xl border border-dashed border-border bg-muted/20 px-4 py-8 text-center text-sm text-muted-foreground">
        {emptyMessage}
      </p>
    );
  }

  if (viewMode === 'table') {
    return (
      <FolderTable
        onRefetch={refetch}
        folders={folders.map((f) => ({
          ...f,
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
            starred={folder.starred}
            trashed={folder.trashed}
            onRefetch={refetch}
          />
        </li>
      ))}
    </ul>
  );
}
