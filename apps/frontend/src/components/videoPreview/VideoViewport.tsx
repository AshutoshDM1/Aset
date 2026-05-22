import { Play } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface VideoViewportProps {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  fileUrl: string;
  isPlaying: boolean;
  isBuffering: boolean;
  isLocked: boolean;
  isRotated: boolean;
  handleWaiting: () => void;
  handlePlaying: () => void;
  handleSeeked: () => void;
  togglePlay: () => void;
  handleTimeUpdate: () => void;
  handleProgress: () => void;
  handleLoadedMetadata: () => void;
  setIsPlaying: (playing: boolean) => void;
}

export function VideoViewport({
  videoRef,
  fileUrl,
  isPlaying,
  isBuffering,
  isLocked,
  isRotated,
  handleWaiting,
  handlePlaying,
  handleSeeked,
  togglePlay,
  handleTimeUpdate,
  handleProgress,
  handleLoadedMetadata,
  setIsPlaying,
}: VideoViewportProps) {
  return (
    <div className="flex-1 flex items-center justify-center relative cursor-pointer overflow-hidden w-full h-full">
      <video
        ref={videoRef}
        src={fileUrl}
        onTimeUpdate={handleTimeUpdate}
        onProgress={handleProgress}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={() => setIsPlaying(false)}
        onWaiting={handleWaiting}
        onPlaying={handlePlaying}
        onSeeked={handleSeeked}
        onCanPlay={handlePlaying}
        onClick={isLocked ? undefined : togglePlay}
        className="max-h-screen max-w-full object-contain pointer-events-auto transition-all duration-300 ease-out"
        style={
          isRotated
            ? {
                transform: 'rotate(90deg)',
                width: '100vh',
                height: '100vw',
                maxWidth: 'none',
                maxHeight: 'none',
                objectFit: 'contain',
              }
            : {}
        }
        playsInline
        preload="auto"
      />

      {/* Big Play Pause Central Animation Indicator or buffering spinner */}
      <AnimatePresence mode="wait">
        {isBuffering ? (
          <motion.div
            key="buffering"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="absolute flex items-center justify-center size-16 rounded-full bg-black/40 border border-white/10 backdrop-blur-md text-white shadow-2xl pointer-events-none z-10"
          >
            <div className="size-7 rounded-full border-3 border-white/20 border-t-primary animate-spin" />
          </motion.div>
        ) : (
          !isPlaying &&
          !isLocked && (
            <motion.div
              key="play"
              whileTap={{ scale: 0.9 }}
              whileHover={{ scale: 1.1 }}
              transition={{ ease: 'linear', duration: 0.2 }}
              onClick={togglePlay}
              className="absolute size-16 rounded-full bg-white/10 border border-white/20 backdrop-blur-md flex items-center justify-center text-white/90 hover:text-white hover:scale-105 active:scale-95 transition-all shadow-2xl cursor-pointer"
            >
              <Play className="size-8 fill-current translate-x-0.5" />
            </motion.div>
          )
        )}
      </AnimatePresence>
    </div>
  );
}
