import { useState } from 'react';
import {
  Star,
  Trash2,
  RotateCcw,
  MoreVertical,
  Pencil,
  Download,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { trpc } from '@/utils/trpc';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import { Share2 } from 'lucide-react';
import { ShareDialog } from './ShareDialog';
import { RenameDialog } from './RenameDialog';
import { useFileDownload } from './useFileDownload';

interface ItemGridActionsProps {
  id: string;
  type: 'folder' | 'file';
  name: string;
  starred?: boolean;
  trashed?: boolean;
  url?: string;
  onRefetch?: () => void;
  isOwner?: boolean;
}

export function ItemGridActions({
  id,
  type,
  name,
  starred,
  trashed,
  url,
  onRefetch,
  isOwner = true,
}: ItemGridActionsProps) {
  const queryClient = useQueryClient();
  const [isRenameOpen, setIsRenameOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const { download } = useFileDownload();

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
    onSuccess: (_, v) => {
      void queryClient.invalidateQueries(trpc.folder.list.queryFilter());
      void queryClient.invalidateQueries(trpc.folder.getTrash.queryFilter());
      onRefetch?.();
      toast.success(v.trashed ? 'Folder moved to trash' : 'Folder restored');
    },
  });

  const fileTrashMutation = useMutation({
    ...trpc.file.toggleTrash.mutationOptions(),
    onSuccess: (_, v) => {
      void queryClient.invalidateQueries(trpc.file.getRecent.queryFilter());
      void queryClient.invalidateQueries(trpc.file.getTrash.queryFilter());
      onRefetch?.();
      toast.success(v.trashed ? 'File moved to trash' : 'File restored');
    },
  });

  const handleStar = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (type === 'folder') {
      folderStarMutation.mutate({ id, starred: !starred });
    } else {
      fileStarMutation.mutate({ id, starred: !starred });
    }
  };

  const handleTrash = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (type === 'folder') {
      folderTrashMutation.mutate({ id, trashed: !trashed });
    } else {
      fileTrashMutation.mutate({ id, trashed: !trashed });
    }
  };

  const handleDownload = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    await download(id, name, url);
  };

  const showTrigger = type === 'file' || isOwner;
  if (!showTrigger) return null;

  return (
    <>
      <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="secondary"
              size="icon"
              className="size-7 rounded-full bg-background/80 backdrop-blur shadow-sm border border-border text-muted-foreground hover:text-foreground animate-in"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
            >
              <MoreVertical className="size-3.5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            {isOwner && (
              <DropdownMenuItem
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsRenameOpen(true);
                }}
              >
                <Pencil className="size-3.5 mr-2" />
                Rename
              </DropdownMenuItem>
            )}
            {type === 'folder' && isOwner && (
              <DropdownMenuItem
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsShareOpen(true);
                }}
              >
                <Share2 className="size-3.5 mr-2" />
                Share
              </DropdownMenuItem>
            )}
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
            {isOwner && (
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
            )}
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

      {type === 'folder' && isOwner && (
        <ShareDialog
          id={id}
          folderName={name}
          open={isShareOpen}
          onOpenChange={setIsShareOpen}
        />
      )}
    </>
  );
}
