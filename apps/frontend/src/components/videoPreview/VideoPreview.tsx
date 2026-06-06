import { useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useFileDownload } from '@/hooks/useFileDownload';
import { toast } from 'sonner';
import { Lock, Unlock } from 'lucide-react';
import { trpc } from '@/utils/trpc';
import { useQuery } from '@tanstack/react-query';

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
  const containerRef = useRef<HTMLDivElement | null>(null);
  const { download, isDownloading } = useFileDownload();

  const { data: mediaTracks, isLoading: isTracksLoading } = useQuery(
    trpc.file.getMediaTracks.queryOptions(
      { fileId: fileId || '' },
      { enabled: !!fileId && open },
    ),
  );

  const subtitles = mediaTracks?.subtitles || [];
  const audioTracks = mediaTracks?.audioTracks || [];

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
    resetControlsTimer,
    handleScrubberChange,
    // lock, fullscreen, and rotation features
    isLocked,
    setIsLocked,
    isFullscreen,
    toggleFullscreen,
    isRotated,
    toggleRotation,
    // Synced tracks control
    audioRef,
    selectedAudioTrackId,
    selectAudioTrack,
    selectedTextTrackId,
    selectTextTrack,
  } = useVideoPlayer({ open, onClose, videoRef, containerRef, subtitles });

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
        ref={containerRef}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-100 flex flex-col justify-between bg-black text-white select-none overflow-hidden"
        onMouseMove={resetControlsTimer}
        onClick={resetControlsTimer}
      >
        {/* Header - only visible when unlocked and controls are showing */}
        <AnimatePresence>
          {!isLocked && showControls && (
            <VideoHeader
              fileName={fileName}
              isDownloading={isDownloading}
              showControls={showControls}
              handleDownload={handleDownload}
              onClose={onClose}
            />
          )}
        </AnimatePresence>

        {/* Viewport for the video */}
        <VideoViewport
          videoRef={videoRef}
          fileUrl={fileUrl}
          isPlaying={isPlaying}
          isBuffering={isBuffering}
          isLocked={isLocked}
          isRotated={isRotated}
          handleWaiting={handleWaiting}
          handlePlaying={handlePlaying}
          handleSeeked={handleSeeked}
          togglePlay={togglePlay}
          handleTimeUpdate={handleTimeUpdate}
          handleProgress={handleProgress}
          handleLoadedMetadata={handleLoadedMetadata}
          setIsPlaying={setIsPlaying}
          audioRef={audioRef}
          audioTracks={audioTracks}
          selectedAudioTrackId={selectedAudioTrackId}
          subtitles={subtitles}
          selectedTextTrackId={selectedTextTrackId}
          handleSkipForward={handleSkipForward}
          handleSkipBackward={handleSkipBackward}
          resetControlsTimer={resetControlsTimer}
          skipAmount={skipAmount}
        />

        {/* Floating Lock/Unlock Button - accessible whenever controls show, or always when locked */}
        <AnimatePresence>
          {(showControls || isLocked) && (
            <motion.button
              type="button"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => {
                e.stopPropagation();
                setIsLocked(!isLocked);
                resetControlsTimer();
              }}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-130 size-10 md:size-11 rounded-full bg-black/60 hover:bg-black/80 border border-white/10 text-white flex items-center justify-center cursor-pointer shadow-2xl backdrop-blur-md transition-colors"
              title={isLocked ? 'Unlock Screen' : 'Lock Screen'}
            >
              {isLocked ? (
                <Lock className="size-5 text-primary opacity-40" />
              ) : (
                <Unlock className="size-5 text-white/80" />
              )}
            </motion.button>
          )}
        </AnimatePresence>

        {/* Controls - only visible when unlocked and controls are showing */}
        <AnimatePresence>
          {!isLocked && showControls && (
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
              isFullscreen={isFullscreen}
              isRotated={isRotated}
              togglePlay={togglePlay}
              handleSkipForward={handleSkipForward}
              handleSkipBackward={handleSkipBackward}
              setSkipAmount={setSkipAmount}
              setShowSkipConfig={setShowSkipConfig}
              toggleMute={toggleMute}
              handleVolumeChange={handleVolumeChange}
              handleScrubberChange={handleScrubberChange}
              formatTime={formatTime}
              toggleFullscreen={toggleFullscreen}
              toggleRotation={toggleRotation}
              subtitles={subtitles}
              audioTracks={audioTracks}
              selectedAudioTrackId={selectedAudioTrackId}
              selectAudioTrack={selectAudioTrack}
              selectedTextTrackId={selectedTextTrackId}
              selectTextTrack={selectTextTrack}
              isTracksLoading={isTracksLoading}
            />
          )}
        </AnimatePresence>
      </motion.div>
    </AnimatePresence>
  );
}
