import { useQueries } from '@tanstack/react-query';
import { FileIcon } from 'lucide-react';
import { trpc } from '@/utils/trpc';
import FolderComponent, {
  type FolderColor,
} from '@/shared/FolderComponent/FolderComponent';
import ImageFilePreview from './ImageFilePreview';

const COLOR_CYCLE: FolderColor[] = ['cyan', 'yellow', 'pink', 'black'];

const IMAGE_NAME = /\.(jpe?g|png|gif|webp|avif|svg|bmp|ico)$/i;

function isImageFileName(name: string) {
  return IMAGE_NAME.test(name);
}

type FolderContentsProps = {
  folderId: number;
};

export function FolderContents({ folderId }: FolderContentsProps) {
  const [foldersQuery, filesQuery] = useQueries({
    queries: [
      trpc.folder.list.queryOptions({ parentId: folderId }),
      trpc.file.listByFolder.queryOptions({ folderId }),
    ],
  });

  const loading = foldersQuery.isPending || filesQuery.isPending;

  if (loading) {
    return (
      <ul
        className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5"
        aria-busy="true"
      >
        {[1, 2, 3, 4].map((i) => (
          <li key={i} className="h-40 animate-pulse rounded-2xl bg-muted/60" />
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

  const imageFiles = files.filter((f) => isImageFileName(f.name));
  const otherFiles = files.filter((f) => !isImageFileName(f.name));

  if (folders.length === 0 && files.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-border bg-muted/20 px-4 py-10 text-center text-sm text-muted-foreground">
        This folder is empty.
      </p>
    );
  }

  return (
    <>
      {folders.length > 0 || imageFiles.length > 0 ? (
        <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-10">
          {folders.map((item, index) => (
            <li key={`f-${item.id}`}>
              <FolderComponent
                folderId={item.id}
                folderName={item.name}
                color={COLOR_CYCLE[index % COLOR_CYCLE.length]}
              />
            </li>
          ))}
          {imageFiles.map((item) => (
            <li
              key={`file-${item.id}`}
              className="flex items-start justify-center"
            >
              <ImageFilePreview name={item.name} url={item.url} />
            </li>
          ))}
        </ul>
      ) : null}
      {otherFiles.length > 0 ? (
        <ul
          className={`flex flex-col gap-2 ${folders.length > 0 || imageFiles.length > 0 ? 'mt-6' : ''}`}
        >
          {otherFiles.map((item) => (
            <li key={`file-${item.id}`}>
              <div className="flex w-full items-center gap-3 rounded-lg border border-border bg-card px-4 py-3 text-left">
                <FileIcon
                  className="size-5 shrink-0 text-muted-foreground"
                  aria-hidden
                />
                <span className="min-w-0 truncate font-medium">
                  {item.name}
                </span>
              </div>
            </li>
          ))}
        </ul>
      ) : null}
    </>
  );
}
