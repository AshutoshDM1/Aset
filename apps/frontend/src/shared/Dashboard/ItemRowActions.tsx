import { useState } from 'react';
import {
  Star,
  Trash2,
  Download,
  RotateCcw,
  MoreHorizontal,
  Pencil,
  Info,
  Loader2,
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
import { Share2, ArrowRight } from 'lucide-react';
import { ShareDialog } from './ShareDialog';
import { RenameDialog } from './RenameDialog';
import { useFileDownload } from '../../hooks/useFileDownload';
import { DeleteConfirmDialog } from './DeleteConfirmDialog';
import { DetailsDialog } from './DetailsDialog';
import { MoveDialog } from './MoveDialog';

interface ItemRowActionsProps {
  id: string;
  type: 'folder' | 'file';
  name: string;
  starred?: boolean;
  trashed?: boolean;
  url?: string;
  onRefetch?: () => void;
  isOwner?: boolean;
  sizeMb?: number;
  createdAt?: Date | string;
}

export function ItemRowActions({
  id,
  type,
  name,
  starred,
  trashed,
  url,
  onRefetch,
  isOwner = true,
  sizeMb,
  createdAt,
}: ItemRowActionsProps) {
  const queryClient = useQueryClient();
  const [isRenameOpen, setIsRenameOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isMoveOpen, setIsMoveOpen] = useState(false);

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

  const folderDeletePermanentlyMutation = useMutation({
    ...trpc.folder.deletePermanently.mutationOptions(),
    onSuccess: () => {
      void queryClient.invalidateQueries(trpc.folder.list.queryFilter());
      void queryClient.invalidateQueries(trpc.folder.getTrash.queryFilter());
      void queryClient.invalidateQueries(trpc.user.me.queryFilter());
      setIsDeleteConfirmOpen(false);
      onRefetch?.();
      toast.success('Folder permanently deleted');
    },
    onError: (err) => {
      toast.error(err.message || 'Could not permanently delete folder');
    },
  });

  const fileDeletePermanentlyMutation = useMutation({
    ...trpc.file.deletePermanently.mutationOptions(),
    onSuccess: () => {
      void queryClient.invalidateQueries(trpc.file.getRecent.queryFilter());
      void queryClient.invalidateQueries(trpc.file.getTrash.queryFilter());
      void queryClient.invalidateQueries(trpc.user.me.queryFilter());
      setIsDeleteConfirmOpen(false);
      onRefetch?.();
      toast.success('File permanently deleted');
    },
    onError: (err) => {
      toast.error(err.message || 'Could not permanently delete file');
    },
  });

  const isStarPending =
    type === 'folder'
      ? folderStarMutation.isPending
      : fileStarMutation.isPending;
  const isTrashPending =
    type === 'folder'
      ? folderTrashMutation.isPending
      : fileTrashMutation.isPending;
  const isDeletePending =
    type === 'folder'
      ? folderDeletePermanentlyMutation.isPending
      : fileDeletePermanentlyMutation.isPending;
  const isAnyPending = isStarPending || isTrashPending || isDeletePending;

  const { download } = useFileDownload();

  const handleStar = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (type === 'folder') {
      folderStarMutation.mutate({ id, starred: !starred });
    } else {
      fileStarMutation.mutate({ id, starred: !starred });
    }
  };

  const handleTrash = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (type === 'folder') {
      folderTrashMutation.mutate({ id, trashed: !trashed });
    } else {
      fileTrashMutation.mutate({ id, trashed: !trashed });
    }
  };

  const handleDeletePermanently = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setIsDeleteConfirmOpen(true);
  };

  const handleConfirmDeletePermanently = () => {
    if (type === 'folder') {
      folderDeletePermanentlyMutation.mutate({ id });
    } else {
      fileDeletePermanentlyMutation.mutate({ id });
    }
  };

  const showTrigger = type === 'file' || isOwner;

  return (
    <>
      <div className="flex items-center justify-end gap-1 transition-opacity">
        {!trashed && (type === 'file' || isOwner) && (
          <Button
            variant="ghost"
            size="icon"
            disabled={isStarPending}
            className={
              starred
                ? 'text-yellow-400 hover:text-yellow-500 hover:bg-yellow-400/10 animate-in fade-in duration-200'
                : 'text-muted-foreground'
            }
            onClick={handleStar}
            title={starred ? 'Unstar' : 'Star'}
          >
            {isStarPending ? (
              <Loader2 className="size-4 animate-spin text-primary" />
            ) : (
              <Star className={starred ? 'fill-current size-4' : 'size-4'} />
            )}
          </Button>
        )}

        {isOwner && (
          <>
            <Button
              variant="ghost"
              size="icon"
              disabled={isTrashPending}
              className="text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
              onClick={handleTrash}
              title={trashed ? 'Restore' : 'Move to Trash'}
            >
              {isTrashPending ? (
                <Loader2 className="size-4 animate-spin text-primary" />
              ) : trashed ? (
                <RotateCcw className="size-4" />
              ) : (
                <Trash2 className="size-4" />
              )}
            </Button>
            {trashed && (
              <Button
                variant="ghost"
                size="icon"
                disabled={isDeletePending}
                className="text-destructive hover:bg-destructive/10 transition-colors"
                onClick={handleDeletePermanently}
                title="Delete Permanently"
              >
                {isDeletePending ? (
                  <Loader2 className="size-4 animate-spin text-primary" />
                ) : (
                  <Trash2 className="size-4" />
                )}
              </Button>
            )}
          </>
        )}

        {type === 'file' && url && !trashed && (
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors"
            onClick={async (e) => {
              e.stopPropagation();
              await download(id, name, url);
            }}
            title="Download"
          >
            <Download className="size-4" />
          </Button>
        )}

        {showTrigger && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                disabled={isAnyPending}
                className="text-muted-foreground hover:bg-muted"
                onClick={(e) => {
                  e.stopPropagation();
                }}
              >
                {isAnyPending ? (
                  <Loader2 className="size-4 animate-spin text-primary" />
                ) : (
                  <MoreHorizontal className="size-4" />
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuItem
                onSelect={(e) => {
                  e.preventDefault();
                  setTimeout(() => {
                    setIsDetailsOpen(true);
                  }, 100);
                }}
              >
                <Info className="size-3.5 mr-2" />
                View Details
              </DropdownMenuItem>

              {isOwner && (
                <DropdownMenuItem
                  onSelect={(e) => {
                    e.preventDefault();
                    setTimeout(() => {
                      setIsRenameOpen(true);
                    }, 100);
                  }}
                >
                  <Pencil className="size-3.5 mr-2" />
                  Rename
                </DropdownMenuItem>
              )}
              {isOwner && !trashed && (
                <DropdownMenuItem
                  onSelect={(e) => {
                    e.preventDefault();
                    setTimeout(() => {
                      setIsMoveOpen(true);
                    }, 100);
                  }}
                >
                  <ArrowRight className="size-3.5 mr-2" />
                  Move to Folder
                </DropdownMenuItem>
              )}
              {type === 'folder' && isOwner && (
                <DropdownMenuItem
                  onSelect={(e) => {
                    e.preventDefault();
                    setTimeout(() => {
                      setIsShareOpen(true);
                    }, 100);
                  }}
                >
                  <Share2 className="size-3.5 mr-2" />
                  Share
                </DropdownMenuItem>
              )}
              {!trashed && (type === 'file' || isOwner) && (
                <DropdownMenuItem
                  disabled={isStarPending}
                  onSelect={() => handleStar()}
                >
                  {isStarPending ? (
                    <Loader2 className="size-3.5 mr-2 animate-spin text-primary" />
                  ) : (
                    <Star
                      className={cn(
                        'size-3.5 mr-2',
                        starred && 'fill-current text-yellow-400',
                      )}
                    />
                  )}
                  {starred ? 'Unstar' : 'Star'}
                </DropdownMenuItem>
              )}
              {type === 'file' && url && !trashed && (
                <DropdownMenuItem
                  onSelect={() => {
                    void download(id, name, url);
                  }}
                >
                  <Download className="size-3.5 mr-2" />
                  Download
                </DropdownMenuItem>
              )}
              {isOwner && (
                <DropdownMenuItem
                  disabled={isTrashPending}
                  onSelect={() => handleTrash()}
                  className={cn(!trashed && 'text-destructive')}
                >
                  {isTrashPending ? (
                    <Loader2 className="size-3.5 mr-2 animate-spin text-primary" />
                  ) : trashed ? (
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
              {isOwner && trashed && (
                <DropdownMenuItem
                  disabled={isDeletePending}
                  onSelect={(e) => {
                    e.preventDefault();
                    setTimeout(() => {
                      setIsDeleteConfirmOpen(true);
                    }, 100);
                  }}
                  className="text-destructive font-medium"
                >
                  {isDeletePending ? (
                    <Loader2 className="size-3.5 mr-2 animate-spin text-primary" />
                  ) : (
                    <Trash2 className="size-3.5 mr-2" />
                  )}
                  Delete Permanently
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
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

      <DeleteConfirmDialog
        open={isDeleteConfirmOpen}
        onOpenChange={setIsDeleteConfirmOpen}
        onConfirm={handleConfirmDeletePermanently}
        type={type}
        name={name}
        isPending={
          folderDeletePermanentlyMutation.isPending ||
          fileDeletePermanentlyMutation.isPending
        }
      />

      <DetailsDialog
        open={isDetailsOpen}
        onOpenChange={setIsDetailsOpen}
        id={id}
        type={type}
        name={name}
        sizeMb={sizeMb}
        createdAt={createdAt}
        starred={starred}
        trashed={trashed}
        url={url}
        onRefetch={onRefetch}
      />

      <MoveDialog
        open={isMoveOpen}
        onOpenChange={setIsMoveOpen}
        items={[{ id, type, name }]}
        onSuccess={onRefetch}
      />
    </>
  );
}
