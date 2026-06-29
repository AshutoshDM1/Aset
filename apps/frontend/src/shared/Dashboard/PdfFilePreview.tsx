import { useState, useMemo, useCallback } from 'react';
import { FileText } from 'lucide-react';
import { PdfPreviewDialog } from './PdfPreviewDialog';
import { ItemGridActions } from './ItemGridActions';
import FileThumbnail from './FileThumbnail';
import { cn } from '@/lib/utils';

import { truncateFileName } from '@/utils/file/file-utils';

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

type SiblingPdf = {
  id: string;
  name: string;
  url: string;
  starred?: boolean;
  trashed?: boolean;
  createdAt?: Date | string;
  sizeMb?: number;
  thumbnailUrl?: string | null;
};

type PdfFilePreviewProps = {
  fileId: string;
  name: string;
  url: string;
  starred?: boolean;
  trashed?: boolean;
  onRefetch?: () => void;
  createdAt?: Date | string;
  sizeMb?: number;
  thumbnailUrl?: string | null;
  allPdfs?: SiblingPdf[];
};

const PdfFilePreview = ({
  fileId,
  name,
  url,
  starred,
  trashed,
  onRefetch,
  createdAt,
  sizeMb,
  thumbnailUrl,
  allPdfs,
}: PdfFilePreviewProps) => {
  const [open, setOpen] = useState(false);
  const [activeFile, setActiveFile] = useState<{
    id: string;
    name: string;
    url: string;
    starred?: boolean;
    trashed?: boolean;
    createdAt?: Date | string;
    sizeMb?: number;
  } | null>(null);

  const currentPdfIndex = useMemo(() => {
    if (!activeFile || !allPdfs) return -1;
    return allPdfs.findIndex((pdf) => pdf.id === activeFile.id);
  }, [activeFile, allPdfs]);

  const handlePrev = useCallback(() => {
    if (allPdfs && currentPdfIndex > 0) {
      const prevPdf = allPdfs[currentPdfIndex - 1];
      setActiveFile({
        id: prevPdf.id,
        name: prevPdf.name,
        url: prevPdf.url,
        starred: prevPdf.starred,
        trashed: prevPdf.trashed,
        createdAt: prevPdf.createdAt,
        sizeMb: prevPdf.sizeMb,
      });
    }
  }, [currentPdfIndex, allPdfs]);

  const handleNext = useCallback(() => {
    if (allPdfs && currentPdfIndex < allPdfs.length - 1) {
      const nextPdf = allPdfs[currentPdfIndex + 1];
      setActiveFile({
        id: nextPdf.id,
        name: nextPdf.name,
        url: nextPdf.url,
        starred: nextPdf.starred,
        trashed: nextPdf.trashed,
        createdAt: nextPdf.createdAt,
        sizeMb: nextPdf.sizeMb,
      });
    }
  }, [currentPdfIndex, allPdfs]);

  return (
    <>
      <div className="group relative">
        <ItemGridActions
          id={fileId}
          type="file"
          name={name}
          starred={starred}
          trashed={trashed}
          url={url}
          thumbnailUrl={thumbnailUrl}
          onRefetch={onRefetch}
          sizeMb={sizeMb}
          createdAt={createdAt}
        />
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              onClick={() => {
                setActiveFile({
                  id: fileId,
                  name,
                  url,
                  starred,
                  trashed,
                  createdAt,
                  sizeMb,
                });
                setOpen(true);
              }}
              aria-label={`Preview ${name}`}
              className="w-full flex flex-col items-center rounded-2xl p-2 transition-transform duration-200 group-hover:-translate-y-1 cursor-pointer relative z-0"
            >
              <div
                className={cn(
                  'flex size-20 items-center justify-center overflow-hidden bg-muted ring-1 ring-border/60 rounded-2xl',
                )}
              >
                <FileThumbnail
                  name={name}
                  thumbnailUrl={thumbnailUrl}
                  fallbackIcon={FileText}
                  fallbackColorClass="text-red-500"
                />
              </div>
              <p className="text-xs text-foreground text-center w-20 mt-1.5 px-0.5">
                {truncateFileName(name)}
              </p>
            </button>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="text-xs max-w-64 break-all">
            {name}
          </TooltipContent>
        </Tooltip>
      </div>
      <PdfPreviewDialog
        open={open}
        onOpenChange={(isOpen) => {
          setOpen(isOpen);
          if (!isOpen) {
            setActiveFile(null);
          }
        }}
        fileName={activeFile?.name ?? name}
        fileUrl={activeFile?.url ?? url}
        fileId={activeFile?.id ?? fileId}
        onPrev={allPdfs && currentPdfIndex > 0 ? handlePrev : undefined}
        onNext={
          allPdfs && currentPdfIndex < allPdfs.length - 1
            ? handleNext
            : undefined
        }
      />
    </>
  );
};

export default PdfFilePreview;
