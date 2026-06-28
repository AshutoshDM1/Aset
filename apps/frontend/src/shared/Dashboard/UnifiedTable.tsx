import { format } from 'date-fns';
import { FileIcon, Folder, ImageIcon, FileText, Video } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  formatFileSize,
  isImageFileName,
  isPdfFileName,
  isVideoFileName,
  isTextCodeFileName,
} from '@/utils/file/file-utils';
import { Link } from 'react-router';
import { useState, useMemo, useCallback } from 'react';
import { ItemRowActions } from './ItemRowActions';
import { PdfPreviewDialog } from './PdfPreviewDialog';
import { TextPreview } from '@/components/Preview/TextPreview';
import { Checkbox } from '@/components/ui/checkbox';
import { useSelectionStore } from '@/store/selectionStore';
import { cn } from '@/lib/utils';
import { ImagePreviewDialog } from '@/components/Preview/ImagePreview/ImagePreviewDialog';
import { VideoPreview } from '@/components/Preview/VideoPreview';
import FileThumbnail from './FileThumbnail';

export type UnifiedItem = {
  id: string;
  name: string;
  type: 'folder' | 'file';
  createdAt: string | Date;
  sizeMb?: number;
  url?: string;
  starred?: boolean;
  trashed?: boolean;
  processingStatus?: string | null;
  thumbnailUrl?: string | null;
};

type UnifiedTableProps = {
  items: UnifiedItem[];
  onRefetch?: () => void;
};

