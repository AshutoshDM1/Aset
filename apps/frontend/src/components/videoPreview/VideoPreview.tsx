import { useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useFileDownload } from '@/hooks/useFileDownload';
import { toast } from 'sonner';

import { useVideoPlayer } from './useVideoPlayer';
import { VideoHeader } from './VideoHeader';
import { VideoViewport } from './VideoViewport';
import { VideoControls } from './VideoControls';

interface VideoPreviewProps {
  open: boolean;
  onClose: () => void;
  fileName: string;
  fileUrl: string;
  fileId?: string;
}

export function VideoPreview({
  open,
  onClose,
  fileName,
  fileUrl,
  fileId,
}: VideoPreviewProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const { download, isDownloading } = useFileDownload();

  const {
    isPlaying,
    setIsPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
    skipAmount,
    setSkipAmount,
    showSkipConfig,
    setShowSkipConfig,
    showControls,
    bufferedTime,
    isBuffering,
    handleWaiting,
    handlePlaying,
    handleSeeked,
    togglePlay,
    handleSkipForward,
    handleSkipBackward,
    handleVolumeChange,
    toggleMute,
    handleTimeUpdate,
    handleProgress,
    handleLoadedMetadata,
    handleScrubberChange,
    resetControlsTimer,
  } = useVideoPlayer({ open, onClose, videoRef });

  const handleDownload = () => {
    if (fileId) {
      download(fileId, fileName, fileUrl);
    } else {
      toast.error('Please provide a fileId for download');
    }
  };

  const formatTime = (timeInSecs: number) => {
    if (isNaN(timeInSecs)) return '00:00';
    const mins = Math.floor(timeInSecs / 60);
    const secs = Math.floor(timeInSecs % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-100 flex flex-col justify-between bg-black text-white select-none overflow-hidden"
        onMouseMove={resetControlsTimer}
        onClick={resetControlsTimer}
      >
        <VideoHeader
          fileName={fileName}
          isDownloading={isDownloading}
          showControls={showControls}
          handleDownload={handleDownload}
          onClose={onClose}
        />

        <VideoViewport
          videoRef={videoRef}
          fileUrl={fileUrl}
          isPlaying={isPlaying}
          isBuffering={isBuffering}
          handleWaiting={handleWaiting}
          handlePlaying={handlePlaying}
          handleSeeked={handleSeeked}
          togglePlay={togglePlay}
          handleTimeUpdate={handleTimeUpdate}
          handleProgress={handleProgress}
          handleLoadedMetadata={handleLoadedMetadata}
          setIsPlaying={setIsPlaying}
        />

        <VideoControls
          showControls={showControls}
          currentTime={currentTime}
          duration={duration}
          bufferedTime={bufferedTime}
          isPlaying={isPlaying}
          skipAmount={skipAmount}
          showSkipConfig={showSkipConfig}
          volume={volume}
          isMuted={isMuted}
          togglePlay={togglePlay}
          handleSkipForward={handleSkipForward}
          handleSkipBackward={handleSkipBackward}
          setSkipAmount={setSkipAmount}
          setShowSkipConfig={setShowSkipConfig}
          toggleMute={toggleMute}
          handleVolumeChange={handleVolumeChange}
          handleScrubberChange={handleScrubberChange}
          formatTime={formatTime}
        />
      </motion.div>
    </AnimatePresence>
  );
}
