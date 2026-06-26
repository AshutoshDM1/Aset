import { pdfjs, Document, Page } from 'react-pdf';
import Loader from '@/shared/PageLoader/Loader';
import { motion } from 'motion/react';
import type { PdfState } from './types';
import { cn } from '@/lib/utils';
import { useCallback, useRef, useEffect, useState } from 'react';
import { PdfVerticalView } from './PdfVerticalView';

// Crucial: Import react-pdf styles to overlay text and link annotations correctly,
// which instantly removes the empty white space gap beneath pages!
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface PdfViewportProps {
  state: PdfState;
  fileUrl: string;
  fileName?: string;
}

export function PdfViewport({ state, fileUrl }: PdfViewportProps) {
  const {
    scale,
    setScale,
    rotate,
    pageNumber,
    setNumPages,
    numPages,
    isFullscreen,
    viewMode,
    x,
    y,
  } = state;

  // Track scale in a ref for safe use inside gesture handlers
  const scaleRef = useRef(scale);

  const [windowHeight, setWindowHeight] = useState(
    typeof window !== 'undefined' ? window.innerHeight : 800,
  );

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handleResize = () => {
      setWindowHeight(window.innerHeight);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const RENDER_SCALE = 4;
  const targetHeight = (isFullscreen ? 0.92 : 0.6) * windowHeight;
  const cssScale = scale / RENDER_SCALE;

  useEffect(() => {
    scaleRef.current = scale;
  }, [scale]);

  // Touch and wheel gesture states
  const pinchStartDistanceRef = useRef(0);
  const pinchStartScaleRef = useRef(1);
  const isPinchZoomingRef = useRef(false);
  const activeContainerRef = useRef<HTMLDivElement | null>(null);

  // 1. Mouse wheel zoom handler
  const preventDefaultWheel = useCallback(
    (e: WheelEvent) => {
      e.preventDefault();
      const zoomFactor = 0.08;
      setScale((s) => {
        const newScale = s + (e.deltaY < 0 ? zoomFactor : -zoomFactor);
        return Math.max(0.25, Math.min(newScale, 4));
      });
    },
    [setScale],
  );

  // 2. Pinch touch zoom (2 fingers) handlers
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

  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
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
    },
    [setScale],
  );

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

      if (node && viewMode !== 'vertical') {
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
    [
      preventDefaultWheel,
      handleTouchStart,
      handleTouchMove,
      handleTouchEnd,
      viewMode,
    ],
  );

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
  }

  // 2. Single Page Mode: Renders one page with drag panning support
  const renderSingleView = () => (
    <motion.div
      drag
      dragMomentum={false}
      dragElastic={0.5}
      style={{ x, y, scale: cssScale, rotate }}
      className="flex items-center justify-center cursor-grab active:cursor-grabbing bg-white p-2 shadow-2xl ring-1 ring-border/20 rounded-2xl transform-gpu"
    >
      <div className="overflow-hidden rounded-xl border border-border/10">
        <Page
          pageNumber={pageNumber}
          height={targetHeight}
          scale={RENDER_SCALE}
          renderTextLayer
          renderAnnotationLayer
          loading={
            <div className="flex items-center justify-center w-75 h-112.5">
              <Loader />
            </div>
          }
        />
      </div>
    </motion.div>
  );

  // 3. Double Page Spread Mode: Renders two pages side-by-side with drag panning support
  const renderDoubleView = () => (
    <motion.div
      drag
      dragMomentum={false}
      dragElastic={0.5}
      style={{ x, y, scale: cssScale, rotate }}
      className="flex items-center justify-center cursor-grab active:cursor-grabbing bg-white p-2 shadow-2xl ring-1 ring-border/20 rounded-2xl transform-gpu gap-4"
    >
      {/* First Page */}
      <div className="overflow-hidden rounded-xl border border-border/10">
        <Page
          pageNumber={pageNumber}
          height={targetHeight}
          scale={RENDER_SCALE}
          renderTextLayer
          renderAnnotationLayer
          loading={
            <div className="flex items-center justify-center w-75 h-112.5">
              <Loader />
            </div>
          }
        />
      </div>

      {/* Second Page (if it exists) */}
      {pageNumber + 1 <= (numPages || 0) && (
        <div className="overflow-hidden rounded-xl border border-border/10">
          <Page
            pageNumber={pageNumber + 1}
            height={targetHeight}
            scale={RENDER_SCALE}
            renderTextLayer
            renderAnnotationLayer
            loading={
              <div className="flex items-center justify-center w-75 h-112.5">
                <Loader />
              </div>
            }
          />
        </div>
      )}
    </motion.div>
  );

  return (
    <div
      ref={containerCallbackRef}
      className={cn(
        'flex-1 min-h-0 w-full flex relative group/viewport select-none rounded-2xl bg-black/5 dark:bg-black/20 border border-border/60 custom-scrollbar',
        isFullscreen && 'bg-black w-screen h-screen border-none rounded-none',
        viewMode === 'vertical'
          ? 'overflow-y-auto p-4 flex-col '
          : 'overflow-hidden items-center justify-center',
      )}
    >
      {fileUrl ? (
        <Document
          file={fileUrl}
          onLoadSuccess={onDocumentLoadSuccess}
          loading={
            <div className="flex items-center justify-center h-full w-full py-20">
              <Loader />
            </div>
          }
          error={
            <div className="text-destructive p-4 text-center">
              Failed to load PDF. Please try downloading it instead.
            </div>
          }
          className={cn(
            'flex',
            viewMode === 'vertical'
              ? 'flex-col gap-6 py-4 w-full h-auto min-h-full items-center justify-start'
              : 'items-center justify-center size-full',
          )}
        >
          {viewMode === 'vertical' && (
            <PdfVerticalView
              numPages={numPages || 0}
              scale={scale}
              rotate={rotate}
            />
          )}
          {viewMode === 'single' && renderSingleView()}
          {viewMode === 'double' && renderDoubleView()}
        </Document>
      ) : (
        <div className="flex items-center justify-center h-full text-muted-foreground">
          No PDF file provided.
        </div>
      )}

      {/* Interactive zoom badge */}
      <span className="fixed bottom-4 right-4 px-2.5 py-1 rounded bg-black/60 text-white text-[11px] font-mono pointer-events-none opacity-0 group-hover/viewport:opacity-100 transition-opacity z-10">
        {Math.round(scale * 100)}%
      </span>
    </div>
  );
}
