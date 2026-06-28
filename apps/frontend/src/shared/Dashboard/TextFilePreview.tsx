import { useState } from 'react';
import { FileText } from 'lucide-react';
import { TextPreview } from '@/components/Preview/TextPreview';
import { ItemGridActions } from './ItemGridActions';
import FileThumbnail from './FileThumbnail';

import { truncateFileName } from '@/utils/file/file-utils';

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

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
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              onClick={() => setOpen(true)}
              aria-label={`Preview text file ${name}`}
              className="w-full flex flex-col items-center rounded-2xl p-2 transition-transform duration-200 group-hover:-translate-y-1 cursor-pointer relative z-0"
            >
              <div className="flex size-20 items-center justify-center overflow-hidden relative bg-muted/40 ring-1 ring-border/60 rounded-2xl">
                <FileThumbnail
                  name={name}
                  fallbackIcon={FileText}
                  fallbackColorClass="text-amber-500"
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
