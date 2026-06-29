import { FileIcon, ImageIcon, FileText, Video, Download } from 'lucide-react';
import FileThumbnail from '@/shared/Dashboard/FileThumbnail';
import {
  isImageFileName,
  isPdfFileName,
  isVideoFileName,
  isTextCodeFileName,
} from '@/utils/file/file-utils';

type TopFileItem = {
  id: string;
  name: string;
  sizeMb: number;
  thumbnailUrl: string | null;
  downloadCount: number;
};

type TopFilesProps = {
  files: TopFileItem[];
};

export function TopFiles({ files }: TopFilesProps) {
  return (
    <div className="h-full flex flex-col justify-between rounded-lg bg-background p-5 shadow-sm ring-1 ring-border/60">
      <div>
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold">Top files</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Most downloaded files
            </p>
          </div>
        </div>

        <ul className="mt-4 divide-y divide-border/60">
          {files.map((file) => (
            <li
              key={file.id}
              className="flex items-center justify-between gap-3 py-3 text-sm"
            >
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-md bg-muted/40 text-muted-foreground ring-1 ring-border/60">
                  <FileThumbnail
                    name={file.name}
                    thumbnailUrl={file.thumbnailUrl}
                    view="list"
                    outerSvg={false}
                    fallbackIcon={
                      isImageFileName(file.name)
                        ? ImageIcon
                        : isPdfFileName(file.name)
                          ? FileText
                          : isVideoFileName(file.name)
                            ? Video
                            : isTextCodeFileName(file.name)
                              ? FileText
                              : FileIcon
                    }
                    fallbackColorClass={
                      isPdfFileName(file.name)
                        ? 'text-red-500'
                        : isVideoFileName(file.name)
                          ? 'text-indigo-500'
                          : isTextCodeFileName(file.name)
                            ? 'text-amber-500'
                            : 'text-muted-foreground'
                    }
                  />
                </div>
                <span
                  className="min-w-0 truncate font-medium text-foreground"
                  title={file.name}
                >
                  {file.name}
                </span>
              </div>
              <div className="flex items-center gap-1 shrink-0 text-muted-foreground">
                <span className="font-semibold text-foreground text-sm tabular-nums">
                  {file.downloadCount}
                </span>
                <Download className="size-3.5 stroke-[1.5]" />
              </div>
            </li>
          ))}
          {files.length === 0 && (
            <li className="py-6 text-center text-sm text-muted-foreground">
              No files downloaded yet.
            </li>
          )}
        </ul>
      </div>
    </div>
  );
}
