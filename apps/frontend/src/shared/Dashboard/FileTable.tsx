import { format } from 'date-fns';
import { FileIcon, ImageIcon } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { formatFileSize, isImageFileName } from '@/utils/file/file-utils';
import { useState } from 'react';
import { ItemRowActions } from './ItemRowActions';
import { ImagePreviewDialog } from './ImagePreviewDialog';

type FileItem = {
  id: number;
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
  const [preview, setPreview] = useState<{ name: string; url: string } | null>(
    null,
  );

  const handleFileClick = (file: FileItem) => {
    if (isImageFileName(file.name) && file.url) {
      setPreview({ name: file.name, url: file.url });
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
                    starred={file.starred}
                    trashed={file.trashed}
                    url={file.url}
                    onRefetch={onRefetch}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <ImagePreviewDialog
        open={!!preview}
        onOpenChange={(open) => !open && setPreview(null)}
        fileName={preview?.name ?? ''}
        imageUrl={preview?.url ?? ''}
      />
    </>
  );
}
