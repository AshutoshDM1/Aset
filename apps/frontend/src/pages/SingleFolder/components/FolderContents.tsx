import { FileIcon } from 'lucide-react';
import FolderComponent, {
  type FolderColor,
} from '@/shared/Dashboard/FolderComponent';
import ImageFilePreview from '@/shared/Dashboard/ImageFilePreview';

const COLOR_CYCLE: FolderColor[] = ['cyan', 'yellow', 'pink', 'black'];

const IMAGE_NAME = /\.(jpe?g|png|gif|webp|avif|svg|bmp|ico)$/i;

function isImageFileName(name: string) {
  return IMAGE_NAME.test(name);
}

type FolderItem = { id: number; name: string };
type FileItem = { id: number; name: string; url: string };

type FolderContentsProps = {
  folders: FolderItem[];
  files: FileItem[];
  onRefetch?: () => void;
};

function OtherFileTile({ name }: { name: string }) {
  const dot = name.lastIndexOf('.');
  const base = dot > 0 ? name.slice(0, dot) : name;
  const ext = dot > 0 ? name.slice(dot) : '';

  return (
    <a
      aria-label={name}
      title={name}
      className="group flex flex-col items-center rounded-2xl p-2 transition-transform duration-200 hover:-translate-y-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <div className="flex size-20 items-center justify-center overflow-hidden rounded-2xl bg-muted/40 ring-1 ring-border/60">
        <FileIcon className="size-8 text-muted-foreground" aria-hidden />
      </div>
      <p className="text-sm text-foreground">
        <span className="truncate  inline-block align-bottom">
          {base.slice(0, 5)}
          {base.length > 5 ? '..' : ''}
        </span>
        {ext}
      </p>
    </a>
  );
}

export function FolderContents({ folders, files }: FolderContentsProps) {
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
        <li key={`file-${item.id}`} className="flex items-start justify-center">
          <ImageFilePreview name={item.name} url={item.url} />
        </li>
      ))}
      {otherFiles.map((item) => (
        <li key={`file-${item.id}`} className="flex items-start justify-center">
          <OtherFileTile name={item.name} />
        </li>
      ))}
    </ul>
  );
}
