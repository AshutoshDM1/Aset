import { Star, Trash2, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { trpc } from '@/utils/trpc';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useQueryClient, useMutation } from '@tanstack/react-query';

interface ItemGridActionsProps {
  id: number;
  type: 'folder' | 'file';
  starred?: boolean;
  trashed?: boolean;
  onRefetch?: () => void;
}

export function ItemGridActions({
  id,
  type,
  starred,
  trashed,
  onRefetch,
}: ItemGridActionsProps) {
  const queryClient = useQueryClient();

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

  return (
    <div className="absolute top-1 right-1 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
      {!trashed && (
        <Button
          variant="secondary"
          size="icon"
          className={cn(
            'size-7 rounded-full bg-background/80 backdrop-blur shadow-sm border border-border',
            starred
              ? 'text-yellow-400 hover:text-yellow-500'
              : 'text-muted-foreground hover:text-foreground',
          )}
          onClick={handleStar}
          title={starred ? 'Unstar' : 'Star'}
        >
          <Star className={cn('size-3.5', starred && 'fill-current')} />
        </Button>
      )}
      <Button
        variant="secondary"
        size="icon"
        className="size-7 rounded-full bg-background/80 backdrop-blur shadow-sm border border-border text-muted-foreground hover:text-destructive"
        onClick={handleTrash}
        title={trashed ? 'Restore' : 'Move to Trash'}
      >
        {trashed ? (
          <RotateCcw className="size-3.5" />
        ) : (
          <Trash2 className="size-3.5" />
        )}
      </Button>
    </div>
  );
}
