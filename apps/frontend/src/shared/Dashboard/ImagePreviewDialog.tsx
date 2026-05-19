import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Info,
  ZoomIn,
  ZoomOut,
  RotateCw,
  RefreshCw,
  Maximize2,
  Minimize2,
} from 'lucide-react';
import { DetailsDialog } from './DetailsDialog';
import { cn } from '@/lib/utils';

type ImagePreviewDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  fileName: string;
  imageUrl: string;
  fileId?: string;
  sizeMb?: number;
  createdAt?: Date | string;
  starred?: boolean;
  trashed?: boolean;
};

export function ImagePreviewDialog({
  open,
  onOpenChange,
  fileName,
  imageUrl,
  fileId,
  sizeMb,
  createdAt,
  starred,
  trashed,
}: ImagePreviewDialogProps) {
  const [scale, setScale] = useState(1);
  const [rotate, setRotate] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const handleZoomIn = () => setScale((s) => Math.min(s + 0.25, 3));
  const handleZoomOut = () => setScale((s) => Math.max(s - 0.25, 0.5));
  const handleRotate = () => setRotate((r) => (r + 90) % 360);
  const handleReset = () => {
    setScale(1);
    setRotate(0);
  };

  const handleClose = () => {
    handleReset();
    setIsFullscreen(false);
    onOpenChange(false);
  };

  return (
    <>
      <Dialog
        open={open}
        onOpenChange={(o) => {
          if (!o) handleClose();
        }}
      >
        <DialogContent
          className={cn(
            'flex flex-col gap-4 overflow-hidden p-6 transition-all duration-300',
            isFullscreen
              ? 'max-w-[100vw] h-[100dvh] w-screen border-none rounded-none p-4'
              : 'max-w-[min(100vw-2rem,64rem)] max-h-[calc(100dvh-2rem)] rounded-2xl h-[85dvh]',
          )}
        >
          <DialogHeader className="shrink-0 pr-12">
            <DialogTitle className="truncate text-base font-semibold">
              {fileName}
            </DialogTitle>
            <DialogDescription className="sr-only">
              Preview of uploaded image file
            </DialogDescription>
          </DialogHeader>

          {/* Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-2 bg-muted/40 border border-border/40 rounded-xl px-3 py-1.5 shrink-0 text-sm">
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="size-8"
                onClick={handleZoomIn}
                title="Zoom In"
              >
                <ZoomIn className="size-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="size-8"
                onClick={handleZoomOut}
                disabled={scale <= 0.5}
                title="Zoom Out"
              >
                <ZoomOut className="size-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="size-8"
                onClick={handleRotate}
                title="Rotate 90°"
              >
                <RotateCw className="size-4" />
              </Button>
              {(scale !== 1 || rotate !== 0) && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8 text-primary"
                  onClick={handleReset}
                  title="Reset Transform"
                >
                  <RefreshCw className="size-4" />
                </Button>
              )}
            </div>

            <div className="flex items-center gap-1.5">
              {fileId && (
                <Button
                  variant="secondary"
                  size="sm"
                  className="h-8 gap-1.5 rounded-lg px-3 font-medium text-xs shadow-sm"
                  onClick={() => setIsDetailsOpen(true)}
                >
                  <Info className="size-3.5" />
                  <span>View Details</span>
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                className="size-8 hidden sm:inline-flex"
                onClick={() => setIsFullscreen(!isFullscreen)}
                title={isFullscreen ? 'Exit Full Screen' : 'Full Screen'}
              >
                {isFullscreen ? (
                  <Minimize2 className="size-4" />
                ) : (
                  <Maximize2 className="size-4" />
                )}
              </Button>
            </div>
          </div>

          {/* Image Container */}
          {imageUrl ? (
            <div className="flex-1 min-h-0 w-full flex items-center justify-center overflow-hidden rounded-2xl bg-black/5 dark:bg-black/20 border border-border/60 relative group/viewport">
              <div
                className="size-full flex items-center justify-center transition-transform duration-200 ease-out"
                style={{
                  transform: `scale(${scale}) rotate(${rotate}deg)`,
                }}
              >
                <img
                  src={imageUrl}
                  alt={fileName}
                  className="max-h-full max-w-full object-contain select-none shadow-md rounded-lg transition-shadow"
                  draggable={false}
                />
              </div>
              <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-black/60 text-white text-[10px] font-mono pointer-events-none opacity-0 group-hover/viewport:opacity-100 transition-opacity">
                {Math.round(scale * 100)}%
              </span>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center p-8 text-center border border-dashed rounded-2xl">
              <p className="text-sm text-muted-foreground">
                Set{' '}
                <code className="rounded bg-muted px-1">
                  R2_PUBLIC_BASE_URL
                </code>{' '}
                on the server (e.g. your R2 public dev URL).
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {fileId && (
        <DetailsDialog
          open={isDetailsOpen}
          onOpenChange={setIsDetailsOpen}
          id={fileId}
          type="file"
          name={fileName}
          sizeMb={sizeMb}
          createdAt={createdAt}
          starred={starred}
          trashed={trashed}
          url={imageUrl}
        />
      )}
    </>
  );
}
