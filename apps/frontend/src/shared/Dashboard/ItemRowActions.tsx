import { useState } from 'react';
import {
  Star,
  Trash2,
  Download,
  RotateCcw,
  MoreHorizontal,
  Pencil,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { trpc } from '@/utils/trpc';
import { toast } from 'sonner';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import { RenameDialog } from './RenameDialog';
import { useFileDownload } from './useFileDownload';

interface ItemRowActionsProps {
  id: number;
  type: 'folder' | 'file';
  name: string;
  starred?: boolean;
  trashed?: boolean;
  url?: string;
  onRefetch?: () => void;
}

export function ItemRowActions({
  id,
  type,
  name,
  starred,
  trashed,
  url,
  onRefetch,
}: ItemRowActionsProps) {
  const queryClient = useQueryClient();
  const [isRenameOpen, setIsRenameOpen] = useState(false);

  const folderStarMutation = useMutation({
    ...trpc.folder.toggleStar.mutationOptions(),
    onSuccess: () => {
      void queryClient.invalidateQueries(trpc.folder.list.queryFilter());
      void queryClient.invalidateQueries(trpc.folder.getStarred.queryFilter());
      onRefetch?.();
    },
  });

  const fileStarMutation = useMutation({
    ...trpc.file.toggleStar.mutationOptions(),
    onSuccess: () => {
      void queryClient.invalidateQueries(trpc.file.getRecent.queryFilter());
      void queryClient.invalidateQueries(trpc.file.getStarred.queryFilter());
      onRefetch?.();
    },
  });

  const folderTrashMutation = useMutation({
    ...trpc.folder.toggleTrash.mutationOptions(),
    onSuccess: (_, variables) => {
      void queryClient.invalidateQueries(trpc.folder.list.queryFilter());
      void queryClient.invalidateQueries(trpc.folder.getTrash.queryFilter());
      onRefetch?.();
      toast.success(
        variables.trashed ? 'Folder moved to trash' : 'Folder restored',
      );
    },
  });

  const fileTrashMutation = useMutation({
    ...trpc.file.toggleTrash.mutationOptions(),
    onSuccess: (_, variables) => {
      void queryClient.invalidateQueries(trpc.file.getRecent.queryFilter());
      void queryClient.invalidateQueries(trpc.file.getTrash.queryFilter());
      onRefetch?.();
      toast.success(
        variables.trashed ? 'File moved to trash' : 'File restored',
      );
    },
  });

  const { download } = useFileDownload();

  const handleStar = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (type === 'folder') {
      folderStarMutation.mutate({ id, starred: !starred });
    } else {
      fileStarMutation.mutate({ id, starred: !starred });
    }
  };

  const handleTrash = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (type === 'folder') {
      folderTrashMutation.mutate({ id, trashed: !trashed });
    } else {
      fileTrashMutation.mutate({ id, trashed: !trashed });
    }
  };

  const handleDownload = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await download(id, name, url);
  };

  return (
    <>
      <div className="flex items-center justify-end gap-1 transition-opacity">
        {!trashed && (
          <Button
            variant="ghost"
            size="icon"
            className={
              starred
                ? 'text-yellow-400 hover:text-yellow-500 hover:bg-yellow-400/10'
                : 'text-muted-foreground'
            }
            onClick={handleStar}
            title={starred ? 'Unstar' : 'Star'}
          >
            <Star className={starred ? 'fill-current size-4' : 'size-4'} />
          </Button>
        )}

        <Button
          variant="ghost"
          size="icon"
          className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
          onClick={handleTrash}
          title={trashed ? 'Restore' : 'Move to Trash'}
        >
          {trashed ? (
            <RotateCcw className="size-4" />
          ) : (
            <Trash2 className="size-4" />
          )}
        </Button>

        {type === 'file' && url && !trashed && (
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:bg-primary/10 hover:text-primary"
            onClick={handleDownload}
            title="Download"
          >
            <Download className="size-4" />
          </Button>
        )}

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:bg-muted"
              onClick={(e) => {
                e.stopPropagation();
              }}
            >
              <MoreHorizontal className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation();
                setIsRenameOpen(true);
              }}
            >
              <Pencil className="size-3.5 mr-2" />
              Rename
            </DropdownMenuItem>
            {!trashed && (
              <DropdownMenuItem onClick={handleStar}>
                <Star
                  className={cn(
                    'size-3.5 mr-2',
                    starred && 'fill-current text-yellow-400',
                  )}
                />
                {starred ? 'Unstar' : 'Star'}
              </DropdownMenuItem>
            )}
            {type === 'file' && url && !trashed && (
              <DropdownMenuItem onClick={handleDownload}>
                <Download className="size-3.5 mr-2" />
                Download
              </DropdownMenuItem>
            )}
            <DropdownMenuItem
              onClick={handleTrash}
              className={cn(!trashed && 'text-destructive')}
            >
              {trashed ? (
                <>
                  <RotateCcw className="size-3.5 mr-2" />
                  Restore
                </>
              ) : (
                <>
                  <Trash2 className="size-3.5 mr-2" />
                  Move to Trash
                </>
              )}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <RenameDialog
        id={id}
        type={type}
        currentName={name}
        open={isRenameOpen}
        onOpenChange={setIsRenameOpen}
        onRefetch={onRefetch}
      />
    </>
  );
}
