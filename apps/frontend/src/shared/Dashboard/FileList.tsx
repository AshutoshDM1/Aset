import { useQuery } from '@tanstack/react-query';
import { trpc } from '@/utils/trpc';
import Loader from '@/shared/PageLoader/Loader';
import ImageFilePreview from './ImageFilePreview';
import PdfFilePreview from './PdfFilePreview';
import VideoFilePreview from './VideoFilePreview';
import TextFilePreview from './TextFilePreview';
import { useViewMode } from '@/context/ViewModeContext';
import { FileTable } from './FileTable';
import {
  isImageFileName,
  isPdfFileName,
  isVideoFileName,
  isTextCodeFileName,
} from '@/utils/file/file-utils';
import { OtherFileTile } from './OtherFileTile';

export type FileListMode = 'recent' | 'starred' | 'trash';

type FileListProps = {
  mode?: FileListMode;
};

export function FileList({ mode = 'recent' }: FileListProps) {
  const { viewMode } = useViewMode();

  let listQuery;
  if (mode === 'starred') {
    listQuery = trpc.file.getStarred.queryOptions();
  } else if (mode === 'trash') {
    listQuery = trpc.file.getTrash.queryOptions();
  } else {
    listQuery = trpc.file.getRecent.queryOptions();
  }

  const {
    data: files,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery(listQuery);

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
    let emptyMessage = 'No recent files.';
    if (mode === 'starred') emptyMessage = 'No starred files yet.';
    if (mode === 'trash') emptyMessage = 'No files in trash.';

    return (
      <p className="rounded-2xl border border-dashed border-border bg-muted/20 px-4 py-8 text-center text-sm text-muted-foreground">
        {emptyMessage}
      </p>
    );
  }

  if (viewMode === 'table') {
    return (
      <FileTable
        onRefetch={refetch}
        files={files.map((f) => ({
          ...f,
          createdAt: new Date(f.createdAt),
        }))}
      />
    );
  }

  return (
    <ul className="grid grid-cols-3 md:grid-cols-8 xl:grid-cols-12 justify-evenly">
      {files.map((file) => (
        <li key={file.id} className="flex items-start justify-center">
          {isImageFileName(file.name) ? (
            <ImageFilePreview
              fileId={file.id}
              name={file.name}
              url={file.url}
              starred={file.starred}
              trashed={file.trashed}
              onRefetch={refetch}
              createdAt={file.createdAt}
              sizeMb={file.sizeMb}
            />
          ) : isPdfFileName(file.name) ? (
            <PdfFilePreview
              fileId={file.id}
              name={file.name}
              url={file.url}
              starred={file.starred}
              trashed={file.trashed}
              onRefetch={refetch}
              createdAt={file.createdAt}
              sizeMb={file.sizeMb}
            />
          ) : isVideoFileName(file.name) ? (
            <VideoFilePreview
              fileId={file.id}
              name={file.name}
              url={file.url}
              starred={file.starred}
              trashed={file.trashed}
              onRefetch={refetch}
              createdAt={file.createdAt}
              sizeMb={file.sizeMb}
            />
          ) : isTextCodeFileName(file.name) ? (
            <TextFilePreview
              fileId={file.id}
              name={file.name}
              url={file.url}
              starred={file.starred}
              trashed={file.trashed}
              onRefetch={refetch}
              createdAt={file.createdAt}
              sizeMb={file.sizeMb}
            />
          ) : (
            <OtherFileTile
              fileId={file.id}
              name={file.name}
              url={file.url}
              starred={file.starred}
              trashed={file.trashed}
              onRefetch={refetch}
              createdAt={file.createdAt}
              sizeMb={file.sizeMb}
            />
          )}
        </li>
      ))}
    </ul>
  );
}
