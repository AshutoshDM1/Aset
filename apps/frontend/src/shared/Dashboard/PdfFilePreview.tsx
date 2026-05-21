import { useState } from 'react';
import { FileText } from 'lucide-react';
import { Document, Page } from 'react-pdf';
import { PdfPreviewDialog } from './PdfPreviewDialog';
import { ItemGridActions } from './ItemGridActions';

type PdfFilePreviewProps = {
  fileId: string;
  name: string;
  url: string;
  starred?: boolean;
  trashed?: boolean;
  onRefetch?: () => void;
  createdAt?: Date | string;
  sizeMb?: number;
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
}: PdfFilePreviewProps) => {
  const [open, setOpen] = useState(false);
  const [thumbnailErrored, setThumbnailErrored] = useState(false);

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
          onClick={() => setOpen(true)}
          aria-label={`Preview ${name}`}
          title={name}
          className="flex flex-col items-center rounded-2xl p-2 transition-transform duration-200 group-hover:-translate-y-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer"
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
            <span className="truncate inline-block align-bottom max-w-[50px]">
              {base.slice(0, 5)}
              {base.length > 5 ? '..' : ''}
            </span>
            {ext}
          </p>
        </button>
      </div>
      <PdfPreviewDialog
        open={open}
        onOpenChange={setOpen}
        fileName={name}
        fileUrl={url}
        fileId={fileId}
      />
    </>
  );
};

export default PdfFilePreview;
