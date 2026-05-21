import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useMotionValue } from 'motion/react';
import type { PdfPreviewDialogProps, PdfState, PdfViewMode } from './types';
import { PdfToolbar } from './PdfToolbar';
import { PdfFloatingToolbar } from './PdfFloatingToolbar';
import { PdfViewport } from './PdfViewport';
import { useIsMobile } from '@/hooks/isMobile';
import { useFileDownload } from '@/hooks/useFileDownload';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';

export function PdfPreviewDialog({
  open,
  onOpenChange,
  fileName,
  fileUrl,
  fileId,
}: PdfPreviewDialogProps) {
  const isMobile = useIsMobile();
  const defaultScale = isMobile ? 0.25 : 0.45;
  const { download, isDownloading } = useFileDownload();

  const [scale, setScale] = useState<number>(defaultScale);
  const [rotate, setRotate] = useState<number>(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
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
    setIsFullscreen(false);
    onOpenChange(false);
  };

  // Reset coordinates if scale/rotate is reset
  useEffect(() => {
    if (scale === defaultScale && rotate === 0) {
      x.set(0);
      y.set(0);
    }
  }, [scale, rotate, defaultScale, x, y]);

  // Reset view on dialog state change
  useEffect(() => {
    if (!open) {
      handleReset();
    } else {
      setPageNumber(1);
      setShowControls(true);
      setScale(defaultScale);
    }
  }, [open, defaultScale]);

  // Reset controls visibility when leaving fullscreen
  useEffect(() => {
    if (!isFullscreen) {
      setShowControls(true);
    }
  }, [isFullscreen]);

  // Bundle the shared state
  const pdfState: PdfState = {
    scale,
    setScale,
    rotate,
    setRotate,
    isFullscreen,
    setIsFullscreen,
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
  };

  const previousPage = () => {
    if (viewMode === 'double') {
      setPageNumber((p) => Math.max(p - 2, 1));
    } else {
      setPageNumber((p) => Math.max(p - 1, 1));
    }
  };

  const nextPage = () => {
    if (viewMode === 'double') {
      setPageNumber((p) => Math.min(p + 2, numPages || 1));
    } else {
      setPageNumber((p) => Math.min(p + 1, numPages || 1));
    }
  };

  const isPrevDisabled = pageNumber <= 1;
  const isNextDisabled =
    viewMode === 'double'
      ? pageNumber + 1 >= (numPages || 1)
      : pageNumber >= (numPages || 1);

  return (
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
            ? 'fixed! inset-0! z-50! w-screen! h-screen! max-w-none! max-h-none! p-0! rounded-none! border-none! translate-x-0! translate-y-0! top-0! left-0! flex flex-col gap-0! bg-black'
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
                boxShadow: 'none',
              }
            : undefined
        }
      >
        {/* Hide header in full screen */}
        {!isFullscreen && (
          <DialogHeader className="shrink-0 pr-12">
            <DialogTitle className="truncate text-base font-semibold">
              {fileName}
            </DialogTitle>
            <DialogDescription className="sr-only">
              Preview of uploaded PDF document
            </DialogDescription>
          </DialogHeader>
        )}

        {/* Floating title inside fullscreen */}
        {isFullscreen && showControls && (
          <div className="absolute top-4 left-4 z-50 text-white/95 font-medium text-sm select-none pointer-events-none drop-shadow-md">
            {fileName}
          </div>
        )}

        {/* Regular Toolbar (Normal Mode) */}
        {!isFullscreen && (
          <PdfToolbar state={pdfState} fileName={fileName} fileUrl={fileUrl} />
        )}

        {/* PDF Render Viewport */}
        <PdfViewport state={pdfState} fileUrl={fileUrl} fileName={fileName} />

        {/* Floating Controls in Fullscreen Mode */}
        {isFullscreen && <PdfFloatingToolbar state={pdfState} />}

        {/* Normal Mode Footer Page Navigation (Centered at the bottom, using custom Shadcn dropdown select) */}
        {!isFullscreen && numPages && numPages > 1 && (
          <div className="flex items-center justify-center gap-1 shrink-0 py-2 mt-1 select-none">
            <Button
              variant="ghost"
              size="icon"
              className="size-8 rounded-lg"
              disabled={isPrevDisabled}
              onClick={previousPage}
              title="Previous Page"
            >
              <ChevronLeft className="size-4" />
            </Button>

            <Select
              value={String(pageNumber)}
              onValueChange={(val) => setPageNumber(Number(val))}
            >
              <SelectTrigger
                size="sm"
                className="h-8 min-w-30 text-xs font-semibold rounded-lg bg-background border-border/40 px-3 py-1 gap-1 shadow-xs"
              >
                <SelectValue placeholder="Page" />
              </SelectTrigger>
              <SelectContent
                position="popper"
                className="z-150 rounded-xl max-h-62.5"
              >
                {Array.from(new Array(numPages), (_, i) => {
                  const pNum = i + 1;
                  if (viewMode === 'double') {
                    // In double spread mode, trigger spreads from odd pages
                    if (pNum % 2 === 0 && pNum !== 1) return null;
                    const nextP = Math.min(pNum + 1, numPages);
                    return (
                      <SelectItem
                        key={pNum}
                        value={String(pNum)}
                        className="text-xs font-medium rounded-lg"
                      >
                        {pNum === nextP
                          ? `Page ${pNum}`
                          : `Pages ${pNum}-${nextP}`}
                      </SelectItem>
                    );
                  }
                  return (
                    <SelectItem
                      key={pNum}
                      value={String(pNum)}
                      className="text-xs font-medium rounded-lg"
                    >
                      Page {pNum} of {numPages}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>

            <Button
              variant="ghost"
              size="icon"
              className="size-8 rounded-lg"
              disabled={isNextDisabled}
              onClick={nextPage}
              title="Next Page"
            >
              <ChevronRight className="size-4" />
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
