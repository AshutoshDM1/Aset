import { Link } from 'react-router';
import { Folder } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ItemGridActions } from './ItemGridActions';

export type FolderColor = 'cyan' | 'yellow' | 'pink' | 'black';

interface FolderComponentProps {
  folderName: string;
  folderId: number;
  color?: FolderColor;
  to?: string;
  className?: string;
  starred?: boolean;
  trashed?: boolean;
  onRefetch?: () => void;
}

const colorMap: Record<FolderColor, string> = {
  cyan: 'text-primary',
  yellow: 'text-amber-400',
  pink: 'text-pink-500',
  black: 'text-neutral-800 dark:text-neutral-200',
};

const FolderComponent = ({
  folderName,
  folderId,
  color = 'cyan',
  to,
  className,
  starred,
  trashed,
  onRefetch,
}: FolderComponentProps) => {
  const href = to ?? `/dashboard/folder/${folderId}`;

  return (
    <div className="group relative">
      <ItemGridActions
        id={folderId}
        type="folder"
        name={folderName}
        starred={starred}
        trashed={trashed}
        onRefetch={onRefetch}
      />
      <Link
        to={href}
        className="block rounded-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <div
          className={cn(
            'flex flex-col items-center rounded-2xl p-2 transition-transform duration-200 group-hover:-translate-y-1',
            className,
          )}
        >
          <Folder
            className={cn('size-20', colorMap[color])}
            fill="currentColor"
            strokeWidth={1.25}
            aria-hidden
          />
          <p className="w-full truncate -mt-1.5 text-sm font-medium text-foreground text-center">
            {folderName}
          </p>
        </div>
      </Link>
    </div>
  );
};

export default FolderComponent;
