import { useState, useEffect } from 'react';
import { useIsMobile } from '@/hooks/isMobile';
import { pdfjs, Document, Page } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Download,
} from 'lucide-react';
import Loader from '@/shared/PageLoader/Loader';
import { cn } from '@/lib/utils';

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface PdfPreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  fileName: string;
  fileUrl: string;
}

export function PdfPreviewDialog({
  open,
  onOpenChange,
  fileName,
  fileUrl,
}: PdfPreviewDialogProps) {
  const isMobile = useIsMobile();
  const [numPages, setNumPages] = useState<number>();
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [scale, setScale] = useState<number>(0.6);

  useEffect(() => {
    if (open) {
      setScale(isMobile ? 0.5 : 0.6);
    }
  }, [open, isMobile]);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
    setPageNumber(1);
  }

  const changePage = (offset: number) => {
    setPageNumber((prevPageNumber) => prevPageNumber + offset);
  };

  const previousPage = () => changePage(-1);
  const nextPage = () => changePage(1);

  const zoomIn = () => setScale((prev) => Math.min(prev + 0.1, 1.5));
  const zoomOut = () => setScale((prev) => Math.max(prev - 0.1, 0.5));

  const handleDownload = () => {
    if (!fileUrl) return;
    const a = document.createElement('a');
    a.href = fileUrl;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[min(100vw-2rem,64rem)] h-[80vh] gap-0 p-0 overflow-hidden flex flex-col sm:h-[min(90vh,1100px)] sm:max-w-lg">
        <DialogHeader className="p-4 border-b shrink-0 bg-background/95 backdrop-blur z-10 flex flex-row items-center justify-between">
          <div className="flex flex-col gap-1 overflow-hidden pr-4">
            <DialogTitle className="truncate">{fileName}</DialogTitle>
            <DialogDescription className="sr-only">
              Preview of uploaded PDF
            </DialogDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={zoomOut}
              disabled={scale <= 0.5}
            >
              <ZoomOut className="size-4" />
            </Button>
            <span className="text-sm text-muted-foreground w-12 text-center">
              {Math.round(scale * 100)}%
            </span>
            <Button
              variant="ghost"
              size="icon"
              onClick={zoomIn}
              disabled={scale >= 1.5}
            >
              <ZoomIn className="size-4" />
            </Button>
            <div className="w-px h-6 bg-border mx-2" />
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownload}
              className="gap-2"
            >
              <Download className="size-4" />
              Download
            </Button>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-auto bg-muted/30 relative flex flex-col">
          {fileUrl ? (
            <div className="flex-1 min-h-full flex items-start justify-center p-4">
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
                className="flex flex-col items-center"
              >
                <div
                  className={cn(
                    'bg-white shadow-lg ring-1 ring-border/20 transition-all duration-200',
                    'flex items-center justify-center',
                  )}
                >
                  <Page
                    pageNumber={pageNumber}
                    scale={scale}
                    renderTextLayer={true}
                    renderAnnotationLayer={true}
                    className="max-w-full"
                    loading={
                      <div className="flex items-center justify-center w-[400px] h-[600px]">
                        <Loader />
                      </div>
                    }
                  />
                </div>
              </Document>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              No PDF file provided.
            </div>
          )}
        </div>

        {/* Footer controls */}
        {numPages && numPages > 1 && (
          <div className="p-3 border-t bg-background shrink-0 flex items-center justify-center gap-4">
            <Button
              variant="outline"
              size="icon"
              disabled={pageNumber <= 1}
              onClick={previousPage}
            >
              <ChevronLeft className="size-4" />
            </Button>
            <span className="text-sm font-medium text-muted-foreground min-w-[100px] text-center">
              Page {pageNumber} of {numPages}
            </span>
            <Button
              variant="outline"
              size="icon"
              disabled={pageNumber >= numPages}
              onClick={nextPage}
            >
              <ChevronRight className="size-4" />
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
