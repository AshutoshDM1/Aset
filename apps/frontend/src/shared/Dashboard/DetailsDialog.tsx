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
  FileIcon as LucideFileIcon,
  FolderIcon,
  ExternalLink,
  Copy,
  Check,
  Tag,
  Eye,
  Loader2,
  Image as ImageIcon,
} from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { trpc } from '@/utils/trpc';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import FileThumbnail from './FileThumbnail';

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
  thumbnailUrl?: string | null;
  onRefetch?: () => void;
  processingStatus?: string | null;
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
  thumbnailUrl,
  onRefetch,
  processingStatus,
}: DetailsDialogProps) {
  const queryClient = useQueryClient();
  const [copiedId, setCopiedId] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [copiedThumbnail, setCopiedThumbnail] = useState(false);

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

  const copyToClipboard = async (
    text: string,
    fieldType: 'id' | 'url' | 'thumbnail',
  ) => {
    try {
      await navigator.clipboard.writeText(text);
      if (fieldType === 'url') {
        setCopiedUrl(true);
        setTimeout(() => setCopiedUrl(false), 2000);
      } else if (fieldType === 'thumbnail') {
        setCopiedThumbnail(true);
        setTimeout(() => setCopiedThumbnail(false), 2000);
      } else {
        setCopiedId(true);
        setTimeout(() => setCopiedId(false), 2000);
      }
      toast.success(
        fieldType === 'id'
          ? 'ID copied to clipboard'
          : 'URL copied to clipboard',
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
              <LucideFileIcon className="size-5 text-primary shrink-0" />
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
            <div className="size-20 flex items-center justify-center overflow-hidden rounded-xl bg-muted/40 text-muted-foreground ring-1 ring-border/60 shadow-2xs select-none pointer-events-none">
              {type === 'folder' ? (
                <FolderIcon className="size-10 text-amber-500 fill-current" />
              ) : (
                <FileThumbnail
                  name={name}
                  thumbnailUrl={thumbnailUrl}
                  view="grid"
                  outerSvg={true}
                  fallbackIcon={LucideFileIcon}
                  fallbackColorClass="text-muted-foreground"
                />
              )}
            </div>
            <div className="space-y-0.5">
              <p
                className="text-sm font-medium text-foreground truncate max-w-60"
                title={name}
              >
                {name}
              </p>
              <p className="text-xs text-muted-foreground font-medium">
                {type === 'folder' ? 'Folder' : `${fileExtension} File`}
              </p>
            </div>
          </div>

          {/* Metadata Grid (Size to In Trash) */}
          <div className="grid grid-cols-2 gap-x-6 gap-y-4 py-4 border-y border-border/60">
            {/* Size Card */}
            <div className="flex flex-col gap-1">
              <span className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                <HardDrive className="size-3.5 shrink-0" />
                Size
              </span>
              <span className="text-sm font-semibold text-foreground truncate">
                {formattedSize}
              </span>
            </div>

            {/* Created At Card */}
            <div className="flex flex-col gap-1">
              <span className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                <Calendar className="size-3.5 shrink-0" />
                Created
              </span>
              <span
                className="text-sm font-semibold text-foreground truncate"
                title={formattedDate}
              >
                {formattedDate}
              </span>
            </div>

            {/* Starred Status Card */}
            <div className="flex flex-col gap-1">
              <span className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                <Star className="size-3.5 shrink-0" />
                Starred
              </span>
              <div>
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={isStarPending}
                  onClick={handleStarToggle}
                  className={cn(
                    'h-7 px-2.5 rounded-full text-xs font-semibold select-none transition-all flex items-center gap-1.5 border cursor-pointer',
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
            </div>

            {/* Trashed Status Card */}
            <div className="flex flex-col gap-1">
              <span className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                <Trash2 className="size-3.5 shrink-0" />
                In Trash
              </span>
              <div>
                <span
                  className={cn(
                    'inline-block px-2 py-0.5 rounded-full text-xs font-semibold border leading-none',
                    trashed
                      ? 'bg-destructive/15 text-destructive border-destructive/25'
                      : 'bg-muted text-muted-foreground border-transparent',
                  )}
                >
                  {trashed ? 'Yes' : 'No'}
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {/* Processing Status Row (for videos only) */}
            {type === 'file' &&
              (name.toLowerCase().endsWith('.mp4') ||
                name.toLowerCase().endsWith('.mkv') ||
                name.toLowerCase().endsWith('.mov') ||
                name.toLowerCase().endsWith('.webm')) && (
                <div className="py-1 flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 text-muted-foreground font-medium">
                    <Loader2
                      className={cn(
                        'size-4 shrink-0',
                        processingStatus === 'processing' &&
                          'animate-spin text-amber-500',
                      )}
                    />
                    Track Processing
                  </span>
                  <span
                    className={cn(
                      'px-2 py-0.5 rounded-full text-xs font-semibold flex items-center gap-1.5 border',
                      processingStatus === 'completed'
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                        : processingStatus === 'processing'
                          ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 animate-pulse'
                          : processingStatus === 'failed'
                            ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20'
                            : 'bg-muted text-muted-foreground border-transparent',
                    )}
                  >
                    {processingStatus === 'processing' &&
                      'Extracting Tracks...'}
                    {processingStatus === 'completed' && 'Ready'}
                    {processingStatus === 'failed' && 'Failed / Not Found'}
                    {!processingStatus && 'Pending'}
                  </span>
                </div>
              )}

            <div className="grid grid-cols-2 gap-x-6 gap-y-4">
              {/* ID Row */}
              <div className="flex flex-col gap-1.5 text-sm">
                <span className="flex items-center gap-2 text-muted-foreground font-medium">
                  <Tag className="size-4 shrink-0" />
                  Unique ID
                </span>
                <div className="flex items-center gap-2">
                  <code className="text-xs bg-muted/60 border border-border/40 px-2 py-1 rounded flex-1 truncate font-mono text-muted-foreground">
                    {id}
                  </code>
                  <Button
                    variant="outline"
                    size="icon"
                    className="size-7 shrink-0 cursor-pointer"
                    onClick={() => copyToClipboard(id, 'id')}
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
                <div className="flex flex-col gap-1.5 text-sm">
                  <span className="flex items-center gap-2 text-muted-foreground font-medium">
                    <ExternalLink className="size-4 shrink-0" />
                    Access Link
                  </span>
                  <div className="flex items-center gap-2 ">
                    <code className="text-xs bg-muted/60 border border-border/40 px-2 py-1 rounded flex-1 truncate font-mono text-muted-foreground">
                      {url}
                    </code>
                    <div className="flex items-center gap-1 shrink-0">
                      <Button
                        variant="outline"
                        size="icon"
                        className="size-7 cursor-pointer"
                        onClick={() => copyToClipboard(url, 'url')}
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
                        className="size-7 cursor-pointer"
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
            {/* Thumbnail URL Row (if applicable) */}
            {type === 'file' && thumbnailUrl && (
              <div className="flex flex-col gap-1.5 text-sm pt-1">
                <span className="flex items-center gap-2 text-muted-foreground font-medium">
                  <ImageIcon className="size-4 shrink-0" />
                  Thumbnail Link
                </span>
                <div className="flex items-center gap-2 pl-6">
                  <code className="text-xs bg-muted/60 border border-border/40 px-2 py-1 rounded flex-1 truncate font-mono text-muted-foreground">
                    {thumbnailUrl}
                  </code>
                  <div className="flex items-center gap-1 shrink-0">
                    <Button
                      variant="outline"
                      size="icon"
                      className="size-7 cursor-pointer"
                      onClick={() => copyToClipboard(thumbnailUrl, 'thumbnail')}
                      title="Copy Thumbnail URL"
                    >
                      {copiedThumbnail ? (
                        <Check className="size-3 text-green-500" />
                      ) : (
                        <Copy className="size-3" />
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="size-7 cursor-pointer"
                      asChild
                      title="Open thumbnail in new tab"
                    >
                      <a
                        href={thumbnailUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Eye className="size-3" />
                      </a>
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="shrink-0 flex justify-end pt-2">
          <Button
            variant="outline"
            className="w-full sm:w-auto rounded-xl cursor-pointer"
            onClick={() => onOpenChange(false)}
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
