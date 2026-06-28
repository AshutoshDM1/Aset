import { FileIcon } from 'lucide-react';
import { ItemGridActions } from './ItemGridActions';
import FileThumbnail from './FileThumbnail';
import { cn } from '@/lib/utils';

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface OtherFileTileProps {
  fileId: string;
  name: string;
  url?: string;
  starred?: boolean;
  trashed?: boolean;
  onRefetch?: () => void;
  createdAt?: Date | string;
  sizeMb?: number;
  thumbnailUrl?: string | null;
}

export function OtherFileTile({
  fileId,
  name,
  url,
  starred,
  trashed,
  onRefetch,
  createdAt,
  sizeMb,
  thumbnailUrl,
}: OtherFileTileProps) {
  return (
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
          <div
            aria-label={name}
            className="w-full flex flex-col items-center rounded-2xl p-2 transition-transform duration-200 group-hover:-translate-y-1 cursor-pointer relative z-0"
          >
            <div
              className={cn(
                'flex size-20 items-center justify-center overflow-hidden bg-muted/40 ring-1 ring-border/60 rounded-2xl',
              )}
            >
              <FileThumbnail
                name={name}
                thumbnailUrl={thumbnailUrl}
                fallbackIcon={FileIcon}
                fallbackColorClass="text-muted-foreground"
              />
            </div>
            <p className="text-xs text-foreground text-center w-20 truncate mt-1.5 px-0.5">
              {name}
            </p>
          </div>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="text-xs max-w-64 break-all">
          {name}
        </TooltipContent>
      </Tooltip>
    </div>
  );
}
