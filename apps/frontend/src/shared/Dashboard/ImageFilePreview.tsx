import { useState, useMemo, useCallback } from 'react';
import { ImageIcon } from 'lucide-react';
import { ItemGridActions } from './ItemGridActions';
import { ImagePreviewDialog } from '@/components/Preview/ImagePreview/ImagePreviewDialog';
import FileThumbnail from './FileThumbnail';
import { cn } from '@/lib/utils';

type SiblingImage = {
  id: string;
  name: string;
  url: string;
  starred?: boolean;
  trashed?: boolean;
  createdAt?: Date | string;
  sizeMb?: number;
  thumbnailUrl?: string | null;
};

type ImageFilePreviewProps = {
  fileId: string;
  name: string;
  url: string;
  starred?: boolean;
  trashed?: boolean;
  onRefetch?: () => void;
  createdAt?: Date | string;
  sizeMb?: number;
  thumbnailUrl?: string | null;
  allImages?: SiblingImage[];
};

const ImageFilePreview = ({
  fileId,
  name,
  url,
  starred,
  trashed,
  onRefetch,
  createdAt,
  sizeMb,
  thumbnailUrl,
  allImages,
}: ImageFilePreviewProps) => {
  const [open, setOpen] = useState(false);
  const [optimizationStats, setOptimizationStats] = useState<{
    oldSize: number;
    newSize: number;
    savedPercent: number;
  } | null>(null);
  const [activeFile, setActiveFile] = useState<{
    id: string;
    name: string;
    url: string;
    starred?: boolean;
    trashed?: boolean;
    createdAt?: Date | string;
    sizeMb?: number;
  } | null>(null);

  const currentImageIndex = useMemo(() => {
    if (!activeFile || !allImages) return -1;
    return allImages.findIndex((img) => img.id === activeFile.id);
  }, [activeFile, allImages]);

  const handlePrev = useCallback(() => {
    if (allImages && currentImageIndex > 0) {
      const prevImg = allImages[currentImageIndex - 1];
      setActiveFile({
        id: prevImg.id,
        name: prevImg.name,
        url: prevImg.url,
        starred: prevImg.starred,
        trashed: prevImg.trashed,
        createdAt: prevImg.createdAt,
        sizeMb: prevImg.sizeMb,
      });
      setOptimizationStats(null);
    }
  }, [currentImageIndex, allImages]);

  const handleNext = useCallback(() => {
    if (allImages && currentImageIndex < allImages.length - 1) {
      const nextImg = allImages[currentImageIndex + 1];
      setActiveFile({
        id: nextImg.id,
        name: nextImg.name,
        url: nextImg.url,
        starred: nextImg.starred,
        trashed: nextImg.trashed,
        createdAt: nextImg.createdAt,
        sizeMb: nextImg.sizeMb,
      });
      setOptimizationStats(null);
    }
  }, [currentImageIndex, allImages]);

  const dot = name.lastIndexOf('.');
  const base = dot > 0 ? name.slice(0, dot) : name;
  const ext = dot > 0 ? name.slice(dot) : '';

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      setOptimizationStats(null);
      setActiveFile(null);
    }
  };

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
          <div
            className={cn(
              'flex size-20 items-center justify-center overflow-hidden ',
              thumbnailUrl
                ? 'bg-muted/40 ring-1 ring-border/60 rounded-2xl'
                : '',
            )}
          >
            <FileThumbnail
              name={name}
              thumbnailUrl={thumbnailUrl}
              fallbackIcon={ImageIcon}
              fallbackColorClass="text-muted-foreground"
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
      <ImagePreviewDialog
        open={open}
        onOpenChange={handleOpenChange}
        fileName={activeFile?.name ?? name}
        imageUrl={activeFile?.url ?? url}
        fileId={activeFile?.id ?? fileId}
        sizeMb={activeFile?.sizeMb ?? sizeMb}
        createdAt={activeFile?.createdAt ?? createdAt}
        starred={activeFile?.starred ?? starred}
        trashed={activeFile?.trashed ?? trashed}
        onRefetch={onRefetch}
        optimizationStats={optimizationStats}
        onOptimizeSuccess={(stats) => {
          setOptimizationStats(stats);
          const currentActive = activeFile;
          setOpen(false);
          setTimeout(() => {
            if (allImages && currentActive) {
              const updated = allImages.find((f) => f.id === currentActive.id);
              setActiveFile(updated || currentActive);
            }
            setOpen(true);
          }, 600);
        }}
        onPrev={allImages && currentImageIndex > 0 ? handlePrev : undefined}
        onNext={
          allImages && currentImageIndex < allImages.length - 1
            ? handleNext
            : undefined
        }
      />
    </>
  );
};

export default ImageFilePreview;
