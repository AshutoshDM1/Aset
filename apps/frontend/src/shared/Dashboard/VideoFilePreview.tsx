import { useState, useMemo, useCallback } from 'react';
import { Video, Play } from 'lucide-react';
import { ItemGridActions } from './ItemGridActions';
import { motion } from 'motion/react';
import { VideoPreview } from '@/components/Preview/VideoPreview';
import FileThumbnail from './FileThumbnail';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

type SiblingVideo = {
  id: string;
  name: string;
  url: string;
  starred?: boolean;
  trashed?: boolean;
  createdAt?: Date | string;
  sizeMb?: number;
  processingStatus?: string | null;
  thumbnailUrl?: string | null;
};

type VideoFilePreviewProps = {
  fileId: string;
  name: string;
  url: string;
  starred?: boolean;
  trashed?: boolean;
  onRefetch?: () => void;
  createdAt?: Date | string;
  sizeMb?: number;
  processingStatus?: string | null;
  thumbnailUrl?: string | null;
  allVideos?: SiblingVideo[];
};

const VideoFilePreview = ({
  fileId,
  name,
  url,
  starred,
  trashed,
  onRefetch,
  createdAt,
  sizeMb,
  processingStatus,
  thumbnailUrl,
  allVideos,
}: VideoFilePreviewProps) => {
  const [open, setOpen] = useState(false);
  const [activeFile, setActiveFile] = useState<{
    id: string;
    name: string;
    url: string;
    starred?: boolean;
    trashed?: boolean;
    createdAt?: Date | string;
    sizeMb?: number;
    processingStatus?: string | null;
  } | null>(null);

  const currentVideoIndex = useMemo(() => {
    if (!activeFile || !allVideos) return -1;
    return allVideos.findIndex((video) => video.id === activeFile.id);
  }, [activeFile, allVideos]);

  const handlePrev = useCallback(() => {
    if (allVideos && currentVideoIndex > 0) {
      const prevVideo = allVideos[currentVideoIndex - 1];
      setActiveFile({
        id: prevVideo.id,
        name: prevVideo.name,
        url: prevVideo.url,
        starred: prevVideo.starred,
        trashed: prevVideo.trashed,
        createdAt: prevVideo.createdAt,
        sizeMb: prevVideo.sizeMb,
        processingStatus: prevVideo.processingStatus,
      });
    }
  }, [currentVideoIndex, allVideos]);

  const handleNext = useCallback(() => {
    if (allVideos && currentVideoIndex < allVideos.length - 1) {
      const nextVideo = allVideos[currentVideoIndex + 1];
      setActiveFile({
        id: nextVideo.id,
        name: nextVideo.name,
        url: nextVideo.url,
        starred: nextVideo.starred,
        trashed: nextVideo.trashed,
        createdAt: nextVideo.createdAt,
        sizeMb: nextVideo.sizeMb,
        processingStatus: nextVideo.processingStatus,
      });
    }
  }, [currentVideoIndex, allVideos]);

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
          processingStatus={processingStatus}
        />
        <Tooltip>
          <TooltipTrigger asChild>
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
                  processingStatus,
                });
                setOpen(true);
              }}
              aria-label={`Preview video ${name}`}
              className="w-full flex flex-col items-center rounded-2xl p-2 transition-transform duration-200 group-hover:-translate-y-1 cursor-pointer relative z-0"
            >
              <div
                className={cn(
                  'flex size-20 items-center justify-center overflow-hidden relative bg-muted/40 ring-1 ring-border/60 rounded-2xl',
                )}
              >
                <FileThumbnail
                  name={name}
                  thumbnailUrl={thumbnailUrl}
                  fallbackIcon={Video}
                  fallbackColorClass="text-indigo-500"
                />
                {/* Immersive Play overlay on card hover */}
                <div className="absolute inset-0 bg-black/25 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <motion.div
                    initial={{ scale: 1 }}
                    className="size-9 rounded-full bg-white/20 backdrop-blur-xs border border-white/30 flex items-center justify-center text-white"
                  >
                    <Play className="size-3.5 fill-current translate-x-0.5" />
                  </motion.div>
                </div>
              </div>
              <p className="text-xs text-foreground text-center w-20 truncate mt-1.5 px-0.5">
                {name}
              </p>
            </button>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="text-xs max-w-64 break-all">
            {name}
          </TooltipContent>
        </Tooltip>
      </div>

      <VideoPreview
        open={open}
        onClose={() => {
          setOpen(false);
          setActiveFile(null);
        }}
        fileName={activeFile?.name ?? name}
        fileUrl={activeFile?.url ?? url}
        fileId={activeFile?.id ?? fileId}
        onPrev={allVideos && currentVideoIndex > 0 ? handlePrev : undefined}
        onNext={
          allVideos && currentVideoIndex < allVideos.length - 1
            ? handleNext
            : undefined
        }
      />
    </>
  );
};

export default VideoFilePreview;
