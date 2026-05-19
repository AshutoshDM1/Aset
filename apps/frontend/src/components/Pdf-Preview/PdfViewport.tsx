import { pdfjs, Document, Page } from 'react-pdf';
import Loader from '@/shared/PageLoader/Loader';
import { motion } from 'motion/react';
import type { PdfState } from './types';
import { cn } from '@/lib/utils';
import { useCallback, useRef, useEffect } from 'react';

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
    setPageNumber,
    setNumPages,
    numPages,
    isFullscreen,
    viewMode,
    x,
    y,
  } = state;

  // Track scale in a ref for safe use inside gesture handlers
  const scaleRef = useRef(scale);
  useEffect(() => {
    scaleRef.current = scale;
  }, [scale]);

  // Touch and wheel gesture states
  const pinchStartDistanceRef = useRef(0);
  const pinchStartScaleRef = useRef(1);
  const isPinchZoomingRef = useRef(false);
  const activeContainerRef = useRef<HTMLDivElement | null>(null);

  // Track manual vs programmatic scrolling to avoid observer feedback loops
  const isScrollingRef = useRef(false);

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

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
  }

  // Smooth scroll page into view when pageNumber changes programmatically in vertical mode
  useEffect(() => {
    if (viewMode !== 'vertical' || isScrollingRef.current) return;

    const pageEl = document.getElementById(`pdf-page-${pageNumber}`);
    if (pageEl) {
      // Temporarily lock scroll spy to prevent feedback loops
      isScrollingRef.current = true;
      pageEl.scrollIntoView({ behavior: 'smooth', block: 'start' });

      // Unlock after smooth scroll animation finishes
      const timer = setTimeout(() => {
        isScrollingRef.current = false;
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [pageNumber, viewMode]);

  // Scroll spy: update the pageNumber in state as the user manually scrolls
  useEffect(() => {
    if (viewMode !== 'vertical' || !numPages || !activeContainerRef.current)
      return;

    const container = activeContainerRef.current;

    const handleScroll = () => {
      // If programmatically scrolling to a target page, ignore the spy
      if (isScrollingRef.current) return;

      const containerRect = container.getBoundingClientRect();
      const containerCenter = containerRect.top + containerRect.height / 2;

      let closestPage = pageNumber;
      let minDistance = Infinity;

      for (let i = 1; i <= numPages; i++) {
        const el = document.getElementById(`pdf-page-${i}`);
        if (el) {
          const rect = el.getBoundingClientRect();
          // Measure distance between container center and page center
          const pageCenter = rect.top + rect.height / 2;
          const distance = Math.abs(pageCenter - containerCenter);

          if (distance < minDistance) {
            minDistance = distance;
            closestPage = i;
          }
        }
      }

      if (closestPage !== pageNumber) {
        setPageNumber(closestPage);
      }
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      container.removeEventListener('scroll', handleScroll);
    };
  }, [viewMode, numPages, pageNumber, setPageNumber]);

  // Determine standard page height limits
  const pageHeightClass = isFullscreen ? 'h-[92dvh]' : 'h-[60dvh]';

  return (
    <div
      ref={containerCallbackRef}
      className={cn(
        'flex-1 min-h-0 w-full flex relative group/viewport select-none rounded-2xl bg-black/5 dark:bg-black/20 border border-border/60',
        isFullscreen && 'bg-black w-screen h-screen border-none rounded-none',
        viewMode === 'vertical'
          ? 'overflow-y-auto p-4 flex-col items-center justify-start'
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
          {viewMode === 'vertical' ? (
            // 3. VERTICAL ALL-PAGES VIEW MODE
            <motion.div
              style={{ scale, rotate }}
              className="flex flex-col gap-6 items-center w-full transform-gpu origin-center py-4"
            >
              {Array.from(new Array(numPages || 0), (_, index) => (
                <div
                  key={index}
                  id={`pdf-page-${index + 1}`}
                  className="bg-white shadow-xl ring-1 ring-border/20 rounded-xl overflow-hidden p-1 select-text"
                >
                  <Page
                    pageNumber={index + 1}
                    scale={1}
                    renderTextLayer={true}
                    renderAnnotationLayer={true}
                    className="max-w-full"
                    loading={
                      <div className="flex items-center justify-center w-[300px] h-[400px]">
                        <Loader />
                      </div>
                    }
                  />
                </div>
              ))}
            </motion.div>
          ) : (
            // 1 & 2. SINGLE PAGE AND DOUBLE PAGE SPREAD VIEWS
            <motion.div
              drag
              dragMomentum={false}
              dragElastic={0.5}
              style={{ x, y, scale, rotate }}
              className={cn(
                'flex items-center justify-center cursor-grab active:cursor-grabbing bg-white p-2 shadow-2xl ring-1 ring-border/20 rounded-2xl transform-gpu',
                viewMode === 'double' ? 'gap-4' : '',
              )}
            >
              {/* First Page */}
              <div className="overflow-hidden rounded-xl border border-border/10">
                <Page
                  pageNumber={pageNumber}
                  scale={1}
                  renderTextLayer={true}
                  renderAnnotationLayer={true}
                  className={pageHeightClass}
                  loading={
                    <div className="flex items-center justify-center w-[300px] h-[450px]">
                      <Loader />
                    </div>
                  }
                />
              </div>

              {/* Second Page (Only in Double Spread mode, and if the page exists) */}
              {viewMode === 'double' && pageNumber + 1 <= (numPages || 0) && (
                <div className="overflow-hidden rounded-xl border border-border/10">
                  <Page
                    pageNumber={pageNumber + 1}
                    scale={1}
                    renderTextLayer={true}
                    renderAnnotationLayer={true}
                    className={pageHeightClass}
                    loading={
                      <div className="flex items-center justify-center w-[300px] h-[450px]">
                        <Loader />
                      </div>
                    }
                  />
                </div>
              )}
            </motion.div>
          )}
        </Document>
      ) : (
        <div className="flex items-center justify-center h-full text-muted-foreground">
          No PDF file provided.
        </div>
      )}

      {/* Interactive zoom badge */}
      <span className="absolute bottom-4 right-4 px-2.5 py-1 rounded bg-black/60 text-white text-[11px] font-mono pointer-events-none opacity-0 group-hover/viewport:opacity-100 transition-opacity z-10">
        {Math.round(scale * 100)}%
      </span>
    </div>
  );
}
