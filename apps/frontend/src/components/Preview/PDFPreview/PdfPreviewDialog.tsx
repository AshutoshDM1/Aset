import { useState, useEffect } from 'react';
import { useMotionValue, motion } from 'motion/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { PdfPreviewDialogProps, PdfState, PdfViewMode } from './types';
import { PdfFloatingToolbar } from './PdfFloatingToolbar';
import { PdfViewport } from './PdfViewport';
import { useIsMobile } from '@/hooks/isMobile';
import { useFileDownload } from '@/hooks/useFileDownload';
import { toast } from 'sonner';

export function PdfPreviewDialog({
  open,
  onOpenChange,
  fileName,
  fileUrl,
  fileId,
  onPrev,
  onNext,
}: PdfPreviewDialogProps) {
  const isMobile = useIsMobile();
  const defaultScale = isMobile ? 0.25 : 0.45;
  const { download, isDownloading } = useFileDownload();

  const [scale, setScale] = useState<number>(defaultScale);
  const [rotate, setRotate] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [numPages, setNumPages] = useState<number | undefined>(undefined);
  const [viewMode, setViewMode] = useState<PdfViewMode>('single');
  const [showControls, setShowControls] = useState<boolean>(true);

  const handleDownload = () => {
    if (fileId) {
      download(fileId, fileName, fileUrl);
    } else {
      toast.error('Please provide a fileId for download');
    }
  };

  // Drag coordinates managed as high-performance MotionValues
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const handleReset = () => {
    setScale(defaultScale);
    setRotate(0);
    x.set(0);
    y.set(0);
    setShowControls(true);
  };

  const handleClose = () => {
    handleReset();
    onOpenChange(false);
  };

  // Reset coordinates if scale/rotate is reset
  useEffect(() => {
    if (scale === defaultScale && rotate === 0) {
      x.set(0);
      y.set(0);
    }
  }, [scale, rotate, defaultScale, x, y]);

  // Reset view on open state change
  useEffect(() => {
    if (!open) {
      handleReset();
    } else {
      setPageNumber(1);
      setShowControls(true);
      setScale(defaultScale);
    }
  }, [open, defaultScale]);

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

  // Bundle the shared state
  const pdfState: PdfState = {
    scale,
    setScale,
    rotate,
    setRotate,
    isFullscreen: true,
    setIsFullscreen: () => {}, // No-op: always fullscreen
    pageNumber,
    setPageNumber,
    numPages,
    setNumPages,
    viewMode,
    setViewMode,
    showControls,
    setShowControls,
    x,
    y,
    handleReset,
    handleDownload,
    isDownloading,
    handleClose,
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black overflow-hidden p-0 rounded-none border-none">
      {/* Floating title inside fullscreen */}
      {showControls && (
        <div className="absolute top-4 left-4 z-50 text-white/95 font-medium text-sm select-none pointer-events-none drop-shadow-md">
          {fileName}
        </div>
      )}

      {/* PDF Render Viewport */}
      <PdfViewport state={pdfState} fileUrl={fileUrl} fileName={fileName} />

      {/* Floating Controls in Fullscreen Mode */}
      <PdfFloatingToolbar state={pdfState} />

      {/* Navigation Chevron Buttons */}
      {onPrev && showControls && (
        <motion.button
          type="button"
          className="absolute left-6 top-1/2 -translate-y-1/2 z-50 size-12 rounded-full bg-black/60 hover:bg-black/80 text-white/80 hover:text-white border border-white/10 shadow-lg backdrop-blur-md flex items-center justify-center cursor-pointer transition-colors duration-300"
          onClick={onPrev}
          title="Previous PDF (Left Arrow)"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <ChevronLeft className="size-6" />
        </motion.button>
      )}
      {onNext && showControls && (
        <motion.button
          type="button"
          className="absolute right-6 top-1/2 -translate-y-1/2 z-50 size-12 rounded-full bg-black/60 hover:bg-black/80 text-white/80 hover:text-white border border-white/10 shadow-lg backdrop-blur-md flex items-center justify-center cursor-pointer transition-colors duration-300"
          onClick={onNext}
          title="Next PDF (Right Arrow)"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <ChevronRight className="size-6" />
        </motion.button>
      )}
    </div>
  );
}
