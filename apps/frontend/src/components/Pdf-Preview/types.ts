import { MotionValue } from 'motion/react';

export type PdfViewMode = 'single' | 'double' | 'vertical';

export interface PdfPreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  fileName: string;
  fileUrl: string;
}

export interface PdfState {
  scale: number;
  setScale: React.Dispatch<React.SetStateAction<number>>;
  rotate: number;
  setRotate: React.Dispatch<React.SetStateAction<number>>;
  isFullscreen: boolean;
  setIsFullscreen: React.Dispatch<React.SetStateAction<boolean>>;
  pageNumber: number;
  setPageNumber: React.Dispatch<React.SetStateAction<number>>;
  numPages: number | undefined;
  setNumPages: React.Dispatch<React.SetStateAction<number | undefined>>;
  viewMode: PdfViewMode;
  setViewMode: React.Dispatch<React.SetStateAction<PdfViewMode>>;
  showControls: boolean;
  setShowControls: React.Dispatch<React.SetStateAction<boolean>>;
  x: MotionValue<number>;
  y: MotionValue<number>;
  handleReset: () => void;
}
