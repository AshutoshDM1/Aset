import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router';
import { Folder } from 'lucide-react';
import { trpc } from '@/utils/trpc';

type FolderListProps = {
  /** Omit for drive root. Set to list children of a folder. */
  parentFolderId?: number;
};

export function FolderList({ parentFolderId }: FolderListProps) {
  const listQuery =
    parentFolderId === undefined
      ? trpc.folder.list.queryOptions()
      : trpc.folder.list.queryOptions({ parentId: parentFolderId });

  const {
    data: folders,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery(listQuery);

  if (isLoading) {
    return (
      <ul className="flex flex-col gap-2" aria-busy="true">
        {[1, 2, 3].map((i) => (
          <li key={i} className="h-12 animate-pulse rounded-2xl bg-muted/60" />
        ))}
      </ul>
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
    return (
      <p className="rounded-2xl border border-dashed border-border bg-muted/20 px-4 py-8 text-center text-sm text-muted-foreground">
        No folders yet. Create one to get started.
      </p>
    );
  }

  return (
    <ul className="flex flex-col gap-2">
      {folders.map((folder) => (
        <li key={folder.id}>
          <Link
            to={`/dashboard/folder/${folder.id}`}
            className="flex items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3 transition-colors hover:bg-muted/40"
          >
            <Folder
              className="size-5 shrink-0 text-muted-foreground"
              aria-hidden
            />
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium">{folder.name}</p>
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}
