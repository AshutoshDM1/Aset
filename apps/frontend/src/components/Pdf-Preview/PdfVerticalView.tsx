import { Page } from 'react-pdf';
import Loader from '@/shared/PageLoader/Loader';

interface PdfVerticalViewProps {
  numPages: number;
  scale: number;
  rotate: number;
}

export function PdfVerticalView({
  numPages,
  scale,
  rotate,
}: PdfVerticalViewProps) {
  return (
    <div className="flex flex-col gap-6 items-center w-full py-4 pb-60">
      {Array.from({ length: numPages || 0 }, (_, index) => (
        <div
          key={index}
          id={`pdf-page-${index + 1}`}
          className="bg-white shadow-xl ring-1 ring-border/20 rounded-xl overflow-hidden p-1 select-text"
        >
          <Page
            pageNumber={index + 1}
            scale={scale}
            rotate={rotate}
            renderTextLayer
            renderAnnotationLayer
            className="max-w-full "
            loading={
              <div className="flex items-center justify-center w-75 h-100">
                <Loader />
              </div>
            }
          />
        </div>
      ))}
    </div>
  );
}
