import { useState, useMemo, useCallback } from 'react';
import { FileText } from 'lucide-react';
import { Document, Page } from 'react-pdf';
import { PdfPreviewDialog } from './PdfPreviewDialog';
import { ItemGridActions } from './ItemGridActions';

type SiblingPdf = {
  id: string;
  name: string;
  url: string;
  starred?: boolean;
  trashed?: boolean;
  createdAt?: Date | string;
  sizeMb?: number;
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
  allPdfs,
}: PdfFilePreviewProps) => {
  const [open, setOpen] = useState(false);
  const [thumbnailErrored, setThumbnailErrored] = useState(false);
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

  const dot = name.lastIndexOf('.');
  const base = dot > 0 ? name.slice(0, dot) : name;
  const ext = dot > 0 ? name.slice(dot) : '';

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
          onRefetch={onRefetch}
          sizeMb={sizeMb}
          createdAt={createdAt}
        />
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
          title={name}
          className="w-full flex flex-col items-center rounded-2xl p-2 transition-transform duration-200 group-hover:-translate-y-1 cursor-pointer relative z-0"
        >
          <div className="flex size-20 items-center justify-center overflow-hidden rounded-2xl bg-muted/40 ring-1 ring-border/60">
            {url && !thumbnailErrored ? (
              <Document
                file={url}
                onLoadError={() => setThumbnailErrored(true)}
                loading={
                  <FileText className="size-8 text-red-500/50 animate-pulse" />
                }
              >
                <Page
                  pageNumber={1}
                  width={80}
                  renderTextLayer={false}
                  renderAnnotationLayer={false}
                  loading={null}
                />
              </Document>
            ) : (
              <FileText className="size-8 text-red-500" aria-hidden />
            )}
          </div>
          <p className="text-sm text-foreground text-center w-20">
            <span className="truncate inline-block align-bottom max-w-12.5">
              {base.slice(0, 5)}
              {base.length > 5 ? '..' : ''}
            </span>
            {ext}
          </p>
        </button>
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
