import { useState } from 'react';
import { useQueries } from '@tanstack/react-query';
import { Link } from 'react-router';
import { FileIcon, Folder } from 'lucide-react';
import { trpc } from '@/utils/trpc';
import { ImagePreviewDialog } from './ImagePreviewDialog';

const IMAGE_NAME = /\.(jpe?g|png|gif|webp|avif|svg|bmp|ico)$/i;

function isImageFileName(name: string) {
  return IMAGE_NAME.test(name);
}

type FolderContentsProps = {
  folderId: number;
};

export function FolderContents({ folderId }: FolderContentsProps) {
  const [preview, setPreview] = useState<{
    name: string;
    url: string;
  } | null>(null);
  const [foldersQuery, filesQuery] = useQueries({
    queries: [
      trpc.folder.list.queryOptions({ parentId: folderId }),
      trpc.file.listByFolder.queryOptions({ folderId }),
    ],
  });

  const loading = foldersQuery.isPending || filesQuery.isPending;

  if (loading) {
    return (
      <ul className="flex flex-col gap-2" aria-busy="true">
        {[1, 2, 3].map((i) => (
          <li key={i} className="h-12 animate-pulse rounded-2xl bg-muted/60" />
        ))}
      </ul>
    );
  }

  if (foldersQuery.isError || filesQuery.isError) {
    const err = foldersQuery.error ?? filesQuery.error;
    return (
      <div className="rounded-2xl border border-border bg-card p-4 text-sm text-destructive">
        {err?.message ?? 'Something went wrong'}
        <button
          type="button"
          className="mt-2 text-primary underline underline-offset-2"
          onClick={() => {
            void foldersQuery.refetch();
            void filesQuery.refetch();
          }}
        >
          Try again
        </button>
      </div>
    );
  }

  const folders = foldersQuery.data ?? [];
  const files = filesQuery.data ?? [];

  if (folders.length === 0 && files.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-border bg-muted/20 px-4 py-10 text-center text-sm text-muted-foreground">
        This folder is empty.
      </p>
    );
  }

  return (
    <>
      <ul className="flex flex-col gap-2">
        {folders.map((item) => (
          <li key={`f-${item.id}`}>
            <Link
              to={`/dashboard/folder/${item.id}`}
              className="flex items-center gap-3 rounded-lg border border-border bg-card px-4 py-3 transition-colors hover:bg-muted/40"
            >
              <Folder
                className="size-5 shrink-0 text-muted-foreground"
                aria-hidden
              />
              <span className="min-w-0 truncate font-medium">{item.name}</span>
            </Link>
          </li>
        ))}
        {files.map((item) => {
          const showPreview = isImageFileName(item.name);
          const rowClass =
            'flex w-full items-center gap-3 rounded-lg border border-border bg-card px-4 py-3 text-left';
          return (
            <li key={`file-${item.id}`}>
              {showPreview ? (
                <button
                  type="button"
                  className={`${rowClass} cursor-pointer transition-colors hover:bg-muted/40`}
                  onClick={() => setPreview({ name: item.name, url: item.url })}
                >
                  <FileIcon
                    className="size-5 shrink-0 text-muted-foreground"
                    aria-hidden
                  />
                  <span className="min-w-0 truncate font-medium">
                    {item.name}
                  </span>
                </button>
              ) : (
                <div className={rowClass}>
                  <FileIcon
                    className="size-5 shrink-0 text-muted-foreground"
                    aria-hidden
                  />
                  <span className="min-w-0 truncate font-medium">
                    {item.name}
                  </span>
                </div>
              )}
            </li>
          );
        })}
      </ul>
      <ImagePreviewDialog
        open={!!preview}
        onOpenChange={(next) => {
          if (!next) setPreview(null);
        }}
        fileName={preview?.name ?? ''}
        imageUrl={preview?.url ?? ''}
      />
    </>
  );
}
