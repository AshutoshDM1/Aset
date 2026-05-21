import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { formatFileSize } from '@/utils/file/file-utils';
import { format } from 'date-fns';
import {
  Calendar,
  HardDrive,
  Star,
  Trash2,
  FileIcon,
  FolderIcon,
  ExternalLink,
  Copy,
  Check,
  Tag,
  Eye,
  Loader2,
} from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { trpc } from '@/utils/trpc';
import { useQueryClient, useMutation } from '@tanstack/react-query';

interface DetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  id: string;
  type: 'folder' | 'file';
  name: string;
  sizeMb?: number;
  createdAt?: Date | string;
  starred?: boolean;
  trashed?: boolean;
  url?: string;
  onRefetch?: () => void;
}

export function DetailsDialog({
  open,
  onOpenChange,
  id,
  type,
  name,
  sizeMb,
  createdAt,
  starred = false,
  trashed = false,
  url,
  onRefetch,
}: DetailsDialogProps) {
  const queryClient = useQueryClient();
  const [copiedId, setCopiedId] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);

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

  const isStarPending =
    type === 'folder'
      ? folderStarMutation.isPending
      : fileStarMutation.isPending;

  const handleStarToggle = () => {
    if (type === 'folder') {
      folderStarMutation.mutate({ id, starred: !starred });
    } else {
      fileStarMutation.mutate({ id, starred: !starred });
    }
  };

  const formattedDate = createdAt
    ? format(new Date(createdAt), 'PPP p')
    : 'Not available';

  const formattedSize =
    sizeMb !== undefined ? formatFileSize(sizeMb) : 'Unknown size';

  const fileExtension =
    type === 'file'
      ? name.substring(name.lastIndexOf('.') + 1).toUpperCase()
      : 'FOLDER';

  const copyToClipboard = async (text: string, isUrl: boolean) => {
    try {
      await navigator.clipboard.writeText(text);
      if (isUrl) {
        setCopiedUrl(true);
        setTimeout(() => setCopiedUrl(false), 2000);
      } else {
        setCopiedId(true);
        setTimeout(() => setCopiedId(false), 2000);
      }
      toast.success(
        isUrl ? 'URL copied to clipboard' : 'ID copied to clipboard',
      );
    } catch {
      toast.error('Failed to copy to clipboard');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[min(100vw-2rem,32rem)] max-h-[calc(100dvh-2rem)] flex flex-col gap-5 overflow-hidden p-6">
        <DialogHeader className="shrink-0 pr-12">
          <DialogTitle className="flex items-center gap-2 text-base font-semibold truncate">
            {type === 'folder' ? (
              <FolderIcon className="size-5 text-amber-500 fill-current shrink-0" />
            ) : (
              <FileIcon className="size-5 text-primary shrink-0" />
            )}
            <span className="truncate">{name}</span>
          </DialogTitle>
          <DialogDescription className="sr-only">
            File or folder details information dialog
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 min-h-0 overflow-y-auto space-y-4 pr-1">
          {/* Main Visual Header inside content */}
          <div className="p-4 rounded-2xl bg-muted/30 border border-border/40 flex flex-col items-center justify-center text-center space-y-2">
            <div className="size-16 flex items-center justify-center text-xl font-bold tracking-wider text-muted-foreground select-none">
              {fileExtension}
            </div>
            <div className="space-y-0.5">
              <p className="text-sm font-medium text-foreground truncate max-w-[240px]">
                {name}
              </p>
              <p className="text-xs text-muted-foreground font-medium">
                {type === 'folder' ? 'Folder' : `${fileExtension} File`}
              </p>
            </div>
          </div>

          {/* Metadata Rows */}
          <div className="divide-y divide-border/60 border-y border-border/60">
            {/* Size Row */}
            <div className="py-2.5 flex items-center justify-between text-sm">
              <span className="flex items-center gap-2 text-muted-foreground font-medium">
                <HardDrive className="size-4 shrink-0" />
                Size
              </span>
              <span className="font-semibold text-foreground">
                {formattedSize}
              </span>
            </div>

            {/* Created At Row */}
            <div className="py-2.5 flex items-center justify-between text-sm">
              <span className="flex items-center gap-2 text-muted-foreground font-medium">
                <Calendar className="size-4 shrink-0" />
                Created
              </span>
              <span className="font-medium text-foreground text-right">
                {formattedDate}
              </span>
            </div>

            {/* Starred Status Row */}
            <div className="py-2.5 flex items-center justify-between text-sm">
              <span className="flex items-center gap-2 text-muted-foreground font-medium">
                <Star className="size-4 shrink-0" />
                Starred
              </span>
              <Button
                variant="ghost"
                size="sm"
                disabled={isStarPending}
                onClick={handleStarToggle}
                className={cn(
                  'h-7 px-2.5 rounded-full text-xs font-semibold select-none transition-all flex items-center gap-1.5 border',
                  starred
                    ? 'bg-yellow-500/15 text-yellow-600 dark:text-yellow-400 border-yellow-500/25 hover:bg-yellow-500/25'
                    : 'bg-muted/50 text-muted-foreground border-transparent hover:bg-muted',
                )}
              >
                {isStarPending ? (
                  <Loader2 className="size-3 animate-spin text-primary" />
                ) : (
                  <Star
                    className={cn(
                      'size-3 shrink-0',
                      starred &&
                        'fill-current text-yellow-500 dark:text-yellow-400',
                    )}
                  />
                )}
                {starred ? 'Yes' : 'No'}
              </Button>
            </div>

            {/* Trashed Status Row */}
            <div className="py-2.5 flex items-center justify-between text-sm">
              <span className="flex items-center gap-2 text-muted-foreground font-medium">
                <Trash2 className="size-4 shrink-0" />
                In Trash
              </span>
              <span
                className={cn(
                  'px-2 py-0.5 rounded-full text-xs font-semibold',
                  trashed
                    ? 'bg-destructive/15 text-destructive border border-destructive/25'
                    : 'bg-muted text-muted-foreground border border-transparent',
                )}
              >
                {trashed ? 'Yes' : 'No'}
              </span>
            </div>

            {/* ID Row */}
            <div className="py-2.5 flex flex-col gap-1.5 text-sm">
              <span className="flex items-center gap-2 text-muted-foreground font-medium">
                <Tag className="size-4 shrink-0" />
                Unique ID
              </span>
              <div className="flex items-center gap-2 pl-6">
                <code className="text-xs bg-muted/60 border border-border/40 px-2 py-1 rounded flex-1 truncate font-mono text-muted-foreground">
                  {id}
                </code>
                <Button
                  variant="outline"
                  size="icon"
                  className="size-7 shrink-0"
                  onClick={() => copyToClipboard(id, false)}
                  title="Copy ID"
                >
                  {copiedId ? (
                    <Check className="size-3 text-green-500" />
                  ) : (
                    <Copy className="size-3" />
                  )}
                </Button>
              </div>
            </div>

            {/* S3/Download URL Row (if applicable) */}
            {type === 'file' && url && (
              <div className="py-2.5 flex flex-col gap-1.5 text-sm border-b border-border/60">
                <span className="flex items-center gap-2 text-muted-foreground font-medium">
                  <ExternalLink className="size-4 shrink-0" />
                  Access Link
                </span>
                <div className="flex items-center gap-2 pl-6">
                  <code className="text-xs bg-muted/60 border border-border/40 px-2 py-1 rounded flex-1 truncate font-mono text-muted-foreground">
                    {url}
                  </code>
                  <div className="flex items-center gap-1 shrink-0">
                    <Button
                      variant="outline"
                      size="icon"
                      className="size-7"
                      onClick={() => copyToClipboard(url, true)}
                      title="Copy URL"
                    >
                      {copiedUrl ? (
                        <Check className="size-3 text-green-500" />
                      ) : (
                        <Copy className="size-3" />
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="size-7"
                      asChild
                      title="Open in new tab"
                    >
                      <a href={url} target="_blank" rel="noopener noreferrer">
                        <Eye className="size-3" />
                      </a>
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="shrink-0 flex justify-end">
          <Button
            variant="outline"
            className="w-full sm:w-auto rounded-xl"
            onClick={() => onOpenChange(false)}
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
