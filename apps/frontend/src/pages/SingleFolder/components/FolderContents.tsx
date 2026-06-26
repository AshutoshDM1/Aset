import FolderComponent, {
  type FolderColor,
} from '@/shared/Dashboard/FolderComponent';
import ImageFilePreview from '@/shared/Dashboard/ImageFilePreview';
import { useViewMode, sortItems } from '@/context/ViewModeContext';
import {
  UnifiedTable,
  type UnifiedItem,
} from '@/shared/Dashboard/UnifiedTable';
import {
  isImageFileName,
  isPdfFileName,
  isVideoFileName,
  isTextCodeFileName,
} from '@/utils/file/file-utils';
import { OtherFileTile } from '@/shared/Dashboard/OtherFileTile';
import PdfFilePreview from '@/shared/Dashboard/PdfFilePreview';
import VideoFilePreview from '@/shared/Dashboard/VideoFilePreview';
import TextFilePreview from '@/shared/Dashboard/TextFilePreview';
import * as React from 'react';

const COLOR_CYCLE: FolderColor[] = ['cyan', 'yellow', 'pink', 'black'];

type FolderItem = {
  id: string;
  name: string;
  createdAt: string | Date;
  starred?: boolean;
  trashed?: boolean;
  sizeMb?: number;
};
type FileItem = {
  id: string;
  name: string;
  url: string;
  createdAt: string | Date;
  sizeMb: number;
  starred?: boolean;
  trashed?: boolean;
  processingStatus?: string | null;
};

type FolderContentsProps = {
  folders: FolderItem[];
  files: FileItem[];
  onRefetch?: () => void;
  emptyMessage?: string;
};

export function FolderContents({
  folders,
  files,
  onRefetch,
  emptyMessage = 'This folder is empty.',
}: FolderContentsProps) {
  const { viewMode, sortField, sortOrder } = useViewMode();

  const sortedFolders = React.useMemo(() => {
    return sortItems(
      folders.map((f) => ({
        ...f,
        starred: f.starred ?? false,
        trashed: f.trashed ?? false,
      })),
      sortField,
      sortOrder,
    );
  }, [folders, sortField, sortOrder]);

  const sortedFiles = React.useMemo(() => {
    return sortItems(
      files.map((f) => ({
        ...f,
        starred: f.starred ?? false,
        trashed: f.trashed ?? false,
      })),
      sortField,
      sortOrder,
    );
  }, [files, sortField, sortOrder]);

  const imageFiles = React.useMemo(
    () => sortedFiles.filter((f) => isImageFileName(f.name)),
    [sortedFiles],
  );
  const pdfFiles = React.useMemo(
    () => sortedFiles.filter((f) => isPdfFileName(f.name)),
    [sortedFiles],
  );
  const videoFiles = React.useMemo(
    () => sortedFiles.filter((f) => isVideoFileName(f.name)),
    [sortedFiles],
  );
  const textFiles = React.useMemo(
    () => sortedFiles.filter((f) => isTextCodeFileName(f.name)),
    [sortedFiles],
  );
  const otherFiles = React.useMemo(
    () =>
      sortedFiles.filter(
        (f) =>
          !isImageFileName(f.name) &&
          !isPdfFileName(f.name) &&
          !isVideoFileName(f.name) &&
          !isTextCodeFileName(f.name),
      ),
    [sortedFiles],
  );

  if (folders.length === 0 && files.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-border bg-muted/20 px-4 py-10 text-center text-sm text-muted-foreground">
        {emptyMessage}
      </p>
    );
  }

  if (viewMode === 'table') {
    const items: UnifiedItem[] = [
      ...sortedFolders.map((f) => ({ ...f, type: 'folder' as const })),
      ...sortedFiles.map((f) => ({ ...f, type: 'file' as const })),
    ];
    return <UnifiedTable items={items} onRefetch={onRefetch} />;
  }

  return (
    <ul className="grid grid-cols-3 md:grid-cols-8 xl:grid-cols-10 gap-2 justify-evenly">
      {sortedFolders.map((item, index) => (
        <li key={`f-${item.id}`}>
          <FolderComponent
            folderId={item.id}
            folderName={item.name}
            color={COLOR_CYCLE[index % COLOR_CYCLE.length]}
            starred={item.starred}
            trashed={item.trashed}
            onRefetch={onRefetch}
          />
        </li>
      ))}
      {imageFiles.map((item) => (
        <li key={`file-${item.id}`}>
          <ImageFilePreview
            fileId={item.id}
            name={item.name}
            url={item.url}
            starred={item.starred}
            trashed={item.trashed}
            onRefetch={onRefetch}
            allImages={imageFiles}
          />
        </li>
      ))}
      {pdfFiles.map((item) => (
        <li key={`file-${item.id}`}>
          <PdfFilePreview
            fileId={item.id}
            name={item.name}
            url={item.url}
            starred={item.starred}
            trashed={item.trashed}
            onRefetch={onRefetch}
            allPdfs={pdfFiles}
          />
        </li>
      ))}
      {videoFiles.map((item) => (
        <li key={`file-${item.id}`}>
          <VideoFilePreview
            fileId={item.id}
            name={item.name}
            url={item.url}
            starred={item.starred}
            trashed={item.trashed}
            onRefetch={onRefetch}
            processingStatus={item.processingStatus}
            allVideos={videoFiles}
          />
        </li>
      ))}
      {textFiles.map((item) => (
        <li key={`file-${item.id}`}>
          <TextFilePreview
            fileId={item.id}
            name={item.name}
            url={item.url}
            starred={item.starred}
            trashed={item.trashed}
            onRefetch={onRefetch}
          />
        </li>
      ))}
      {otherFiles.map((item) => (
        <li key={`file-${item.id}`}>
          <OtherFileTile
            fileId={item.id}
            name={item.name}
            url={item.url}
            starred={item.starred}
            trashed={item.trashed}
            onRefetch={onRefetch}
          />
        </li>
      ))}
    </ul>
  );
}
