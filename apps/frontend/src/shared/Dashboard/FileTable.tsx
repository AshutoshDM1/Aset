import { format } from 'date-fns';
import { FileIcon, ImageIcon, FileText } from 'lucide-react';
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
} from '@/utils/file/file-utils';
import { useState } from 'react';
import { ItemRowActions } from './ItemRowActions';
import { ImagePreviewDialog } from './ImagePreviewDialog';
import { PdfPreviewDialog } from './PdfPreviewDialog';

type FileItem = {
  id: string;
  name: string;
  url: string;
  createdAt: Date;
  sizeMb: number;
  starred?: boolean;
  trashed?: boolean;
};

type FileTableProps = {
  files: FileItem[];
  onRefetch?: () => void;
};

export function FileTable({ files, onRefetch }: FileTableProps) {
  const [preview, setPreview] = useState<FileItem | null>(null);

  const handleFileClick = (file: FileItem) => {
    if (file.url) {
      if (isImageFileName(file.name) || isPdfFileName(file.name)) {
        setPreview(file);
      }
    }
  };

  return (
    <>
      <div className="rounded-md border border-border bg-background">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-[400px]">Name</TableHead>
              <TableHead>Size</TableHead>
              <TableHead>Created At</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {files.map((file) => (
              <TableRow key={file.id} className="group">
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
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <ImagePreviewDialog
        open={!!preview && isImageFileName(preview.name)}
        onOpenChange={(open) => !open && setPreview(null)}
        fileName={preview?.name ?? ''}
        imageUrl={preview?.url ?? ''}
        fileId={preview?.id}
        sizeMb={preview?.sizeMb}
        createdAt={preview?.createdAt}
        starred={preview?.starred}
        trashed={preview?.trashed}
      />
      <PdfPreviewDialog
        open={!!preview && isPdfFileName(preview.name)}
        onOpenChange={(open) => !open && setPreview(null)}
        fileName={preview?.name ?? ''}
        fileUrl={preview?.url ?? ''}
        fileId={preview?.id ?? ''}
      />
    </>
  );
}
