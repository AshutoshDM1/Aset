import { useState } from 'react';
import { ImageIcon } from 'lucide-react';
import { ImagePreviewDialog } from './ImagePreviewDialog';
import { ItemGridActions } from './ItemGridActions';

type ImageFilePreviewProps = {
  fileId: number;
  name: string;
  url: string;
  starred?: boolean;
  trashed?: boolean;
  onRefetch?: () => void;
};

const ImageFilePreview = ({
  fileId,
  name,
  url,
  starred,
  trashed,
  onRefetch,
}: ImageFilePreviewProps) => {
  const [open, setOpen] = useState(false);
  const [errored, setErrored] = useState(false);

  const dot = name.lastIndexOf('.');
  const base = dot > 0 ? name.slice(0, dot) : name;
  const ext = dot > 0 ? name.slice(dot) : '';

  return (
    <>
      <div className="group relative">
        <ItemGridActions
          id={fileId}
          type="file"
          starred={starred}
          trashed={trashed}
          onRefetch={onRefetch}
        />
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label={`Preview ${name}`}
          title={name}
          className="flex flex-col items-center rounded-2xl p-2 transition-transform duration-200 group-hover:-translate-y-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer"
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
          <p className="text-sm text-foreground text-center w-20">
            <span className="truncate inline-block align-bottom max-w-[50px]">
              {base.slice(0, 5)}
              {base.length > 5 ? '..' : ''}
            </span>
            {ext}
          </p>
        </button>
      </div>
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
