import { useQuery } from '@tanstack/react-query';
import { trpc } from '@/utils/trpc';
import Loader from '@/shared/PageLoader/Loader';
import { FileIcon } from 'lucide-react';
import ImageFilePreview from './ImageFilePreview';

const IMAGE_NAME = /\.(jpe?g|png|gif|webp|avif|svg|bmp|ico)$/i;
function isImageFileName(name: string) {
  return IMAGE_NAME.test(name);
}

function OtherFileTile({ name }: { name: string }) {
  const dot = name.lastIndexOf('.');
  const base = dot > 0 ? name.slice(0, dot) : name;
  const ext = dot > 0 ? name.slice(dot) : '';

  return (
    <div
      aria-label={name}
      title={name}
      className="group flex flex-col items-center rounded-2xl p-2 transition-transform duration-200 hover:-translate-y-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <div className="flex size-20 items-center justify-center overflow-hidden rounded-2xl bg-muted/40 ring-1 ring-border/60">
        <FileIcon className="size-8 text-muted-foreground" aria-hidden />
      </div>
      <p className="text-sm text-foreground">
        <span className="truncate inline-block align-bottom max-w-[50px]">
          {base.slice(0, 5)}
          {base.length > 5 ? '..' : ''}
        </span>
        {ext}
      </p>
    </div>
  );
}

export type FileListMode = 'recent';

type FileListProps = {
  mode?: FileListMode;
};

export function FileList({ mode = 'recent' }: FileListProps) {
  const {
    data: files,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery(trpc.file.getRecent.queryOptions());

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

  if (!files?.length) {
    return (
      <p className="rounded-2xl border border-dashed border-border bg-muted/20 px-4 py-8 text-center text-sm text-muted-foreground">
        No recent files.
      </p>
    );
  }

  return (
    <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-10">
      {files.map((file) => (
        <li key={file.id} className="flex items-start justify-center">
          {isImageFileName(file.name) ? (
            <ImageFilePreview name={file.name} url={file.url} />
          ) : (
            <OtherFileTile name={file.name} />
          )}
        </li>
      ))}
    </ul>
  );
}
