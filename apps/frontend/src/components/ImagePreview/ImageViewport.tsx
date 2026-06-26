import { motion } from 'motion/react';
import type { ImageState } from './types';
import { useCallback, useRef, useEffect } from 'react';

interface ImageViewportProps {
  state: ImageState;
  imageUrl: string;
  fileName: string;
}

export function ImageViewport({
  state,
  imageUrl,
  fileName,
}: ImageViewportProps) {
  const { scale, setScale, rotate, x, y } = state;

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

  if (!imageUrl) {
    return (
      <div className="flex-1 flex items-center justify-center p-8 text-center border border-dashed rounded-2xl">
        <p className="text-sm text-muted-foreground">
          Set <code className="rounded bg-muted px-1">R2_PUBLIC_BASE_URL</code>{' '}
          on the server (e.g. your R2 public dev URL).
        </p>
      </div>
    );
  }

  return (
    <div
      ref={containerCallbackRef}
      className="flex-1 min-h-0 w-full flex items-center justify-center overflow-hidden relative group/viewport select-none bg-black"
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
          className="object-contain select-none shadow-md rounded-lg pointer-events-none max-h-[92dvh] max-w-[95vw]"
          draggable={false}
        />
      </motion.div>

      <span className="absolute bottom-4 right-4 px-2.5 py-1 rounded bg-black/60 text-white text-[11px] font-mono pointer-events-none opacity-0 group-hover/viewport:opacity-100 transition-opacity z-10">
        {Math.round(scale * 100)}%
      </span>
    </div>
  );
}
