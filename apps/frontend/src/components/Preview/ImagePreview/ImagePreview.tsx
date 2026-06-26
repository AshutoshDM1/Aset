import { useState, useEffect } from 'react';
import { useMotionValue, motion } from 'motion/react';
import { Sparkles, X, ChevronLeft, ChevronRight } from 'lucide-react';
import type { ImagePreviewProps, ImageState } from './types';
import { ImageViewport } from './ImageViewport';
import { ImageFloatingToolbar } from './ImageFloatingToolbar';
import { useOptimizeImage } from '@/hooks/useOptimizeImage';
import { DetailsDialog } from '@/shared/Dashboard/DetailsDialog';

export function ImagePreview({
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
  onPrev,
  onNext,
}: ImagePreviewProps) {
  const [scale, setScale] = useState(1);
  const [rotate, setRotate] = useState(0);
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
    onOpenChange(false);
  };

  // Reset coordinates if scale/rotate is reset
  useEffect(() => {
    if (scale === 1 && rotate === 0) {
      x.set(0);
      y.set(0);
    }
  }, [scale, rotate, x, y]);

  // Reset view on open state change
  useEffect(() => {
    if (!open) {
      handleReset();
    }
  }, [open]);

  // Keyboard accessibility: Close on Escape key and navigate on Arrow keys
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
      } else if (e.key === 'ArrowLeft' && onPrev) {
        onPrev();
      } else if (e.key === 'ArrowRight' && onNext) {
        onNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onPrev, onNext]);

  if (!open) return null;

  const state: ImageState = {
    scale,
    setScale,
    rotate,
    setRotate,
    x,
    y,
    handleZoomIn,
    handleZoomOut,
    handleRotate,
    handleReset,
    handleClose,
    optimizeState,
    optimize,
    isDetailsOpen,
    setIsDetailsOpen,
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex flex-col bg-black overflow-hidden p-0 rounded-none border-none select-none">
        {/* Floating title inside fullscreen */}
        <div className="absolute top-4 left-4 z-50 text-white/95 font-medium text-sm select-none pointer-events-none drop-shadow-md truncate max-w-[calc(100vw-8rem)]">
          {fileName}
        </div>

        {/* Circular X Close Button */}
        <motion.button
          type="button"
          className="absolute top-4 right-4 z-50 size-10 rounded-full bg-black/80 hover:bg-black/90 text-white/80 hover:text-white border border-white/10 shadow-lg backdrop-blur-md flex items-center justify-center cursor-pointer transition-colors duration-300"
          onClick={handleClose}
          title="Close Preview"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <X className="size-5" />
        </motion.button>

        {/* Optimization Stats Premium Banner */}
        {optimizationStats && (
          <motion.div
            initial={{ opacity: 0, y: -15, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="absolute top-16 left-4 right-4 md:left-1/2 md:-translate-x-1/2 md:w-auto md:max-w-xl z-50 flex items-center justify-between gap-4 p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/10 backdrop-blur-md shadow-sm select-none"
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
                      (optimizationStats.oldSize - optimizationStats.newSize) /
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

        {/* Viewport for image rendering & zoom gestures */}
        <ImageViewport state={state} imageUrl={imageUrl} fileName={fileName} />

        {/* Floating Actions Controls Menu */}
        <ImageFloatingToolbar
          state={state}
          fileId={fileId}
          fileName={fileName}
          imageUrl={imageUrl}
          onRefetch={onRefetch}
          onOptimizeSuccess={onOptimizeSuccess}
        />

        {/* Navigation Chevron Buttons */}
        {onPrev && (
          <motion.button
            type="button"
            className="absolute left-4 top-1/2 -translate-y-1/2 z-50 size-10 md:size-12 rounded-full bg-black/60 hover:bg-black/80 text-white/80 hover:text-white border border-white/10 shadow-lg backdrop-blur-md flex items-center justify-center cursor-pointer transition-colors duration-300"
            onClick={onPrev}
            title="Previous Image (Left Arrow)"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <ChevronLeft className="size-5 md:size-6" />
          </motion.button>
        )}
        {onNext && (
          <motion.button
            type="button"
            className="absolute right-4 top-1/2 -translate-y-1/2 z-50 size-10 md:size-12 rounded-full bg-black/60 hover:bg-black/80 text-white/80 hover:text-white border border-white/10 shadow-lg backdrop-blur-md flex items-center justify-center cursor-pointer transition-colors duration-300"
            onClick={onNext}
            title="Next Image (Right Arrow)"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <ChevronRight className="size-5 md:size-6" />
          </motion.button>
        )}
      </div>

      {/* Details Dialog */}
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
