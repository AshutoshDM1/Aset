import { Button } from '@/components/ui/button';
import {
  ZoomIn,
  ZoomOut,
  RotateCw,
  RefreshCw,
  Maximize2,
  Download,
} from 'lucide-react';
import type { PdfState } from './types';
import { cn } from '@/lib/utils';

interface PdfToolbarProps {
  state: PdfState;
  fileName: string;
  fileUrl: string;
}

export function PdfToolbar({ state, fileName, fileUrl }: PdfToolbarProps) {
  const {
    scale,
    setScale,
    rotate,
    setRotate,
    setIsFullscreen,
    viewMode,
    setViewMode,
    x,
    y,
    handleReset,
  } = state;

  const handleZoomIn = () => setScale((s) => Math.min(s + 0.25, 4));
  const handleZoomOut = () => setScale((s) => Math.max(s - 0.25, 0.25));
  const handleRotate = () => setRotate((r) => (r + 90) % 360);

  const handleDownload = () => {
    if (!fileUrl) return;
    const a = document.createElement('a');
    a.href = fileUrl;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const hasModifications =
    scale !== 1 || rotate !== 0 || x.get() !== 0 || y.get() !== 0;

  return (
    <div className="flex items-center justify-between gap-1.5 bg-muted/40 border border-border/40 rounded-xl p-1.5 shrink-0 text-sm w-full select-none overflow-x-auto">
      {/* 1. Zoom and Rotate controls */}
      <div className="flex items-center gap-0.5 shrink-0">
        <Button
          variant="ghost"
          size="icon"
          className="size-8 rounded-lg"
          onClick={handleZoomIn}
          title="Zoom In"
        >
          <ZoomIn className="size-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="size-8 rounded-lg"
          onClick={handleZoomOut}
          disabled={scale <= 0.25}
          title="Zoom Out"
        >
          <ZoomOut className="size-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="size-8 rounded-lg"
          onClick={handleRotate}
          title="Rotate 90°"
        >
          <RotateCw className="size-4" />
        </Button>
        {hasModifications && (
          <Button
            variant="ghost"
            size="icon"
            className="size-8 text-primary rounded-lg animate-in zoom-in duration-200"
            onClick={handleReset}
            title="Reset View"
          >
            <RefreshCw className="size-4" />
          </Button>
        )}
      </div>

      <div className="w-px h-5 bg-border/60 shrink-0 mx-0.5" />

      {/* 2. Action Buttons (Download & Fullscreen) aligned cleanly to the right */}
      <div className="flex items-center gap-1 ml-auto shrink-0">
        <Button
          variant="secondary"
          size="icon"
          className="size-8 rounded-lg shadow-xs"
          onClick={handleDownload}
          title="Download PDF"
        >
          <Download className="size-4" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="size-8 rounded-lg"
          onClick={() => setIsFullscreen(true)}
          title="Enter Full Screen"
        >
          <Maximize2 className="size-4" />
        </Button>
      </div>

      {/* 3. Premium Segmented View Mode Control */}
      <div className="flex items-center bg-muted/80 p-0.5 rounded-lg border border-border/40 text-xs font-semibold select-none shrink-0">
        <button
          type="button"
          onClick={() => setViewMode('single')}
          className={cn(
            'px-2.5 py-1 rounded-md transition-all duration-200 text-nowrap',
            viewMode === 'single'
              ? 'bg-background text-foreground shadow-xs'
              : 'text-muted-foreground hover:text-foreground',
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
              ? 'bg-background text-foreground shadow-xs'
              : 'text-muted-foreground hover:text-foreground',
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
              ? 'bg-background text-foreground shadow-xs'
              : 'text-muted-foreground hover:text-foreground',
          )}
          title="Vertical Continuous Scroll"
        >
          All
        </button>
      </div>
    </div>
  );
}
