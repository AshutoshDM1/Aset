import { Play, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useRef, useState, useEffect } from 'react';

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
  audioRef?: React.RefObject<HTMLAudioElement | null>;
  audioTracks?: Array<{
    id: string;
    label: string;
    language: string;
    url: string;
  }>;
  selectedAudioTrackId?: string;
  subtitles?: Array<{
    id: string;
    label: string;
    language: string;
    url: string;
  }>;
  selectedTextTrackId?: string;
  // Double-tap seek handlers & parameters
  handleSkipForward: () => void;
  handleSkipBackward: () => void;
  resetControlsTimer: () => void;
  skipAmount: number;
}

const chevronVariantsRight = {
  initial: { opacity: 0.2, x: 0 },
  animate: (i: number) => ({
    opacity: [0.2, 1, 0.2],
    x: [0, 4, 0],
    transition: {
      repeat: Infinity,
      duration: 0.6,
      delay: i * 0.1,
    },
  }),
};

const chevronVariantsLeft = {
  initial: { opacity: 0.2, x: 0 },
  animate: (i: number) => ({
    opacity: [0.2, 1, 0.2],
    x: [0, -4, 0],
    transition: {
      repeat: Infinity,
      duration: 0.6,
      delay: (2 - i) * 0.1,
    },
  }),
};

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
  audioRef,
  audioTracks = [],
  selectedAudioTrackId = 'native',
  subtitles = [],
  selectedTextTrackId = 'none',
  handleSkipForward,
  handleSkipBackward,
  resetControlsTimer,
  skipAmount,
}: VideoViewportProps) {
  const selectedAudioTrack = audioTracks.find(
    (a) => a.id === selectedAudioTrackId,
  );
  const audioSrc = selectedAudioTrack ? selectedAudioTrack.url : '';
  const selectedSubtitleTrack = subtitles.find(
    (s) => s.id === selectedTextTrackId,
  );

  // Gesture seeking states
  const [activeRipple, setActiveRipple] = useState<'left' | 'right' | null>(
    null,
  );
  const [clickCount, setClickCount] = useState(0);

  const lastClickRef = useRef<{ time: number; type: 'left' | 'right' | null }>({
    time: 0,
    type: null,
  });
  const singleClickTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const rippleTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleSideClick = (side: 'left' | 'right') => {
    if (isLocked) return;

    resetControlsTimer();

    const now = Date.now();
    const isDoubleTap =
      lastClickRef.current.type === side &&
      now - lastClickRef.current.time < 300;

    if (isDoubleTap) {
      // Clear single tap timer so we don't trigger play/pause
      if (singleClickTimeoutRef.current) {
        clearTimeout(singleClickTimeoutRef.current);
        singleClickTimeoutRef.current = null;
      }

      // Seek video
      if (side === 'left') {
        handleSkipBackward();
      } else {
        handleSkipForward();
      }

      // Trigger ripple feedback
      setActiveRipple(side);
      setClickCount((prev) => prev + 1);

      if (rippleTimeoutRef.current) {
        clearTimeout(rippleTimeoutRef.current);
      }
      rippleTimeoutRef.current = setTimeout(() => {
        setActiveRipple(null);
        setClickCount(0);
      }, 700);

      lastClickRef.current = { time: now, type: side };
    } else {
      lastClickRef.current = { time: now, type: side };

      if (singleClickTimeoutRef.current) {
        clearTimeout(singleClickTimeoutRef.current);
      }
      singleClickTimeoutRef.current = setTimeout(() => {
        togglePlay();
        singleClickTimeoutRef.current = null;
      }, 250); // 250ms delay to distinguish double-taps
    }
  };

  // Cleanup timers on component unmount
  useEffect(() => {
    return () => {
      if (singleClickTimeoutRef.current)
        clearTimeout(singleClickTimeoutRef.current);
      if (rippleTimeoutRef.current) clearTimeout(rippleTimeoutRef.current);
    };
  }, []);

  return (
    <div className="flex-1 flex items-center justify-center relative cursor-pointer overflow-hidden w-full h-full select-none">
      <video
        ref={videoRef}
        src={fileUrl}
        crossOrigin="anonymous"
        onTimeUpdate={handleTimeUpdate}
        onProgress={handleProgress}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={() => setIsPlaying(false)}
        onWaiting={handleWaiting}
        onPlaying={handlePlaying}
        onSeeked={handleSeeked}
        onCanPlay={handlePlaying}
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
      >
        {selectedSubtitleTrack && (
          <track
            key={selectedSubtitleTrack.id}
            src={selectedSubtitleTrack.url}
            kind="subtitles"
            srcLang={selectedSubtitleTrack.language}
            label={selectedSubtitleTrack.label}
            default
          />
        )}
      </video>

      {/* Invisible Double Tap Seek Hotspots */}
      {!isLocked && (
        <div className="absolute inset-0 flex z-30 pointer-events-none">
          {/* Left Hotspot */}
          <div
            onClick={(e) => {
              e.stopPropagation();
              handleSideClick('left');
            }}
            className="w-1/2 h-full pointer-events-auto select-none cursor-pointer"
          />
          {/* Right Hotspot */}
          <div
            onClick={(e) => {
              e.stopPropagation();
              handleSideClick('right');
            }}
            className="w-1/2 h-full pointer-events-auto select-none cursor-pointer"
          />
        </div>
      )}

      {/* Left Double-Tap Seek Visual Indicator */}
      <AnimatePresence>
        {activeRipple === 'left' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.7 }}
            transition={{ duration: 0.2 }}
            className="absolute left-1/4 top-1/2 -translate-y-1/2 -translate-x-1/2 z-40 flex flex-col items-center justify-center size-24 rounded-full bg-black/60 backdrop-blur-xs border border-white/10 pointer-events-none select-none"
          >
            <div className="flex items-center gap-0.5 text-white">
              {[0, 1, 2].map((i) => (
                <motion.span
                  key={i}
                  custom={i}
                  variants={chevronVariantsLeft}
                  initial="initial"
                  animate="animate"
                >
                  <ChevronLeft className="size-5 fill-current" />
                </motion.span>
              ))}
            </div>
            <span className="text-xs font-bold text-white/90 mt-1">
              -{clickCount * skipAmount}s
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Right Double-Tap Seek Visual Indicator */}
      <AnimatePresence>
        {activeRipple === 'right' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.7 }}
            transition={{ duration: 0.2 }}
            className="absolute right-1/4 top-1/2 -translate-y-1/2 translate-x-1/2 z-40 flex flex-col items-center justify-center size-24 rounded-full bg-black/60 backdrop-blur-xs border border-white/10 pointer-events-none select-none"
          >
            <div className="flex items-center gap-0.5 text-white">
              {[0, 1, 2].map((i) => (
                <motion.span
                  key={i}
                  custom={i}
                  variants={chevronVariantsRight}
                  initial="initial"
                  animate="animate"
                >
                  <ChevronRight className="size-5 fill-current" />
                </motion.span>
              ))}
            </div>
            <span className="text-xs font-bold text-white/90 mt-1">
              +{clickCount * skipAmount}s
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Synchronized secondary audio track player */}
      {selectedAudioTrackId !== 'native' && (
        <audio
          ref={audioRef}
          src={audioSrc}
          style={{ display: 'none' }}
          preload="auto"
        />
      )}

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
              className="absolute size-16 rounded-full bg-white/10 border border-white/20 backdrop-blur-md flex items-center justify-center text-white/90 hover:text-white hover:scale-105 active:scale-95 transition-all shadow-2xl cursor-pointer z-10"
            >
              <Play className="size-8 fill-current translate-x-0.5" />
            </motion.div>
          )
        )}
      </AnimatePresence>
    </div>
  );
}
