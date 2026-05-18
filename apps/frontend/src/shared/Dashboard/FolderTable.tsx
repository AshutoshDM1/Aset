import { format } from 'date-fns';
import { Folder } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Link } from 'react-router';
import { ItemRowActions } from './ItemRowActions';
import { formatFileSize } from '@/utils/file/file-utils';

type FolderItem = {
  id: number;
  name: string;
  createdAt: Date;
  starred?: boolean;
  trashed?: boolean;
  sizeMb?: number;
};

type FolderTableProps = {
  folders: FolderItem[];
  onRefetch?: () => void;
};

export function FolderTable({ folders, onRefetch }: FolderTableProps) {
  return (
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
          {folders.map((folder) => (
            <TableRow key={folder.id} className="group">
              <TableCell className="font-medium">
                <Link
                  to={`/dashboard/folder/${folder.id}`}
                  className="flex items-center gap-3 hover:text-primary transition-colors"
                >
                  <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Folder className="size-5 fill-current" />
                  </div>
                  <span className="truncate">{folder.name}</span>
                </Link>
              </TableCell>
              <TableCell className="text-muted-foreground text-sm">
                {folder.sizeMb !== undefined
                  ? formatFileSize(folder.sizeMb)
                  : '--'}
              </TableCell>
              <TableCell className="text-muted-foreground">
                {format(new Date(folder.createdAt), 'MMM d, yyyy')}
              </TableCell>
              <TableCell className="text-right">
                <ItemRowActions
                  id={folder.id}
                  type="folder"
                  name={folder.name}
                  starred={folder.starred}
                  trashed={folder.trashed}
                  onRefetch={onRefetch}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
