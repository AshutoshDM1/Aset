import { format } from 'date-fns';
import { FileIcon, ImageIcon, FileText, Video } from 'lucide-react';
import { Document, Page } from 'react-pdf';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  formatFileSize,
  isImageFileName,
  isPdfFileName,
  isVideoFileName,
  isTextCodeFileName,
} from '@/utils/file/file-utils';
import { useState, useMemo } from 'react';
import { ItemRowActions } from './ItemRowActions';
import { ImagePreviewDialog } from './ImagePreviewDialog';
import { PdfPreviewDialog } from './PdfPreviewDialog';
import { VideoPreview } from '@/components/videoPreview';
import { TextPreview } from '@/components/textPreview';
import { Checkbox } from '@/components/ui/checkbox';
import { useSelectionStore } from '@/store/selectionStore';
import { cn } from '@/lib/utils';

type FileItem = {
  id: string;
  name: string;
  url: string;
  createdAt: Date;
  sizeMb: number;
  starred?: boolean;
  trashed?: boolean;
  processingStatus?: string | null;
};

type FileTableProps = {
  files: FileItem[];
  onRefetch?: () => void;
};

export function FileTable({ files, onRefetch }: FileTableProps) {
  const [preview, setPreview] = useState<FileItem | null>(null);
  const [optimizationStats, setOptimizationStats] = useState<{
    oldSize: number;
    newSize: number;
    savedPercent: number;
  } | null>(null);
  const { selectedFileIds, toggleFile, selectFiles, clearSelection } =
    useSelectionStore();

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setPreview(null);
      setOptimizationStats(null);
    }
  };

  const handleFileClick = (file: FileItem) => {
    if (file.url) {
      if (
        isImageFileName(file.name) ||
        isPdfFileName(file.name) ||
        isVideoFileName(file.name) ||
        isTextCodeFileName(file.name)
      ) {
        setPreview(file);
      }
    }
  };

  const allItemsChecked = useMemo(() => {
    if (files.length === 0) return false;
    return files.every((file) => selectedFileIds.includes(file.id));
  }, [files, selectedFileIds]);

  return (
    <>
      <div className="rounded-md border border-border bg-background">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-10">
                <Checkbox
                  checked={allItemsChecked}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      selectFiles(files.map((f) => f.id));
                    } else {
                      clearSelection();
                    }
                  }}
                />
              </TableHead>
              <TableHead className="w-100">Name</TableHead>
              <TableHead>Size</TableHead>
              <TableHead>Created At</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {files.map((file) => {
              const isChecked = selectedFileIds.includes(file.id);
              return (
                <TableRow
                  key={file.id}
                  className={cn(
                    'group transition-colors',
                    isChecked && 'bg-primary/5 hover:bg-primary/5',
                  )}
                >
                  <TableCell>
                    <Checkbox
                      checked={isChecked}
                      onCheckedChange={() => toggleFile(file.id)}
                    />
                  </TableCell>
                  <TableCell className="font-medium">
                    <div
                      className="flex items-center gap-3 cursor-pointer group/item"
                      onClick={() => handleFileClick(file)}
                    >
                      <div className="flex size-10 items-center justify-center overflow-hidden rounded-lg bg-muted/40 text-muted-foreground ring-1 ring-border/60 group-hover/item:ring-primary/40 transition-all">
                        {isImageFileName(file.name) && file.url ? (
                          <img
                            src={file.url}
                            alt=""
                            className="size-full object-cover"
                          />
                        ) : isImageFileName(file.name) ? (
                          <ImageIcon className="size-5" />
                        ) : isPdfFileName(file.name) && file.url ? (
                          <Document
                            file={file.url}
                            loading={
                              <FileText className="size-5 text-red-500/50" />
                            }
                          >
                            <Page
                              pageNumber={1}
                              width={40}
                              renderTextLayer={false}
                              renderAnnotationLayer={false}
                              loading={null}
                            />
                          </Document>
                        ) : isPdfFileName(file.name) ? (
                          <FileText className="size-5 text-red-500" />
                        ) : isVideoFileName(file.name) && file.url ? (
                          <video
                            src={`${file.url}#t=0.1`}
                            preload="metadata"
                            muted
                            playsInline
                            className="size-full object-cover"
                          />
                        ) : isVideoFileName(file.name) ? (
                          <Video className="size-5 text-indigo-500" />
                        ) : isTextCodeFileName(file.name) ? (
                          <FileText className="size-5 text-amber-500" />
                        ) : (
                          <FileIcon className="size-5" />
                        )}
                      </div>
                      <span className="truncate group-hover/item:text-primary transition-colors">
                        {file.name}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {formatFileSize(file.sizeMb)}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {format(new Date(file.createdAt), 'MMM d, yyyy')}
                  </TableCell>
                  <TableCell className="text-right">
                    <ItemRowActions
                      id={file.id}
                      type="file"
                      name={file.name}
                      starred={file.starred}
                      trashed={file.trashed}
                      url={file.url}
                      onRefetch={onRefetch}
                      sizeMb={file.sizeMb}
                      createdAt={file.createdAt}
                      processingStatus={file.processingStatus}
                    />
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <ImagePreviewDialog
        open={!!preview && isImageFileName(preview.name)}
        onOpenChange={handleOpenChange}
        fileName={preview?.name ?? ''}
        imageUrl={preview?.url ?? ''}
        fileId={preview?.id}
        sizeMb={preview?.sizeMb}
        createdAt={preview?.createdAt}
        starred={preview?.starred}
        trashed={preview?.trashed}
        onRefetch={onRefetch}
        optimizationStats={optimizationStats}
        onOptimizeSuccess={(stats) => {
          setOptimizationStats(stats);
          const currentPreview = preview;
          setPreview(null);
          setTimeout(() => {
            const updated = files.find((f) => f.id === currentPreview?.id);
            setPreview(updated || currentPreview);
          }, 600);
        }}
      />
      <PdfPreviewDialog
        open={!!preview && isPdfFileName(preview.name)}
        onOpenChange={(open) => !open && setPreview(null)}
        fileName={preview?.name ?? ''}
        fileUrl={preview?.url ?? ''}
        fileId={preview?.id ?? ''}
      />
      <VideoPreview
        open={!!preview && isVideoFileName(preview.name)}
        onClose={() => setPreview(null)}
        fileName={preview?.name ?? ''}
        fileUrl={preview?.url ?? ''}
        fileId={preview?.id}
      />
      <TextPreview
        open={!!preview && isTextCodeFileName(preview.name)}
        onClose={() => setPreview(null)}
        fileName={preview?.name ?? ''}
        fileUrl={preview?.url ?? ''}
        fileId={preview?.id}
      />
    </>
  );
}
