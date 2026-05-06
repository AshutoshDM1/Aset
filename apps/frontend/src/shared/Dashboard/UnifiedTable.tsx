import { format } from 'date-fns';
import { FileIcon, Folder, ImageIcon, FileText } from 'lucide-react';
import { Document, Page } from 'react-pdf';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { formatFileSize, isImageFileName } from '@/utils/file/file-utils';
import { Link } from 'react-router';
import { useState } from 'react';
import { ItemRowActions } from './ItemRowActions';
import { ImagePreviewDialog } from './ImagePreviewDialog';
import { PdfPreviewDialog } from './PdfPreviewDialog';
import { isPdfFileName } from '@/utils/file/file-utils';

export type UnifiedItem = {
  id: number;
  name: string;
  type: 'folder' | 'file';
  createdAt: string | Date;
  sizeMb?: number;
  url?: string;
  starred?: boolean;
  trashed?: boolean;
};

type UnifiedTableProps = {
  items: UnifiedItem[];
  onRefetch?: () => void;
};

export function UnifiedTable({ items, onRefetch }: UnifiedTableProps) {
  const [preview, setPreview] = useState<{ name: string; url: string } | null>(
    null,
  );

  const handleFileClick = (item: UnifiedItem) => {
    if (item.type === 'file' && item.url) {
      if (isImageFileName(item.name) || isPdfFileName(item.name)) {
        setPreview({ name: item.name, url: item.url });
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
            {items.map((item) => (
              <TableRow key={`${item.type}-${item.id}`} className="group">
                <TableCell className="font-medium">
                  {item.type === 'folder' ? (
                    <Link
                      to={`/dashboard/folder/${item.id}`}
                      className="flex items-center gap-3 hover:text-primary transition-colors"
                    >
                      <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <Folder className="size-5 fill-current" />
                      </div>
                      <span className="truncate">{item.name}</span>
                    </Link>
                  ) : (
                    <div
                      className="flex items-center gap-3 cursor-pointer group/item"
                      onClick={() => handleFileClick(item)}
                    >
                      <div className="flex size-10 items-center justify-center overflow-hidden rounded-lg bg-muted/40 text-muted-foreground ring-1 ring-border/60 group-hover/item:ring-primary/40 transition-all">
                        {isImageFileName(item.name) && item.url ? (
                          <img
                            src={item.url}
                            alt=""
                            className="size-full object-cover"
                          />
                        ) : isImageFileName(item.name) ? (
                          <ImageIcon className="size-5" />
                        ) : isPdfFileName(item.name) && item.url ? (
                          <Document
                            file={item.url}
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
                        ) : isPdfFileName(item.name) ? (
                          <FileText className="size-5 text-red-500" />
                        ) : (
                          <FileIcon className="size-5" />
                        )}
                      </div>
                      <span className="truncate group-hover/item:text-primary transition-colors">
                        {item.name}
                      </span>
                    </div>
                  )}
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  {item.sizeMb !== undefined
                    ? formatFileSize(item.sizeMb)
                    : '--'}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {format(new Date(item.createdAt), 'MMM d, yyyy')}
                </TableCell>
                <TableCell className="text-right">
                  <ItemRowActions
                    id={item.id}
                    type={item.type}
                    starred={item.starred}
                    trashed={item.trashed}
                    url={item.url}
                    onRefetch={onRefetch}
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
      />
      <PdfPreviewDialog
        open={!!preview && isPdfFileName(preview.name)}
        onOpenChange={(open) => !open && setPreview(null)}
        fileName={preview?.name ?? ''}
        fileUrl={preview?.url ?? ''}
      />
    </>
  );
}
