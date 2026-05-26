import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import {
  Info,
  ZoomIn,
  ZoomOut,
  RotateCw,
  RefreshCw,
  Maximize2,
  Minimize2,
  Sparkles,
  Loader2,
  CheckCheck,
} from 'lucide-react';
import { useOptimizeImage } from '../../hooks/useOptimizeImage';
import { DetailsDialog } from './DetailsDialog';
import { cn } from '@/lib/utils';
import { motion, useMotionValue } from 'motion/react';
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
  onRefetch?: () => void;
  optimizationStats?: {
    oldSize: number;
    newSize: number;
    savedPercent: number;
  } | null;
  onOptimizeSuccess?: (stats: {
    oldSize: number;
    newSize: number;
    savedPercent: number;
  }) => void;
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
  onRefetch,
  optimizationStats,
  onOptimizeSuccess,
}: ImagePreviewDialogProps) {
  const [scale, setScale] = useState(1);
  const [rotate, setRotate] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const { state: optimizeState, optimize } = useOptimizeImage();

  // Motion values for hardware-accelerated, zero-render dragging
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const handleZoomIn = () => setScale((s) => Math.min(s + 0.25, 4));
  const handleZoomOut = () => setScale((s) => Math.max(s - 0.25, 0.25));
  const handleRotate = () => setRotate((r) => (r + 90) % 360);

  const handleReset = () => {
    setScale(1);
    setRotate(0);
    x.set(0);
    y.set(0);
  };

  const handleClose = () => {
    handleReset();
    setIsFullscreen(false);
    onOpenChange(false);
  };

  // Keep scale updated in a ref for static gesture handlers
  const scaleRef = useRef(scale);
  useEffect(() => {
    scaleRef.current = scale;
  }, [scale]);

  // Gesture refs
  const pinchStartDistanceRef = useRef(0);
  const pinchStartScaleRef = useRef(1);
  const isPinchZoomingRef = useRef(false);
  const activeContainerRef = useRef<HTMLDivElement | null>(null);

  // 1. Mouse Wheel Zoom handler
  const preventDefaultWheel = useCallback((e: WheelEvent) => {
    e.preventDefault();
    const zoomFactor = 0.08;
    setScale((s) => {
      const newScale = s + (e.deltaY < 0 ? zoomFactor : -zoomFactor);
      return Math.max(0.25, Math.min(newScale, 4));
    });
  }, []);

  // 2. Pinch-to-zoom mobile gesture handlers
  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (e.touches.length === 2) {
      e.preventDefault();
      isPinchZoomingRef.current = true;
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY,
      );
      pinchStartDistanceRef.current = dist;
      pinchStartScaleRef.current = scaleRef.current;
    }
  }, []);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (e.touches.length === 2 && isPinchZoomingRef.current) {
      e.preventDefault();
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY,
      );
      if (pinchStartDistanceRef.current > 0) {
        const factor = dist / pinchStartDistanceRef.current;
        const newScale = pinchStartScaleRef.current * factor;
        setScale(Math.max(0.25, Math.min(newScale, 4)));
      }
    }
  }, []);

  const handleTouchEnd = useCallback((e: TouchEvent) => {
    if (e.touches.length < 2) {
      isPinchZoomingRef.current = false;
      pinchStartDistanceRef.current = 0;
    }
  }, []);

  // Callback Ref for the container to attach event listeners the millisecond the node mounts
  const containerCallbackRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (activeContainerRef.current) {
        const container = activeContainerRef.current;
        container.removeEventListener('wheel', preventDefaultWheel);
        container.removeEventListener('touchstart', handleTouchStart);
        container.removeEventListener('touchmove', handleTouchMove);
        container.removeEventListener('touchend', handleTouchEnd);
        container.removeEventListener('touchcancel', handleTouchEnd);
        activeContainerRef.current = null;
      }

      if (node) {
        activeContainerRef.current = node;
        node.addEventListener('wheel', preventDefaultWheel, { passive: false });
        node.addEventListener('touchstart', handleTouchStart, {
          passive: false,
        });
        node.addEventListener('touchmove', handleTouchMove, { passive: false });
        node.addEventListener('touchend', handleTouchEnd);
        node.addEventListener('touchcancel', handleTouchEnd);
      }
    },
    [preventDefaultWheel, handleTouchStart, handleTouchMove, handleTouchEnd],
  );

  // Reset coordinates if modal or zoom changes to 1
  useEffect(() => {
    if (scale === 1 && rotate === 0) {
      x.set(0);
      y.set(0);
    }
  }, [scale, rotate, x, y]);

  useEffect(() => {
    if (!open) {
      handleReset();
    }
  }, [open]);

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
              ? 'fixed! inset-0! z-50! w-screen! h-screen! max-w-none! max-h-none! p-0! rounded-none! border-none! translate-x-0! translate-y-0! top-0! left-0 flex flex-col gap-0 bg-black'
              : 'w-full max-w-[calc(100vw-2rem)] sm:max-w-[calc(100vw-2rem)] md:max-w-[80vw] lg:max-w-5xl max-h-[calc(100dvh-2rem)] rounded-2xl h-[85dvh]',
          )}
          style={
            isFullscreen
              ? {
                  transform: 'none',
                  top: 0,
                  left: 0,
                  maxWidth: '100vw',
                  width: '100vw',
                  height: '100dvh',
                  maxHeight: '100dvh',
                  borderRadius: 0,
                  border: 'none',
                }
              : undefined
          }
        >
          {/* Hide header in full screen for true immersive display */}
          {!isFullscreen && (
            <DialogHeader className="shrink-0 pr-12">
              <DialogTitle className="truncate text-base font-semibold">
                {fileName}
              </DialogTitle>
              <DialogDescription className="sr-only">
                Preview of uploaded image file
              </DialogDescription>
            </DialogHeader>
          )}

          {/* Floating Close indicator in fullscreen */}
          {isFullscreen && (
            <div className="absolute top-4 left-4 z-50 text-white/95 font-medium text-sm select-none pointer-events-none drop-shadow-md">
              {fileName}
            </div>
          )}

          {/* Optimization Stats Premium Banner */}
          {optimizationStats && !isFullscreen && (
            <motion.div
              initial={{ opacity: 0, y: -15, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
              className="flex items-center justify-between gap-4 p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/10 backdrop-blur-md shadow-sm select-none"
            >
              <div className="flex items-center gap-3">
                <div className="flex size-9 items-center justify-center rounded-lg bg-emerald-500/25 text-emerald-500 border border-emerald-500/30">
                  <Sparkles className="size-5 animate-pulse" />
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">
                    Image Optimized successfully!
                  </span>
                  <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                    Reduced by{' '}
                    <span className="font-bold text-sm text-emerald-800 dark:text-emerald-200">
                      {optimizationStats.savedPercent.toFixed(1)}%
                    </span>{' '}
                    · Saved{' '}
                    <span className="font-semibold">
                      {(
                        (optimizationStats.oldSize -
                          optimizationStats.newSize) /
                        1024
                      ).toFixed(1)}{' '}
                      KB
                    </span>{' '}
                    ({(optimizationStats.oldSize / 1024).toFixed(1)} KB →{' '}
                    {(optimizationStats.newSize / 1024).toFixed(1)} KB)
                  </span>
                </div>
              </div>
            </motion.div>
          )}

          {/* Normal Mode Toolbar */}
          {!isFullscreen && (
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
                  disabled={scale <= 0.25}
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
                {(scale !== 1 ||
                  rotate !== 0 ||
                  x.get() !== 0 ||
                  y.get() !== 0) && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-8 text-primary animate-in zoom-in duration-200"
                    onClick={handleReset}
                    title="Reset Preview"
                  >
                    <RefreshCw className="size-4" />
                  </Button>
                )}
              </div>

              <div className="flex items-center gap-1.5">
                {/* Optimize Image — calls Optix microservice → downloads WebP */}
                <Button
                  variant="secondary"
                  size="sm"
                  className="h-8 gap-1.5 rounded-lg px-3 font-medium text-xs shadow-sm"
                  disabled={optimizeState === 'uploading' || !fileId}
                  onClick={async () => {
                    if (fileId) {
                      const res = await optimize(imageUrl, fileName, fileId);
                      if (res) {
                        onRefetch?.();
                        onOptimizeSuccess?.({
                          oldSize: res.oldSize,
                          newSize: res.newSize,
                          savedPercent: res.savedPercent,
                        });
                      }
                    }
                  }}
                  title="Send to Optix · compress & verify"
                >
                  {optimizeState === 'uploading' ? (
                    <Loader2 className="size-3.5 animate-spin" />
                  ) : optimizeState === 'done' ? (
                    <CheckCheck className="size-3.5 text-emerald-500" />
                  ) : (
                    <Sparkles className="size-3.5" />
                  )}
                  <span>
                    {optimizeState === 'uploading'
                      ? 'Uploading…'
                      : optimizeState === 'done'
                        ? 'Received!'
                        : 'Optimize'}
                  </span>
                </Button>

                {fileId && (
                  <Button
                    variant="secondary"
                    size="sm"
                    className="h-8 gap-1.5 rounded-lg px-3 font-medium text-xs shadow-sm"
                    onClick={() => setIsDetailsOpen(true)}
                  >
                    <Info className="size-3.5" />
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8"
                  onClick={() => setIsFullscreen(true)}
                  title="Enter Full Screen"
                >
                  <Maximize2 className="size-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Image Viewport Container */}
          {imageUrl ? (
            <div
              ref={containerCallbackRef}
              className={cn(
                'flex-1 min-h-0 w-full flex items-center justify-center overflow-hidden relative group/viewport select-none',
                isFullscreen
                  ? 'bg-black w-screen h-screen'
                  : 'rounded-2xl bg-black/5 dark:bg-black/20 border border-border/60',
              )}
            >
              <motion.div
                drag
                dragMomentum={false}
                dragElastic={0.5}
                style={{ x, y, scale, rotate }}
                className="flex items-center justify-center cursor-grab active:cursor-grabbing"
              >
                <img
                  src={imageUrl}
                  alt={fileName}
                  className={cn(
                    'object-contain select-none shadow-md rounded-lg pointer-events-none',
                    isFullscreen
                      ? 'max-h-[92dvh] max-w-[95vw]'
                      : 'max-h-[60dvh] max-w-[90%]',
                  )}
                  draggable={false}
                />
              </motion.div>

              <span className="absolute bottom-4 right-4 px-2.5 py-1 rounded bg-black/60 text-white text-[11px] font-mono pointer-events-none opacity-0 group-hover/viewport:opacity-100 transition-opacity z-10">
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

          {/* Floating Immersive Toolbar (Fullscreen Mode Only) */}
          {isFullscreen && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-1.5 bg-black/75 backdrop-blur-md border border-white/10 rounded-2xl px-4 py-2 text-white shadow-xl animate-in fade-in slide-in-from-bottom-4 duration-300">
              <Button
                variant="ghost"
                size="icon"
                className="size-9 text-white/80 hover:text-white hover:bg-white/10 rounded-xl"
                onClick={handleZoomIn}
                title="Zoom In"
              >
                <ZoomIn className="size-4.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="size-9 text-white/80 hover:text-white hover:bg-white/10 rounded-xl"
                onClick={handleZoomOut}
                disabled={scale <= 0.25}
                title="Zoom Out"
              >
                <ZoomOut className="size-4.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="size-9 text-white/80 hover:text-white hover:bg-white/10 rounded-xl"
                onClick={handleRotate}
                title="Rotate 90°"
              >
                <RotateCw className="size-4.5" />
              </Button>
              {(scale !== 1 ||
                rotate !== 0 ||
                x.get() !== 0 ||
                y.get() !== 0) && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-9 text-primary hover:bg-white/10 rounded-xl"
                  onClick={handleReset}
                  title="Reset Preview"
                >
                  <RefreshCw className="size-4.5" />
                </Button>
              )}
              <div className="h-4 w-px bg-white/15 mx-1" />

              {/* Optimize — fullscreen toolbar */}
              <Button
                variant="ghost"
                size="sm"
                className="h-9 gap-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-xl px-3 text-xs font-semibold"
                disabled={optimizeState === 'uploading' || !fileId}
                onClick={async () => {
                  if (fileId) {
                    const res = await optimize(imageUrl, fileName, fileId);
                    if (res) {
                      onRefetch?.();
                      onOptimizeSuccess?.({
                        oldSize: res.oldSize,
                        newSize: res.newSize,
                        savedPercent: res.savedPercent,
                      });
                    }
                  }
                }}
                title="Send to Optix · compress & verify"
              >
                {optimizeState === 'uploading' ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : optimizeState === 'done' ? (
                  <CheckCheck className="size-4 text-emerald-400" />
                ) : (
                  <Sparkles className="size-4" />
                )}
                <span>
                  {optimizeState === 'uploading'
                    ? 'Uploading…'
                    : optimizeState === 'done'
                      ? 'Received!'
                      : 'Optimize'}
                </span>
              </Button>

              {fileId && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-9 gap-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-xl px-3 text-xs font-semibold"
                  onClick={() => setIsDetailsOpen(true)}
                >
                  <Info className="size-4" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                className="size-9 text-white/80 hover:text-white hover:bg-white/10 rounded-xl"
                onClick={() => setIsFullscreen(false)}
                title="Exit Full Screen"
              >
                <Minimize2 className="size-4.5" />
              </Button>
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
          onRefetch={onRefetch}
        />
      )}
    </>
  );
}
