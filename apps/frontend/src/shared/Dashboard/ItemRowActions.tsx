import { Star, Trash2, Download, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { trpc } from '@/utils/trpc';
import { toast } from 'sonner';
import { useQueryClient, useMutation } from '@tanstack/react-query';

interface ItemRowActionsProps {
  id: number;
  type: 'folder' | 'file';
  starred?: boolean;
  trashed?: boolean;
  url?: string;
  onRefetch?: () => void;
}

export function ItemRowActions({
  id,
  type,
  starred,
  trashed,
  url,
  onRefetch,
}: ItemRowActionsProps) {
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
    if (url) {
      try {
        const response = await fetch(url);
        const blob = await response.blob();
        const blobUrl = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = ''; // Let browser decide name or use a default
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(blobUrl);
      } catch (error) {
        console.error('Download failed:', error);
        // Fallback to simple link if fetch fails (e.g. CORS)
        const link = document.createElement('a');
        link.href = url;
        link.target = '_blank';
        link.click();
      }
    }
  };

  return (
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
    </div>
  );
}
