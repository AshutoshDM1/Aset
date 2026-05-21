import { useState, useRef, useEffect } from 'react';

interface UseVideoPlayerProps {
  open: boolean;
  onClose: () => void;
  videoRef: React.RefObject<HTMLVideoElement | null>;
}

export function useVideoPlayer({
  open,
  onClose,
  videoRef,
}: UseVideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1); // 0 to 1
  const [isMuted, setIsMuted] = useState(false);
  const [skipAmount, setSkipAmount] = useState(10); // Customizable skip duration
  const [showSkipConfig, setShowSkipConfig] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [bufferedTime, setBufferedTime] = useState(0);
  const [isBuffering, setIsBuffering] = useState(false);

  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const resetControlsTimer = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) {
        setShowControls(false);
        setShowSkipConfig(false);
      }
    }, 3000);
  };

  useEffect(() => {
    if (open) {
      resetControlsTimer();
    }
    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, [open, isPlaying]);

  // Handle Play/Pause
  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current
        .play()
        .then(() => {
          setIsPlaying(true);
        })
        .catch((err) => {
          console.error('Play failed:', err);
        });
    }
    resetControlsTimer();
  };

  // Skip handlers
  const handleSkipForward = () => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = Math.min(
      videoRef.current.currentTime + skipAmount,
      duration,
    );
    resetControlsTimer();
  };

  const handleSkipBackward = () => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = Math.max(
      videoRef.current.currentTime - skipAmount,
      0,
    );
    resetControlsTimer();
  };

  // Sound handlers
  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume);
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
      if (newVolume > 0 && isMuted) {
        setIsMuted(false);
        videoRef.current.muted = false;
      }
    }
    resetControlsTimer();
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    videoRef.current.muted = nextMuted;
    resetControlsTimer();
  };

  // Update progress and buffering
  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const current = videoRef.current.currentTime;
    setCurrentTime(current);
    updateBufferedProgress(current);
  };

  const handleProgress = () => {
    if (!videoRef.current) return;
    updateBufferedProgress(videoRef.current.currentTime);
  };

  const updateBufferedProgress = (current: number) => {
    if (!videoRef.current) return;
    const buffered = videoRef.current.buffered;
    if (buffered.length > 0) {
      for (let i = 0; i < buffered.length; i++) {
        if (current >= buffered.start(i) && current <= buffered.end(i)) {
          setBufferedTime(buffered.end(i));
          break;
        }
      }
    }
  };

  const handleWaiting = () => {
    setIsBuffering(true);
  };

  const handlePlaying = () => {
    setIsBuffering(false);
  };

  const handleSeeked = () => {
    setIsBuffering(false);
  };

  const handleLoadedMetadata = () => {
    if (!videoRef.current) return;
    setDuration(videoRef.current.duration);
    updateBufferedProgress(videoRef.current.currentTime);
  };

  const handleScrubberChange = (val: number) => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = val;
    setCurrentTime(val);
    resetControlsTimer();
  };

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!open) return;

      // Ignore if user typing in input (e.g. custom skip input)
      if (
        document.activeElement?.tagName === 'INPUT' &&
        document.activeElement !== videoRef.current
      ) {
        if (e.key === 'Escape') {
          onClose();
        }
        return;
      }

      resetControlsTimer();

      switch (e.key.toLowerCase()) {
        case ' ':
          e.preventDefault();
          togglePlay();
          break;
        case 'escape':
          e.preventDefault();
          onClose();
          break;
        case 'arrowleft':
          e.preventDefault();
          handleSkipBackward();
          break;
        case 'arrowright':
          e.preventDefault();
          handleSkipForward();
          break;
        case 'arrowup':
          e.preventDefault();
          handleVolumeChange(Math.min(volume + 0.05, 1));
          break;
        case 'arrowdown':
          e.preventDefault();
          handleVolumeChange(Math.max(volume - 0.05, 0));
          break;
        case 'm':
          e.preventDefault();
          toggleMute();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [open, isPlaying, volume, isMuted, skipAmount, duration]);

  return {
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
  };
}
