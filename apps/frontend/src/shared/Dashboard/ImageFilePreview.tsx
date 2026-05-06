import { useState } from 'react';
import { ImageIcon } from 'lucide-react';
import { ImagePreviewDialog } from './ImagePreviewDialog';

type ImageFilePreviewProps = {
  name: string;
  url: string;
};

const ImageFilePreview = ({ name, url }: ImageFilePreviewProps) => {
  const [open, setOpen] = useState(false);
  const [errored, setErrored] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={`Preview ${name}`}
        title={name}
        className="group flex flex-col items-center rounded-2xl p-2 transition-transform duration-200 hover:-translate-y-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer"
      >
        <div className="flex size-20 items-center justify-center overflow-hidden rounded-2xl bg-muted/40 ring-1 ring-border/60">
          {url && !errored ? (
            <img
              src={url}
              alt=""
              loading="lazy"
              className="size-full object-cover"
              onError={() => setErrored(true)}
            />
          ) : (
            <ImageIcon className="size-8 text-muted-foreground" aria-hidden />
          )}
        </div>
        <p className="text-sm text-foreground ">
          <span className="truncate w-20">
            {name.split('.')[0].slice(0, 5)}...
          </span>
          {name.split('.')[1] || '.png'}
        </p>
      </button>
      <ImagePreviewDialog
        open={open}
        onOpenChange={setOpen}
        fileName={name}
        imageUrl={url}
      />
    </>
  );
};

export default ImageFilePreview;
