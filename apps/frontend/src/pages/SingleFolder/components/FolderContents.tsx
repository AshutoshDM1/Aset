import FolderComponent, {
  type FolderColor,
} from '@/shared/Dashboard/FolderComponent';
import ImageFilePreview from '@/shared/Dashboard/ImageFilePreview';
import { useViewMode } from '@/context/ViewModeContext';
import {
  UnifiedTable,
  type UnifiedItem,
} from '@/shared/Dashboard/UnifiedTable';
import { isImageFileName, isPdfFileName } from '@/utils/file/file-utils';
import { OtherFileTile } from '@/shared/Dashboard/OtherFileTile';
import PdfFilePreview from '@/shared/Dashboard/PdfFilePreview';

const COLOR_CYCLE: FolderColor[] = ['cyan', 'yellow', 'pink', 'black'];

type FolderItem = {
  id: number;
  name: string;
  createdAt: string | Date;
  starred?: boolean;
  trashed?: boolean;
  sizeMb?: number;
};
type FileItem = {
  id: number;
  name: string;
  url: string;
  createdAt: string | Date;
  sizeMb: number;
  starred?: boolean;
  trashed?: boolean;
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
  const { viewMode } = useViewMode();
  const imageFiles = files.filter((f) => isImageFileName(f.name));
  const pdfFiles = files.filter((f) => isPdfFileName(f.name));
  const otherFiles = files.filter(
    (f) => !isImageFileName(f.name) && !isPdfFileName(f.name),
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
      ...folders.map((f) => ({ ...f, type: 'folder' as const })),
      ...files.map((f) => ({ ...f, type: 'file' as const })),
    ];
    return <UnifiedTable items={items} onRefetch={onRefetch} />;
  }

  return (
    <ul className="grid gap-4 grid-cols-3 md:grid-cols-4 lg:grid-cols-10">
      {folders.map((item, index) => (
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
        <li key={`file-${item.id}`} className="flex items-start justify-center">
          <ImageFilePreview
            fileId={item.id}
            name={item.name}
            url={item.url}
            starred={item.starred}
            trashed={item.trashed}
            onRefetch={onRefetch}
          />
        </li>
      ))}
      {pdfFiles.map((item) => (
        <li key={`file-${item.id}`} className="flex items-start justify-center">
          <PdfFilePreview
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
        <li key={`file-${item.id}`} className="flex items-start justify-center">
          <OtherFileTile
            fileId={item.id}
            name={item.name}
            starred={item.starred}
            trashed={item.trashed}
            onRefetch={onRefetch}
          />
        </li>
      ))}
    </ul>
  );
}