export function UnifiedTable({ items, onRefetch }: UnifiedTableProps) {
  const [preview, setPreview] = useState<UnifiedItem | null>(null);
  const [optimizationStats, setOptimizationStats] = useState<{
    oldSize: number;
    newSize: number;
    savedPercent: number;
  } | null>(null);
  const {
    selectedFolderIds,
    selectedFileIds,
    toggleFolder,
    toggleFile,
    selectFolders,
    selectFiles,
    clearSelection,
  } = useSelectionStore();

  const imageItems = useMemo(
    () =>
      items.filter(
        (item) => item.type === 'file' && isImageFileName(item.name),
      ),
    [items],
  );
  const currentImageIndex = useMemo(() => {
    if (!preview) return -1;
    return imageItems.findIndex((item) => item.id === preview.id);
  }, [preview, imageItems]);

  const handlePrevImage = useCallback(() => {
    if (currentImageIndex > 0) {
      setPreview(imageItems[currentImageIndex - 1]);
      setOptimizationStats(null);
    }
  }, [currentImageIndex, imageItems]);

  const handleNextImage = useCallback(() => {
    if (currentImageIndex < imageItems.length - 1) {
      setPreview(imageItems[currentImageIndex + 1]);
      setOptimizationStats(null);
    }
  }, [currentImageIndex, imageItems]);

  const pdfItems = useMemo(
    () =>
      items.filter((item) => item.type === 'file' && isPdfFileName(item.name)),
    [items],
  );
  const currentPdfIndex = useMemo(() => {
    if (!preview) return -1;
    return pdfItems.findIndex((item) => item.id === preview.id);
  }, [preview, pdfItems]);

  const handlePrevPdf = useCallback(() => {
    if (currentPdfIndex > 0) {
      setPreview(pdfItems[currentPdfIndex - 1]);
    }
  }, [currentPdfIndex, pdfItems]);

  const handleNextPdf = useCallback(() => {
    if (currentPdfIndex < pdfItems.length - 1) {
      setPreview(pdfItems[currentPdfIndex + 1]);
    }
  }, [currentPdfIndex, pdfItems]);

  const videoItems = useMemo(
    () =>
      items.filter(
        (item) => item.type === 'file' && isVideoFileName(item.name),
      ),
    [items],
  );
  const currentVideoIndex = useMemo(() => {
    if (!preview) return -1;
    return videoItems.findIndex((item) => item.id === preview.id);
  }, [preview, videoItems]);

  const handlePrevVideo = useCallback(() => {
    if (currentVideoIndex > 0) {
      setPreview(videoItems[currentVideoIndex - 1]);
    }
  }, [currentVideoIndex, videoItems]);

  const handleNextVideo = useCallback(() => {
    if (currentVideoIndex < videoItems.length - 1) {
      setPreview(videoItems[currentVideoIndex + 1]);
    }
  }, [currentVideoIndex, videoItems]);

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setPreview(null);
      setOptimizationStats(null);
    }
  };

  const handleFileClick = (item: UnifiedItem) => {
    if (item.type === 'file' && item.url) {
      if (
        isImageFileName(item.name) ||
        isPdfFileName(item.name) ||
        isVideoFileName(item.name) ||
        isTextCodeFileName(item.name)
      ) {
        setPreview(item);
      }
    }
  };

  const allItemsChecked = useMemo(() => {
    if (items.length === 0) return false;
    return items.every((item) =>
      item.type === 'folder'
        ? selectedFolderIds.includes(item.id)
        : selectedFileIds.includes(item.id),
    );
  }, [items, selectedFolderIds, selectedFileIds]);

  return (
    <>
      <div className="rounded-md border border-border bg-background">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-10">
                <Checkbox
                  checked={allItemsChecked}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      const folders = items
                        .filter((i) => i.type === 'folder')
                        .map((i) => i.id);
                      const files = items
                        .filter((i) => i.type === 'file')
                        .map((i) => i.id);
                      selectFolders(folders);
                      selectFiles(files);
                    } else {
                      clearSelection();
                    }
                  }}
                />
              </TableHead>
              <TableHead className="w-100">Name</TableHead>
              <TableHead>Size</TableHead>
              <TableHead>Created At</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => {
              const isChecked =
                item.type === 'folder'
                  ? selectedFolderIds.includes(item.id)
                  : selectedFileIds.includes(item.id);

              return (
                <TableRow
                  key={`${item.type}-${item.id}`}
                  className={cn(
                    'group transition-colors',
                    isChecked && 'bg-primary/5 hover:bg-primary/5',
                  )}
                >
                  <TableCell>
                    <Checkbox
                      checked={isChecked}
                      onCheckedChange={() => {
                        if (item.type === 'folder') {
                          toggleFolder(item.id);
                        } else {
                          toggleFile(item.id);
                        }
                      }}
                    />
                  </TableCell>
                  <TableCell className="font-medium">
                    {item.type === 'folder' ? (
                      <Link
                        to={`/dashboard/folder/${item.id}`}
                        className="flex items-center gap-3 hover:text-primary transition-colors"
                      >
                        <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                          <Folder className="size-5 fill-current" />
                        </div>
                        <span className="truncate">{item.name}</span>
                      </Link>
                    ) : (
                      <div
                        className="flex items-center gap-3 cursor-pointer group/item"
                        onClick={() => handleFileClick(item)}
                      >
                        <div className="flex size-10 items-center justify-center overflow-hidden rounded-lg bg-muted/40 text-muted-foreground ring-1 ring-border/60 group-hover/item:ring-primary/40 transition-all">
                          <FileThumbnail
                            name={item.name}
                            thumbnailUrl={item.thumbnailUrl}
                            fallbackIcon={
                              isImageFileName(item.name)
                                ? ImageIcon
                                : isPdfFileName(item.name)
                                  ? FileText
                                  : isVideoFileName(item.name)
                                    ? Video
                                    : isTextCodeFileName(item.name)
                                      ? FileText
                                      : FileIcon
                            }
                            fallbackColorClass={
                              isPdfFileName(item.name)
                                ? 'text-red-500'
                                : isVideoFileName(item.name)
                                  ? 'text-indigo-500'
                                  : isTextCodeFileName(item.name)
                                    ? 'text-amber-500'
                                    : 'text-muted-foreground'
                            }
                          />
                        </div>
                        <span className="truncate group-hover/item:text-primary transition-colors">
                          {item.name}
                        </span>
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {item.sizeMb !== undefined
                      ? formatFileSize(item.sizeMb)
                      : '--'}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {format(new Date(item.createdAt), 'MMM d, yyyy')}
                  </TableCell>
                  <TableCell className="text-right">
                    <ItemRowActions
                      id={item.id}
                      type={item.type}
                      name={item.name}
                      starred={item.starred}
                      trashed={item.trashed}
                      url={item.url}
                      onRefetch={onRefetch}
                      sizeMb={item.sizeMb}
                      createdAt={item.createdAt}
                      processingStatus={item.processingStatus}
                    />
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <ImagePreviewDialog
        open={!!preview && isImageFileName(preview.name)}
        onOpenChange={handleOpenChange}
        fileName={preview?.name ?? ''}
        imageUrl={preview?.url ?? ''}
        fileId={preview?.id}
        sizeMb={preview?.sizeMb}
        createdAt={preview?.createdAt}
        starred={preview?.starred}
        trashed={preview?.trashed}
        onRefetch={onRefetch}
        optimizationStats={optimizationStats}
        onOptimizeSuccess={(stats: any) => {
          setOptimizationStats(stats);
          const currentPreview = preview;
          setPreview(null);
          setTimeout(() => {
            const updated = items.find((i) => i.id === currentPreview?.id);
            setPreview(updated || currentPreview);
          }, 600);
        }}
        onPrev={currentImageIndex > 0 ? handlePrevImage : undefined}
        onNext={
          currentImageIndex < imageItems.length - 1
            ? handleNextImage
            : undefined
        }
      />
      <PdfPreviewDialog
        open={!!preview && isPdfFileName(preview.name)}
        onOpenChange={(open) => !open && setPreview(null)}
        fileName={preview?.name || ''}
        fileUrl={preview?.url || ''}
        fileId={preview?.id || ''}
        onPrev={currentPdfIndex > 0 ? handlePrevPdf : undefined}
        onNext={
          currentPdfIndex < pdfItems.length - 1 ? handleNextPdf : undefined
        }
      />
      <VideoPreview
        open={!!preview && isVideoFileName(preview.name)}
        onClose={() => setPreview(null)}
        fileName={preview?.name ?? ''}
        fileUrl={preview?.url ?? ''}
        fileId={preview?.id}
        onPrev={currentVideoIndex > 0 ? handlePrevVideo : undefined}
        onNext={
          currentVideoIndex < videoItems.length - 1
            ? handleNextVideo
            : undefined
        }
      />
      <TextPreview
        open={!!preview && isTextCodeFileName(preview.name)}
        onClose={() => setPreview(null)}
        fileName={preview?.name ?? ''}
        fileUrl={preview?.url ?? ''}
        fileId={preview?.id}
      />
    </>
  );
}
