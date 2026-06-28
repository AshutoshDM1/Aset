import { useState } from 'react';
import { FileText } from 'lucide-react';
import { TextPreview } from '@/components/Preview/TextPreview';
import { ItemGridActions } from './ItemGridActions';
import FileThumbnail from './FileThumbnail';

type TextFilePreviewProps = {
  fileId: string;
  name: string;
  url: string;
  starred?: boolean;
  trashed?: boolean;
  onRefetch?: () => void;
  createdAt?: Date | string;
  sizeMb?: number;
};

const TextFilePreview = ({
  fileId,
  name,
  url,
  starred,
  trashed,
  onRefetch,
  createdAt,
  sizeMb,
}: TextFilePreviewProps) => {
  const [open, setOpen] = useState(false);

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
          aria-label={`Preview text file ${name}`}
          title={name}
          className="w-full flex flex-col items-center rounded-2xl p-2 transition-transform duration-200 group-hover:-translate-y-1 cursor-pointer relative z-0"
        >
          <div className="flex size-20 items-center justify-center overflow-hidden relative">
            <FileThumbnail
              name={name}
              fallbackIcon={FileText}
              fallbackColorClass="text-amber-500"
            />
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

      <TextPreview
        open={open}
        onClose={() => setOpen(false)}
        fileName={name}
        fileUrl={url}
        fileId={fileId}
      />
    </>
  );
};

export default TextFilePreview;
