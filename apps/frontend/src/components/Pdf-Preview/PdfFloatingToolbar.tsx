import {
  ZoomIn,
  ZoomOut,
  RotateCw,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Eye,
  EyeOff,
  MoreVertical,
  Square,
  BookOpen,
  Rows3,
  Download,
  X,
} from 'lucide-react';
import type { PdfState } from './types';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { motion } from 'motion/react';

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
  } = state;

  const [menuOpen, setMenuOpen] = useState(false);
  const [zoomIntensity, setZoomIntensity] = useState<number>(0.05); // Default zoom step intensity is 5%

  const handleZoomIn = () => setScale((s) => Math.min(s + zoomIntensity, 4));
  const handleZoomOut = () =>
    setScale((s) => Math.max(s - zoomIntensity, 0.25));
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

  // Immersive distraction-free mode: show only side navigation buttons and restore eye button
  if (!showControls) {
    return (
      <>
        {/* Left Arrow Button for Immersive Page Navigation */}
        {viewMode !== 'vertical' && numPages && numPages > 1 && (
          <motion.button
            className="absolute left-2 top-1/2 -translate-y-1/2 z-50 size-10 rounded-full bg-black/20 hover:bg-black/70 text-white/60 hover:text-white border border-white/10 shadow-2xl backdrop-blur-md flex items-center justify-center select-none cursor-pointer disabled:opacity-20 disabled:cursor-not-allowed"
            disabled={pageNumber <= 1}
            onClick={handlePrevPageClick}
            title="Previous Page"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <ChevronLeft className="size-6" />
          </motion.button>
        )}

        {/* Right Arrow Button for Immersive Page Navigation */}
        {viewMode !== 'vertical' && numPages && numPages > 1 && (
          <motion.button
            className="absolute right-2 top-1/2 -translate-y-1/2 z-50 size-10 rounded-full bg-black/20 hover:bg-black/70 text-white/60 hover:text-white border border-white/10 shadow-2xl backdrop-blur-md flex items-center justify-center select-none cursor-pointer disabled:opacity-20 disabled:cursor-not-allowed"
            disabled={
              viewMode === 'double'
                ? pageNumber + 1 >= numPages
                : pageNumber >= numPages
            }
            onClick={handleNextPageClick}
            title="Next Page"
          >
            <ChevronRight className="size-6" />
          </motion.button>
        )}

        {/* Floating Restore Controls Button */}
        <motion.button
          className="absolute bottom-36 md:bottom-6 right-6 z-50 size-10 rounded-full bg-black/80 hover:bg-black/90 text-white/70 hover:text-white border border-white/10 shadow-lg backdrop-blur-md opacity-30 hover:opacity-100 flex items-center justify-center cursor-pointer transition-opacity duration-300"
          onClick={() => setShowControls(true)}
          title="Show Reader Controls"
        >
          <Eye className="size-5" />
        </motion.button>
      </>
    );
  }

  return (
    <>
      {/* Close Button (Top Right, next to 3-dots menu) */}
      <motion.button
        className="absolute top-2 right-16 z-50 size-10 rounded-full bg-black/80 hover:bg-black/90 text-white/80 hover:text-white border border-white/10 shadow-lg backdrop-blur-md flex items-center justify-center select-none cursor-pointer transition-colors duration-300"
        onClick={handleClose}
        title="Close Preview"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <X className="size-5" />
      </motion.button>

      {/* 3-Dots Menu Trigger Button (Top Right) */}
      <motion.button
        className={cn(
          'absolute top-2 right-4 z-50 size-10 rounded-full bg-black/80 hover:bg-black/90 text-white/80 hover:text-white border border-white/10 shadow-lg backdrop-blur-md flex items-center justify-center select-none cursor-pointer transition-colors duration-300',
          menuOpen && 'bg-white/20 text-white border-white/25',
        )}
        onClick={() => setMenuOpen(!menuOpen)}
        title="Settings & View Mode"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <MoreVertical className="size-5" />
      </motion.button>

      {/* Glassmorphic Dropdown settings panel (Top Right below 3-dots button) */}
      {menuOpen && (
        <div className="absolute top-20 right-6 z-50 flex flex-col gap-4 bg-black/90 backdrop-blur-md border border-white/10 rounded-2xl p-4 text-white shadow-2xl w-64 animate-in fade-in slide-in-from-top-4 duration-200 select-none">
          {/* Section 1: View Mode (Icons only, no names/text) */}
          <div className="flex flex-col gap-1.5">
            <span className="text-[10px] font-bold tracking-wider text-white/40 uppercase">
              View Mode
            </span>
            <div className="flex bg-white/5 p-1 rounded-xl gap-1">
              <motion.button
                onClick={() => setViewMode('single')}
                className={cn(
                  'flex-1 size-9 rounded-lg flex items-center justify-center cursor-pointer transition-all duration-200',
                  viewMode === 'single'
                    ? 'bg-white/15 text-white'
                    : 'text-white/60 hover:text-white hover:bg-white/10',
                )}
                title="Single Page View"
                whileTap={{ scale: 0.9 }}
              >
                <Square className="size-4.5" />
              </motion.button>
              <motion.button
                onClick={() => setViewMode('double')}
                className={cn(
                  'flex-1 size-9 rounded-lg flex items-center justify-center cursor-pointer transition-all duration-200',
                  viewMode === 'double'
                    ? 'bg-white/15 text-white'
                    : 'text-white/60 hover:text-white hover:bg-white/10',
                )}
                title="Two Page Spread"
                whileTap={{ scale: 0.9 }}
              >
                <BookOpen className="size-4.5" />
              </motion.button>
              <motion.button
                onClick={() => setViewMode('vertical')}
                className={cn(
                  'flex-1 size-9 rounded-lg flex items-center justify-center cursor-pointer transition-all duration-200',
                  viewMode === 'vertical'
                    ? 'bg-white/15 text-white'
                    : 'text-white/60 hover:text-white hover:bg-white/10',
                )}
                title="Continuous Vertical Scroll"
                whileTap={{ scale: 0.9 }}
              >
                <Rows3 className="size-4.5" />
              </motion.button>
            </div>
          </div>

          {/* Section 2: Zoom & Rotation Controls */}
          <div className="flex flex-col gap-3 pt-2.5 border-t border-white/5">
            <span className="text-[10px] font-bold tracking-wider text-white/40 uppercase">
              Zoom & Rotation
            </span>

            {/* Zoom Step Intensity Slider */}
            <div className="flex flex-col gap-2 px-1">
              <div className="flex justify-between text-[11px] text-white/70 font-semibold">
                <span>Step Intensity</span>
                <span className="text-primary font-mono">
                  {Math.round(zoomIntensity * 100)}%
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="15"
                value={Math.round(zoomIntensity * 100)}
                onChange={(e) => setZoomIntensity(Number(e.target.value) / 100)}
                className="w-full h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-primary focus:outline-none"
              />
            </div>

            {/* Zoom In & Out Action Buttons inside Menu */}
            <div className="flex gap-2">
              <motion.button
                type="button"
                onClick={handleZoomIn}
                className="flex-1 h-9 text-white/80 hover:text-white hover:bg-white/10 rounded-xl border border-white/5 cursor-pointer flex items-center justify-center gap-1.5 text-xs px-2 transition-colors duration-200"
                title="Zoom In"
                whileTap={{ scale: 0.95 }}
              >
                <ZoomIn className="size-4" />
                <span>In</span>
              </motion.button>
              <motion.button
                type="button"
                onClick={handleZoomOut}
                disabled={scale <= 0.25}
                className="flex-1 h-9 text-white/80 hover:text-white hover:bg-white/10 rounded-xl border border-white/5 cursor-pointer flex items-center justify-center gap-1.5 text-xs px-2 disabled:opacity-30 disabled:cursor-not-allowed transition-colors duration-200"
                title="Zoom Out"
                whileTap={{ scale: scale > 0.25 ? 0.95 : 1 }}
              >
                <ZoomOut className="size-4" />
                <span>Out</span>
              </motion.button>
            </div>

            {/* Rotate & Reset Action Buttons inside Menu */}
            <div className="flex gap-2">
              <motion.button
                type="button"
                onClick={handleRotate}
                className="flex-1 h-9 text-white/80 hover:text-white hover:bg-white/10 rounded-xl border border-white/5 cursor-pointer flex items-center justify-center gap-1.5 text-xs px-2 transition-colors duration-200"
                title="Rotate 90°"
                whileTap={{ scale: 0.95 }}
              >
                <RotateCw className="size-4" />
                <span>Rotate</span>
              </motion.button>
              {hasModifications && (
                <motion.button
                  type="button"
                  onClick={handleReset}
                  className="flex-1 h-9 text-primary hover:bg-white/10 rounded-xl border border-primary/20 cursor-pointer flex items-center justify-center gap-1.5 text-xs px-2 transition-all duration-200"
                  title="Reset View"
                  whileTap={{ scale: 0.95 }}
                >
                  <RefreshCw className="size-4" />
                  <span>Reset</span>
                </motion.button>
              )}
            </div>
          </div>

          {/* Section 3: General Actions */}
          <div className="flex flex-col gap-1.5 pt-2.5 border-t border-white/5">
            <span className="text-[10px] font-bold tracking-wider text-white/40 uppercase">
              Actions
            </span>
            <div className="flex flex-col gap-1">
              <motion.button
                className="w-full justify-start gap-2.5 h-9 text-xs text-white/80 hover:text-white hover:bg-white/10 rounded-xl px-2.5 cursor-pointer flex items-center transition-colors duration-200"
                onClick={() => {
                  setShowControls(false);
                  setMenuOpen(false);
                }}
                whileTap={{ scale: 0.98 }}
              >
                <EyeOff className="size-4 text-white/50" />
                <span>Immersive Mode</span>
              </motion.button>

              <motion.button
                className="w-full justify-start gap-2.5 h-9 text-xs text-white/80 hover:text-white hover:bg-white/10 rounded-xl px-2.5 cursor-pointer flex items-center transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={handleDownload}
                disabled={isDownloading}
                whileTap={{ scale: 0.98 }}
              >
                {isDownloading ? (
                  <div className="size-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                ) : (
                  <Download className="size-4 text-white/50" />
                )}
                <span>{isDownloading ? 'Downloading...' : 'Download PDF'}</span>
              </motion.button>

              <motion.button
                className="w-full justify-start gap-2.5 h-9 text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl px-2.5 cursor-pointer flex items-center transition-colors duration-200"
                onClick={handleClose}
                whileTap={{ scale: 0.98 }}
              >
                <X className="size-4 text-red-400/70" />
                <span>Close Preview</span>
              </motion.button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Main Floating Toolbar (Only shows for non-vertical modes if pagination is active) */}
      {viewMode !== 'vertical' && numPages && numPages > 1 && (
        <div className="absolute bottom-32 md:bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 bg-black/85 backdrop-blur-md border border-white/10 rounded-2xl px-4 py-2 text-white shadow-xl animate-in fade-in slide-in-from-bottom-4 duration-300 select-none">
          <motion.button
            className="size-8 md:size-9 text-white/80 hover:text-white hover:bg-white/10 rounded-xl cursor-pointer flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed transition-colors duration-200"
            disabled={pageNumber <= 1}
            onClick={handlePrevPageClick}
            title="Previous Page"
            whileTap={{ scale: pageNumber <= 1 ? 1 : 0.9 }}
          >
            <ChevronLeft className="size-4.5" />
          </motion.button>

          <span className="text-xs font-semibold text-white/70 min-w-20 text-center">
            {viewMode === 'double'
              ? `Pages ${pageNumber}-${Math.min(pageNumber + 1, numPages)} / ${numPages}`
              : `Page ${pageNumber} / ${numPages}`}
          </span>

          <motion.button
            className="size-8 md:size-9 text-white/80 hover:text-white hover:bg-white/10 rounded-xl cursor-pointer flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed transition-colors duration-200"
            disabled={
              viewMode === 'double'
                ? pageNumber + 1 >= numPages
                : pageNumber >= numPages
            }
            onClick={handleNextPageClick}
            title="Next Page"
            whileTap={{
              scale: (
                viewMode === 'double'
                  ? pageNumber + 1 >= numPages
                  : pageNumber >= numPages
              )
                ? 1
                : 0.9,
            }}
          >
            <ChevronRight className="size-4.5" />
          </motion.button>
        </div>
      )}
    </>
  );
}
