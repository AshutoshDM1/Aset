import { useState } from 'react';
import { Video, Play } from 'lucide-react';
import { VideoPreview } from '@/components/videoPreview';
import { ItemGridActions } from './ItemGridActions';
import { motion } from 'motion/react';

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
}: VideoFilePreviewProps) => {
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
          processingStatus={processingStatus}
        />
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label={`Preview video ${name}`}
          title={name}
          className="flex flex-col items-center rounded-2xl p-2 transition-transform duration-200 group-hover:-translate-y-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer"
        >
          <div className="flex size-20 items-center justify-center overflow-hidden rounded-2xl bg-muted/40 ring-1 ring-border/60 relative">
            {url && !thumbnailErrored ? (
              <>
                <video
                  src={`${url}#t=0.1`}
                  preload="metadata"
                  muted
                  playsInline
                  className="size-full object-cover opacity-80 group-hover:opacity-100 transition-opacity pointer-events-none"
                  onError={() => setThumbnailErrored(true)}
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
              </>
            ) : (
              <Video className="size-8 text-indigo-500" aria-hidden />
            )}
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

      <VideoPreview
        open={open}
        onClose={() => setOpen(false)}
        fileName={name}
        fileUrl={url}
        fileId={fileId}
      />
    </>
  );
};

export default VideoFilePreview;
