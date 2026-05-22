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
import { useMemo } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { useSelectionStore } from '@/store/selectionStore';
import { cn } from '@/lib/utils';

type FolderItem = {
  id: string;
  name: string;
  createdAt: Date;
  starred?: boolean;
  trashed?: boolean;
  sizeMb?: number;
  ownerName?: string | null;
  ownerEmail?: string | null;
};

type FolderTableProps = {
  folders: FolderItem[];
  onRefetch?: () => void;
  isOwner?: boolean;
};

export function FolderTable({
  folders,
  onRefetch,
  isOwner = true,
}: FolderTableProps) {
  const { selectedFolderIds, toggleFolder, selectFolders, clearSelection } =
    useSelectionStore();

  const allItemsChecked = useMemo(() => {
    if (folders.length === 0) return false;
    return folders.every((folder) => selectedFolderIds.includes(folder.id));
  }, [folders, selectedFolderIds]);

  return (
    <div className="rounded-md border border-border bg-background">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="w-10">
              <Checkbox
                checked={allItemsChecked}
                onCheckedChange={(checked) => {
                  if (checked) {
                    selectFolders(folders.map((f) => f.id));
                  } else {
                    clearSelection();
                  }
                }}
              />
            </TableHead>
            <TableHead className="w-75">Name</TableHead>
            {!isOwner && <TableHead>Shared By</TableHead>}
            <TableHead>Size</TableHead>
            <TableHead>Created At</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {folders.map((folder) => {
            const isChecked = selectedFolderIds.includes(folder.id);
            return (
              <TableRow
                key={folder.id}
                className={cn(
                  'group transition-colors',
                  isChecked && 'bg-primary/5 hover:bg-primary/5',
                )}
              >
                <TableCell>
                  <Checkbox
                    checked={isChecked}
                    onCheckedChange={() => toggleFolder(folder.id)}
                  />
                </TableCell>
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
                {!isOwner && (
                  <TableCell className="text-sm">
                    {folder.ownerName ? (
                      <div>
                        <span className="font-medium text-foreground">
                          {folder.ownerName}
                        </span>
                        {folder.ownerEmail && (
                          <span className="block text-xs text-muted-foreground">
                            {folder.ownerEmail}
                          </span>
                        )}
                      </div>
                    ) : folder.ownerEmail ? (
                      <span className="text-muted-foreground">
                        {folder.ownerEmail}
                      </span>
                    ) : (
                      <span className="text-muted-foreground italic">
                        Anonymous
                      </span>
                    )}
                  </TableCell>
                )}
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
                    isOwner={isOwner}
                    sizeMb={folder.sizeMb}
                    createdAt={folder.createdAt}
                  />
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
