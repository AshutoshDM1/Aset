import type { MotionValue } from 'motion/react';

export interface ImagePreviewProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  fileName: string;
  imageUrl: string;
  fileId?: string;
  sizeMb?: number;
  createdAt?: Date | string;
  starred?: boolean;
  trashed?: boolean;
  onRefetch?: () => void;
  optimizationStats?: {
    oldSize: number;
    newSize: number;
    savedPercent: number;
  } | null;
  onOptimizeSuccess?: (stats: {
    oldSize: number;
    newSize: number;
    savedPercent: number;
  }) => void;
  onPrev?: () => void;
  onNext?: () => void;
}

export interface ImageState {
  scale: number;
  setScale: React.Dispatch<React.SetStateAction<number>>;
  rotate: number;
  setRotate: React.Dispatch<React.SetStateAction<number>>;
  x: MotionValue<number>;
  y: MotionValue<number>;
  handleZoomIn: () => void;
  handleZoomOut: () => void;
  handleRotate: () => void;
  handleReset: () => void;
  handleClose: () => void;
  optimizeState: 'idle' | 'uploading' | 'done' | 'error';
  optimize: (
    imageUrl: string,
    fileName: string,
    fileId: string,
  ) => Promise<{
    oldSize: number;
    newSize: number;
    savedPercent: number;
  } | null>;
  isDetailsOpen: boolean;
  setIsDetailsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}
