import * as React from 'react';
import { cn } from '@/lib/utils';
import {
  PdfFileIcon,
  ImageFileIcon,
  VideoFileIcon,
  CodeFileIcon,
  ZipFileIcon,
  AudioFileIcon,
  DefaultFileIcon,
} from '@/shared/Icons/Icons';

type FileThumbnailProps = {
  name: string;
  thumbnailUrl?: string | null;
  fallbackIcon: React.ComponentType<{ className?: string }>;
  fallbackColorClass?: string;
  className?: string;
};

export default function FileThumbnail({
  name,
  thumbnailUrl,
  fallbackIcon: FallbackIcon,
  fallbackColorClass = 'text-muted-foreground',
  className,
}: FileThumbnailProps) {
  const [errored, setErrored] = React.useState(false);
  const dot = name.lastIndexOf('.');
  const ext = dot > 0 ? name.slice(dot + 1).toUpperCase() : '';

  if (thumbnailUrl && !errored) {
    return (
      <img
        src={thumbnailUrl}
        alt=""
        loading="lazy"
        className={cn(
          'size-full object-cover select-none pointer-events-none',
          className,
        )}
        onError={() => setErrored(true)}
      />
    );
  }

  // Fallback when thumbnail isn't available: render initials inside a premium color-matched badge
  if (!ext || ext.length > 4) {
    return (
      <FallbackIcon className={cn('size-8', fallbackColorClass, className)} />
    );
  }

  if (['PDF'].includes(ext)) {
    return <PdfFileIcon className={className} label={ext} />;
  }

  if (['MP4', 'MKV', 'MOV', 'WEBM'].includes(ext)) {
    return <VideoFileIcon className={className} label={ext} />;
  }

  if (['PNG', 'JPG', 'JPEG', 'WEBP', 'GIF'].includes(ext)) {
    return <ImageFileIcon className={className} label={ext} />;
  }

  if (['TXT', 'MD', 'JSON', 'JS', 'TS', 'TSX', 'CSS', 'HTML'].includes(ext)) {
    return <CodeFileIcon className={className} label={ext} />;
  }

  if (['ZIP', 'RAR', '7Z', 'TAR', 'GZ'].includes(ext)) {
    return <ZipFileIcon className={className} label={ext} />;
  }

  if (['MP3', 'WAV', 'FLAC', 'OGG', 'M4A'].includes(ext)) {
    return <AudioFileIcon className={className} label={ext} />;
  }

  return <DefaultFileIcon className={className} label={ext} />;
}
