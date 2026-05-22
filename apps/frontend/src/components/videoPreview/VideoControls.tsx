import {
  Play,
  Pause,
  RotateCcw,
  RotateCw,
  Settings,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';

interface VideoControlsProps {
  showControls: boolean;
  currentTime: number;
  duration: number;
  bufferedTime: number;
  isPlaying: boolean;
  skipAmount: number;
  showSkipConfig: boolean;
  volume: number;
  isMuted: boolean;
  isFullscreen: boolean;
  isRotated: boolean;
  togglePlay: () => void;
  handleSkipForward: () => void;
  handleSkipBackward: () => void;
  setSkipAmount: (amount: number) => void;
  setShowSkipConfig: (show: boolean) => void;
  toggleMute: () => void;
  handleVolumeChange: (volume: number) => void;
  handleScrubberChange: (time: number) => void;
  formatTime: (time: number) => string;
  toggleFullscreen: () => void;
  toggleRotation: () => void;
}

export function VideoControls({
  showControls,
  currentTime,
  duration,
  bufferedTime,
  isPlaying,
  skipAmount,
  showSkipConfig,
  volume,
  isMuted,
  isFullscreen,
  isRotated,
  togglePlay,
  handleSkipForward,
  handleSkipBackward,
  setSkipAmount,
  setShowSkipConfig,
  toggleMute,
  handleVolumeChange,
  handleScrubberChange,
  formatTime,
  toggleFullscreen,
  toggleRotation,
}: VideoControlsProps) {
  const watchedPct = (currentTime / (duration || 1)) * 100;
  const bufferedPct = (bufferedTime / (duration || 1)) * 100;

  return (
    <motion.div
      animate={{ y: showControls ? 0 : 150 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="absolute bottom-0 left-0 right-0 z-110 flex flex-col gap-3 p-4 md:p-6 bg-linear-to-t from-black via-black/80 to-transparent "
      onClick={(e) => e.stopPropagation()}
    >
      {/* Progressive Timeline Scrubber with Dynamic Buffer Track */}
      <div className="flex items-center gap-3 w-full">
        <span className="text-[11px] font-semibold text-white/70 min-w-10 font-mono select-none">
          {formatTime(currentTime)}
        </span>

        <input
          type="range"
          min="0"
          max={duration || 100}
          value={currentTime}
          onChange={(e) => handleScrubberChange(Number(e.target.value))}
          className="flex-1 h-1.5 rounded-lg appearance-none cursor-pointer focus:outline-none transition-all
            bg-white/10 hover:bg-white/20
            [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:size-3.5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:hover:scale-125 [&::-webkit-slider-thumb]:transition-transform
            [&::-moz-range-thumb]:size-3.5 [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-primary [&::-moz-range-thumb]:shadow-md [&::-moz-range-thumb]:hover:scale-125 [&::-moz-range-thumb]:transition-transform"
          style={{
            background: `linear-gradient(to right, 
              var(--primary) 0%, 
              var(--primary) ${watchedPct}%, 
              rgba(255, 255, 255, 0.4) ${watchedPct}%, 
              rgba(255, 255, 255, 0.4) ${Math.max(watchedPct, bufferedPct)}%, 
              rgba(255, 255, 255, 0.15) ${Math.max(watchedPct, bufferedPct)}%, 
              rgba(255, 255, 255, 0.15) 100%
            )`,
          }}
        />

        <span className="text-[11px] font-semibold text-white/70 min-w-10 font-mono select-none text-right">
          {formatTime(duration)}
        </span>
      </div>

      {/* Interactive Controls Buttons Bar */}
      <div className="flex items-center justify-between gap-4 mt-1">
        {/* Play/Pause & skipping controls */}
        <div className="flex items-center gap-1.5 md:gap-3">
          <motion.button
            type="button"
            onClick={togglePlay}
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            className="size-10 md:size-11 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 text-white flex items-center justify-center cursor-pointer shadow-lg transition-colors"
            title={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? (
              <Pause className="size-5 fill-current" />
            ) : (
              <Play className="size-5 fill-current " />
            )}
          </motion.button>

          <motion.button
            type="button"
            onClick={handleSkipBackward}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="size-9 md:size-10 rounded-xl bg-white/5 hover:bg-white/15 border border-white/5 text-white/80 hover:text-white flex items-center justify-center cursor-pointer"
            title={`Skip Backward ${skipAmount}s`}
          >
            <RotateCcw className="size-4.5" />
          </motion.button>

          <span className="text-xs font-semibold text-white/50 select-none">
            {skipAmount}s
          </span>

          <motion.button
            type="button"
            onClick={handleSkipForward}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="size-9 md:size-10 rounded-xl bg-white/5 hover:bg-white/15 border border-white/5 text-white/80 hover:text-white flex items-center justify-center cursor-pointer"
            title={`Skip Forward ${skipAmount}s`}
          >
            <RotateCw className="size-4.5" />
          </motion.button>

          {/* Customizable Jump Options Panel Settings Dropdown */}
          <div className="relative">
            <motion.button
              type="button"
              onClick={() => setShowSkipConfig(!showSkipConfig)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={cn(
                'size-9 md:size-10 rounded-xl flex items-center justify-center border transition-all cursor-pointer',
                showSkipConfig
                  ? 'bg-white/20 border-white/20 text-white'
                  : 'bg-white/5 border-white/5 text-white/60 hover:text-white hover:bg-white/15',
              )}
              title="Configure skip interval"
            >
              <Settings className="size-4.5" />
            </motion.button>

            <AnimatePresence>
              {showSkipConfig && (
                <motion.div
                  initial={{ opacity: 0, y: 15, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 15, scale: 0.95 }}
                  className="absolute bottom-12 left-0 z-120 bg-black/95 border border-white/10 backdrop-blur-md rounded-xl p-3 shadow-2xl flex flex-col gap-3.5 min-w-48 select-none"
                >
                  <div className="flex flex-col gap-1.5">
                    <span className="text-[10px] font-bold tracking-wider text-white/40 uppercase">
                      Skip Duration
                    </span>
                    <div className="flex bg-white/5 p-0.5 rounded-lg gap-1 text-[11px] font-semibold">
                      {[5, 10, 15, 30].map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => {
                            setSkipAmount(s);
                            setShowSkipConfig(false);
                          }}
                          className={cn(
                            'flex-1 py-1 rounded transition-colors cursor-pointer',
                            skipAmount === s
                              ? 'bg-white/15 text-white'
                              : 'text-white/60 hover:text-white hover:bg-white/5',
                          )}
                        >
                          {s}s
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="h-px bg-white/10 w-full" />

                  <div className="flex flex-col gap-1.5">
                    <span className="text-[10px] font-bold tracking-wider text-white/40 uppercase">
                      Screen Options
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        toggleFullscreen();
                        setShowSkipConfig(false);
                      }}
                      className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold text-white/80 hover:text-white bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
                    >
                      <span className="flex items-center gap-2">
                        {isFullscreen ? (
                          <Minimize className="size-3.5" />
                        ) : (
                          <Maximize className="size-3.5" />
                        )}
                        {isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
                      </span>
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Volume, Rotation & Fullscreen controls */}
        <div className="flex items-center gap-2 max-w-[45%] md:max-w-none">
          {/* Volume Mute Toggle */}
          <motion.button
            type="button"
            onClick={toggleMute}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="size-9 md:size-10 rounded-xl bg-white/5 hover:bg-white/15 border border-white/5 text-white/80 hover:text-white flex items-center justify-center cursor-pointer shrink-0"
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted || volume === 0 ? (
              <VolumeX className="size-4.5" />
            ) : (
              <Volume2 className="size-4.5" />
            )}
          </motion.button>

          {/* Volume Slider Bar */}
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={isMuted ? 0 : volume}
            onChange={(e) => handleVolumeChange(Number(e.target.value))}
            className="w-16 sm:w-24 h-1 rounded-lg appearance-none cursor-pointer focus:outline-none transition-all
              bg-white/20 hover:bg-white/35
              [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:size-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:hover:scale-125 [&::-webkit-slider-thumb]:transition-transform
              [&::-moz-range-thumb]:size-3 [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-white [&::-moz-range-thumb]:shadow-md [&::-moz-range-thumb]:hover:scale-125 [&::-moz-range-thumb]:transition-transform"
            style={{
              background: `linear-gradient(to right, #fff 0%, #fff ${(isMuted ? 0 : volume) * 100}%, rgba(255, 255, 255, 0.2) ${(isMuted ? 0 : volume) * 100}%, rgba(255, 255, 255, 0.2) 100%)`,
            }}
          />

          {/* Manual Rotate Button */}
          <motion.button
            type="button"
            onClick={toggleRotation}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={cn(
              'hidden size-9 md:size-10 rounded-xl md:flex items-center justify-center cursor-pointer border transition-all shrink-0',
              isRotated
                ? 'bg-primary/20 border-primary/30 text-primary'
                : 'bg-white/5 border-white/5 text-white/85 hover:bg-white/15 hover:text-white',
            )}
            title="Rotate Video 90°"
          >
            <RotateCw
              className={cn(
                'size-4.5 transition-transform duration-300',
                isRotated && 'rotate-90',
              )}
            />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
