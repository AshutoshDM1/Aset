import { Button } from '@/components/ui/button';
import {
  ZoomIn,
  ZoomOut,
  RotateCw,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Minimize2,
  Eye,
  EyeOff,
} from 'lucide-react';
import type { PdfState } from './types';
import { cn } from '@/lib/utils';

interface PdfFloatingToolbarProps {
  state: PdfState;
}

export function PdfFloatingToolbar({ state }: PdfFloatingToolbarProps) {
  const {
    scale,
    setScale,
    rotate,
    setRotate,
    pageNumber,
    setPageNumber,
    numPages,
    setIsFullscreen,
    viewMode,
    setViewMode,
    showControls,
    setShowControls,
    x,
    y,
    handleReset,
  } = state;

  const handleZoomIn = () => setScale((s) => Math.min(s + 0.25, 4));
  const handleZoomOut = () => setScale((s) => Math.max(s - 0.25, 0.25));
  const handleRotate = () => setRotate((r) => (r + 90) % 360);

  const previousPage = () => setPageNumber((p) => Math.max(p - 1, 1));
  const nextPage = () => setPageNumber((p) => Math.min(p + 1, numPages || 1));

  const hasModifications =
    scale !== 1 || rotate !== 0 || x.get() !== 0 || y.get() !== 0;

  // Advancing by 2 in side-by-side
  const handlePrevPageClick = () => {
    if (viewMode === 'double') {
      setPageNumber((p) => Math.max(p - 2, 1));
    } else {
      previousPage();
    }
  };

  const handleNextPageClick = () => {
    if (viewMode === 'double') {
      setPageNumber((p) => Math.min(p + 2, numPages || 1));
    } else {
      nextPage();
    }
  };

  // Immersive distraction-free mode: hide everything, show only a tiny restore trigger
  if (!showControls) {
    return (
      <Button
        variant="secondary"
        size="icon"
        className="absolute bottom-6 right-6 z-50 size-10 rounded-full bg-black/80 hover:bg-black/90 text-white/70 hover:text-white border border-white/10 shadow-lg backdrop-blur-md opacity-30 hover:opacity-100 hover:scale-105 transition-all duration-300"
        onClick={() => setShowControls(true)}
        title="Show Reader Controls"
      >
        <Eye className="size-5" />
      </Button>
    );
  }

  return (
    <>
      {/* Bottom Main Floating Toolbar */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-50 flex flex-col md:flex-row items-center gap-2 md:gap-3 bg-black/85 backdrop-blur-md border border-white/10 rounded-2xl p-2.5 md:px-4 md:py-2 text-white shadow-xl animate-in fade-in slide-in-from-bottom-4 duration-300 max-w-[90vw] md:max-w-none">
        <div className="flex items-center gap-0.5">
          {/* Zoom and Rotate Controls */}
          <Button
            variant="ghost"
            size="icon"
            className="size-8 md:size-9 text-white/80 hover:text-white hover:bg-white/10 rounded-xl"
            onClick={handleZoomIn}
            title="Zoom In"
          >
            <ZoomIn className="size-4.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="size-8 md:size-9 text-white/80 hover:text-white hover:bg-white/10 rounded-xl"
            onClick={handleZoomOut}
            disabled={scale <= 0.25}
            title="Zoom Out"
          >
            <ZoomOut className="size-4.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="size-8 md:size-9 text-white/80 hover:text-white hover:bg-white/10 rounded-xl"
            onClick={handleRotate}
            title="Rotate 90°"
          >
            <RotateCw className="size-4.5" />
          </Button>

          {hasModifications && (
            <Button
              variant="ghost"
              size="icon"
              className="size-8 md:size-9 text-primary hover:bg-white/10 rounded-xl"
              onClick={handleReset}
              title="Reset View"
            >
              <RefreshCw className="size-4.5" />
            </Button>
          )}

          <div className="h-4 w-px bg-white/15 mx-1" />

          {/* Immersive Reading Mode Trigger */}
          <Button
            variant="ghost"
            size="icon"
            className="size-8 md:size-9 text-white/80 hover:text-white hover:bg-white/10 rounded-xl"
            onClick={() => setShowControls(false)}
            title="Hide Reader Controls (Distraction-Free)"
          >
            <EyeOff className="size-4.5" />
          </Button>

          {/* Minimize Fullscreen */}
          <Button
            variant="ghost"
            size="icon"
            className="size-8 md:size-9 text-white/80 hover:text-white hover:bg-white/10 rounded-xl"
            onClick={() => setIsFullscreen(false)}
            title="Exit Full Screen"
          >
            <Minimize2 className="size-4.5" />
          </Button>
        </div>

        {/* Floating Navigation Controls (Hidden in vertical/all-pages mode) */}
        {viewMode !== 'vertical' && numPages && numPages > 1 && (
          <div className="flex items-center gap-1.5 border-t border-white/10 pt-2 md:border-t-0 md:pt-0">
            <div className="hidden md:block h-4 w-px bg-white/15 mx-1" />
            <Button
              variant="ghost"
              size="icon"
              className="size-8 md:size-9 text-white/80 hover:text-white hover:bg-white/10 rounded-xl"
              disabled={pageNumber <= 1}
              onClick={handlePrevPageClick}
              title="Previous Page"
            >
              <ChevronLeft className="size-4.5" />
            </Button>
            <span className="text-xs font-semibold text-white/70 min-w-[80px] text-center select-none">
              {viewMode === 'double'
                ? `Pages ${pageNumber}-${Math.min(pageNumber + 1, numPages)} / ${numPages}`
                : `Page ${pageNumber} / ${numPages}`}
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="size-8 md:size-9 text-white/80 hover:text-white hover:bg-white/10 rounded-xl"
              disabled={
                viewMode === 'double'
                  ? pageNumber + 1 >= numPages
                  : pageNumber >= numPages
              }
              onClick={handleNextPageClick}
              title="Next Page"
            >
              <ChevronRight className="size-4.5" />
            </Button>
          </div>
        )}
      </div>

      {/* Top Floating Segmented Controls */}
      <div className="absolute top-2 right-2 z-50 flex items-center bg-black/85 backdrop-blur-md border border-white/10 p-0.5 rounded-xl text-white shadow-xl animate-in fade-in slide-in-from-top-4 duration-300">
        <div className="flex items-center bg-white/5 p-0.5 rounded-lg text-xs font-semibold select-none">
          <button
            type="button"
            onClick={() => setViewMode('single')}
            className={cn(
              'px-2.5 py-1 rounded-md transition-all duration-200 text-nowrap',
              viewMode === 'single'
                ? 'bg-white/15 text-white'
                : 'text-white/60 hover:text-white',
            )}
            title="Single Page View"
          >
            1 Page
          </button>
          <button
            type="button"
            onClick={() => setViewMode('double')}
            className={cn(
              'px-2.5 py-1 rounded-md transition-all duration-200 text-nowrap',
              viewMode === 'double'
                ? 'bg-white/15 text-white'
                : 'text-white/60 hover:text-white',
            )}
            title="Two Page Spread"
          >
            2 Pages
          </button>
          <button
            type="button"
            onClick={() => setViewMode('vertical')}
            className={cn(
              'px-2.5 py-1 rounded-md transition-all duration-200 text-nowrap',
              viewMode === 'vertical'
                ? 'bg-white/15 text-white'
                : 'text-white/60 hover:text-white',
            )}
            title="Vertical Continuous Scroll"
          >
            All
          </button>
        </div>
      </div>
    </>
  );
}
