import {
  ZoomIn,
  ZoomOut,
  RotateCw,
  RefreshCw,
  Sparkles,
  Loader2,
  CheckCheck,
  Info,
} from 'lucide-react';
import type { ImageState } from './types';
import { motion } from 'motion/react';

interface ImageFloatingToolbarProps {
  state: ImageState;
  fileId?: string;
  fileName: string;
  imageUrl: string;
  onRefetch?: () => void;
  onOptimizeSuccess?: (stats: {
    oldSize: number;
    newSize: number;
    savedPercent: number;
  }) => void;
}

export function ImageFloatingToolbar({
  state,
  fileId,
  fileName,
  imageUrl,
  onRefetch,
  onOptimizeSuccess,
}: ImageFloatingToolbarProps) {
  const {
    scale,
    rotate,
    x,
    y,
    handleZoomIn,
    handleZoomOut,
    handleRotate,
    handleReset,
    optimizeState,
    optimize,
    setIsDetailsOpen,
  } = state;

  const hasModifications =
    scale !== 1 || rotate !== 0 || x.get() !== 0 || y.get() !== 0;

  return (
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-1.5 bg-black/75 backdrop-blur-md border border-white/10 rounded-2xl px-4 py-2 text-white shadow-xl animate-in fade-in slide-in-from-bottom-4 duration-300 select-none">
      <motion.button
        type="button"
        className="size-9 text-white/80 hover:text-white hover:bg-white/10 rounded-xl flex items-center justify-center cursor-pointer transition-colors duration-200"
        onClick={handleZoomIn}
        title="Zoom In"
        whileTap={{ scale: 0.95 }}
      >
        <ZoomIn className="size-4.5" />
      </motion.button>
      <motion.button
        type="button"
        className="size-9 text-white/80 hover:text-white hover:bg-white/10 rounded-xl flex items-center justify-center cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed transition-colors duration-200"
        onClick={handleZoomOut}
        disabled={scale <= 0.25}
        title="Zoom Out"
        whileTap={{ scale: scale > 0.25 ? 0.95 : 1 }}
      >
        <ZoomOut className="size-4.5" />
      </motion.button>
      <motion.button
        type="button"
        className="size-9 text-white/80 hover:text-white hover:bg-white/10 rounded-xl flex items-center justify-center cursor-pointer transition-colors duration-200"
        onClick={handleRotate}
        title="Rotate 90°"
        whileTap={{ scale: 0.95 }}
      >
        <RotateCw className="size-4.5" />
      </motion.button>
      {hasModifications && (
        <motion.button
          type="button"
          className="size-9 text-primary hover:bg-white/10 rounded-xl flex items-center justify-center cursor-pointer transition-colors duration-200"
          onClick={handleReset}
          title="Reset Preview"
          whileTap={{ scale: 0.95 }}
        >
          <RefreshCw className="size-4.5" />
        </motion.button>
      )}
      <div className="h-4 w-px bg-white/15 mx-1" />

      {/* Optimize — fullscreen toolbar */}
      <motion.button
        type="button"
        className="h-9 gap-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-xl px-3 text-xs font-semibold flex items-center cursor-pointer transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
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
        whileTap={{ scale: 0.98 }}
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
      </motion.button>

      {fileId && (
        <motion.button
          type="button"
          className="h-9 gap-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-xl px-3 text-xs font-semibold flex items-center cursor-pointer transition-colors duration-200"
          onClick={() => setIsDetailsOpen(true)}
          whileTap={{ scale: 0.95 }}
        >
          <Info className="size-4" />
        </motion.button>
      )}
    </div>
  );
}
