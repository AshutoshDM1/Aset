import { FileIcon } from 'lucide-react';
import { ItemGridActions } from './ItemGridActions';
import FileThumbnail from './FileThumbnail';
import { cn } from '@/lib/utils';

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
  const dot = name.lastIndexOf('.');
  const base = dot > 0 ? name.slice(0, dot) : name;
  const ext = dot > 0 ? name.slice(dot) : '';

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
      <div
        aria-label={name}
        title={name}
        className="w-full flex flex-col items-center rounded-2xl p-2 transition-transform duration-200 group-hover:-translate-y-1 cursor-pointer relative z-0"
      >
        <div
          className={cn(
            'flex size-20 items-center justify-center overflow-hidden ',
            thumbnailUrl ? 'bg-muted/40 ring-1 ring-border/60 rounded-2xl' : '',
          )}
        >
          <FileThumbnail
            name={name}
            thumbnailUrl={thumbnailUrl}
            fallbackIcon={FileIcon}
            fallbackColorClass="text-muted-foreground"
          />
        </div>
        <p className="text-sm text-foreground text-center w-20">
          <span className="truncate inline-block align-bottom max-w-[50px]">
            {base.slice(0, 5)}
            {base.length > 5 ? '..' : ''}
          </span>
          {ext}
        </p>
      </div>
    </div>
  );
}
