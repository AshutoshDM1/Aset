import { useState, useRef, useEffect } from 'react';

interface UseVideoPlayerProps {
  open: boolean;
  onClose: () => void;
  videoRef: React.RefObject<HTMLVideoElement | null>;
  containerRef: React.RefObject<HTMLDivElement | null>;
  subtitles?: Array<{
    id: string;
    label: string;
    language: string;
    url: string;
  }>;
  fileId?: string;
}

export function useVideoPlayer({
  open,
  onClose,
  videoRef,
  containerRef,
  subtitles = [],
  fileId,
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

  // New lock, fullscreen, and rotation states
  const [isLocked, setIsLocked] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isRotated, setIsRotated] = useState(false);

  // Ref for external synchronized audio element
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const lastSaveTimestampRef = useRef<number>(Date.now());
  const restoredFileIdRef = useRef<string | null>(null);
  const lastKnownTimeRef = useRef<number>(0);
  const activeFileIdRef = useRef<string | null>(null);

  // Synchronous flush of previous file progress during render phase before DOM resets currentTime
  if (fileId && activeFileIdRef.current !== fileId) {
    if (
      activeFileIdRef.current &&
      lastKnownTimeRef.current > 0 &&
      restoredFileIdRef.current === activeFileIdRef.current
    ) {
      const data = {
        time: lastKnownTimeRef.current,
        updatedAt: Date.now(),
      };
      localStorage.setItem(
        `aset-video-time-${activeFileIdRef.current}`,
        JSON.stringify(data),
      );
    }
    activeFileIdRef.current = fileId;
    lastKnownTimeRef.current = 0;
    restoredFileIdRef.current = null; // Instantly invalidate restoration for the new file during render
  }

  // Subtitle and Audio tracks selection states
  const [selectedTextTrackId, setSelectedTextTrackId] =
    useState<string>('none');
  const [selectedAudioTrackId, setSelectedAudioTrackId] =
    useState<string>('native');

  const saveCurrentTime = () => {
    if (fileId && videoRef.current && restoredFileIdRef.current === fileId) {
      const data = {
        time: videoRef.current.currentTime,
        updatedAt: Date.now(),
      };
      localStorage.setItem(`aset-video-time-${fileId}`, JSON.stringify(data));
      lastKnownTimeRef.current = videoRef.current.currentTime;
    }
  };

  // Save on unmount or fileId change
  useEffect(() => {
    return () => {
      saveCurrentTime();
    };
  }, [fileId, open]);

  // Reset player states, initialize timestamp, and clean up history when opened/closed
  useEffect(() => {
    if (open) {
      lastSaveTimestampRef.current = Date.now();

      // Automatic cleanup: remove video progress records older than 15 days
      try {
        const keysToRemove: string[] = [];
        const fifteenDaysAgo = Date.now() - 15 * 24 * 60 * 60 * 1000;

        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.startsWith('aset-video-time-')) {
            const val = localStorage.getItem(key);
            if (val) {
              try {
                const data = JSON.parse(val);
                if (data && typeof data === 'object' && data.updatedAt) {
                  if (data.updatedAt < fifteenDaysAgo) {
                    keysToRemove.push(key);
                  }
                }
              } catch {}
            }
          }
        }

        keysToRemove.forEach((key) => {
          localStorage.removeItem(key);
        });
      } catch (e) {
        console.error('Failed to cleanup video history:', e);
      }
    } else {
      saveCurrentTime();
      setIsPlaying(false);
      setCurrentTime(0);
      setDuration(0);
      setBufferedTime(0);
      setIsBuffering(false);
      setIsLocked(false);
      setIsRotated(false);
    }
  }, [open]);

  // Reset progress restoration state when fileId changes (e.g. next/prev navigation)
  useEffect(() => {
    setCurrentTime(0);
    setDuration(0);
    setBufferedTime(0);
  }, [fileId]);

  useEffect(() => {
    if (!open || !fileId || !videoRef.current) {
      if (!open) {
        restoredFileIdRef.current = null;
      }
      return;
    }

    const video = videoRef.current;

    const restoreTime = () => {
      if (restoredFileIdRef.current === fileId) return;
      const savedTimeStr = localStorage.getItem(`aset-video-time-${fileId}`);
      if (savedTimeStr) {
        let savedTime = 0;
        try {
          const data = JSON.parse(savedTimeStr);
          if (
            data &&
            typeof data === 'object' &&
            typeof data.time === 'number'
          ) {
            savedTime = data.time;
          } else {
            savedTime = parseFloat(savedTimeStr);
          }
        } catch {
          savedTime = parseFloat(savedTimeStr);
        }

        if (savedTime > 0) {
          video.currentTime = savedTime;
          setCurrentTime(savedTime);
          restoredFileIdRef.current = fileId;
        }
      } else {
        restoredFileIdRef.current = fileId;
      }
    };

    const handleReady = () => {
      if (video.duration) {
        restoreTime();
      }
    };

    const handleLoadStart = () => {
      restoredFileIdRef.current = null;
    };

    video.addEventListener('loadedmetadata', handleReady);
    video.addEventListener('loadeddata', handleReady);
    video.addEventListener('canplay', handleReady);
    video.addEventListener('loadstart', handleLoadStart);

    if (video.readyState >= 1 && video.duration) {
      restoreTime();
    }

    return () => {
      video.removeEventListener('loadedmetadata', handleReady);
      video.removeEventListener('loadeddata', handleReady);
      video.removeEventListener('canplay', handleReady);
      video.removeEventListener('loadstart', handleLoadStart);
    };
  }, [open, fileId, subtitles, videoRef]);

  const selectTextTrack = (trackId: string) => {
    setSelectedTextTrackId(trackId);
  };

  const selectAudioTrack = (trackId: string) => {
    setSelectedAudioTrackId(trackId);
    const video = videoRef.current;
    const audio = audioRef.current;
    if (!video) return;

    if (trackId === 'native') {
      video.muted = isMuted;
      if (audio) {
        audio.pause();
      }
    } else {
      video.muted = true;
      if (audio) {
        audio.currentTime = video.currentTime;
        audio.playbackRate = video.playbackRate;
        if (isPlaying) {
          audio
            .play()
            .catch((e) => console.error('[AudioSync] Play failed:', e));
        }
      }
    }
  };

  // Sync selected subtitle track mode with HTML5 TextTracks
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !open) return;

    const syncTracks = () => {
      const nativeTextTracks = video.textTracks;
      for (let i = 0; i < nativeTextTracks.length; i++) {
        const track = nativeTextTracks[i];
        const matchingDbTrack = subtitles.find(
          (s) => s.label === track.label || s.language === track.language,
        );
        if (matchingDbTrack) {
          track.mode =
            selectedTextTrackId === matchingDbTrack.id ? 'showing' : 'disabled';
        } else {
          track.mode = 'disabled';
        }
      }
    };

    // Run initial sync
    syncTracks();

    // Listen for dynamically added tracks to ensure they are synchronized as they load
    const nativeTextTracks = video.textTracks;
    nativeTextTracks.addEventListener('addtrack', syncTracks);
    nativeTextTracks.onaddtrack = syncTracks;

    return () => {
      nativeTextTracks.removeEventListener('addtrack', syncTracks);
      nativeTextTracks.onaddtrack = null;
    };
  }, [selectedTextTrackId, subtitles, open, videoRef.current]);

  // Synced playback controller: Sync play/pause
  useEffect(() => {
    const video = videoRef.current;
    const audio = audioRef.current;
    if (!video || !audio || selectedAudioTrackId === 'native') return;

    if (isPlaying) {
      audio
        .play()
        .catch((err) => console.error('[AudioSync] Play failed:', err));
    } else {
      audio.pause();
    }
  }, [isPlaying, selectedAudioTrackId]);

  // Synced playback controller: Sync mute and volume
  useEffect(() => {
    const video = videoRef.current;
    const audio = audioRef.current;
    if (!video || !audio) return;

    if (selectedAudioTrackId === 'native') {
      video.muted = isMuted;
      video.volume = volume;
    } else {
      video.muted = true;
      audio.muted = isMuted;
      audio.volume = volume;
    }
  }, [isMuted, volume, selectedAudioTrackId]);

  // Synced playback controller: Sync seeking and rate change
  useEffect(() => {
    const video = videoRef.current;
    const audio = audioRef.current;
    if (!video || !audio || selectedAudioTrackId === 'native') return;

    const handleSeeking = () => {
      audio.currentTime = video.currentTime;
    };

    const handleSeeked = () => {
      audio.currentTime = video.currentTime;
    };

    const handleRateChange = () => {
      audio.playbackRate = video.playbackRate;
    };

    video.addEventListener('seeking', handleSeeking);
    video.addEventListener('seeked', handleSeeked);
    video.addEventListener('ratechange', handleRateChange);

    // Run periodic check to correct alignment drifts
    const interval = setInterval(() => {
      if (Math.abs(video.currentTime - audio.currentTime) > 0.15) {
        audio.currentTime = video.currentTime;
      }
    }, 500);

    // Initial sync
    audio.currentTime = video.currentTime;
    audio.playbackRate = video.playbackRate;

    return () => {
      video.removeEventListener('seeking', handleSeeking);
      video.removeEventListener('seeked', handleSeeked);
      video.removeEventListener('ratechange', handleRateChange);
      clearInterval(interval);
    };
  }, [selectedAudioTrackId]);

  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const resetControlsTimer = () => {
    if (isLocked) {
      setShowControls(false);
      return;
    }
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

  // Sync fullscreen change event
  useEffect(() => {
    const handleFullscreenChange = () => {
      const active = document.fullscreenElement === containerRef.current;
      setIsFullscreen(active);
      if (!active) {
        setIsRotated(false); // Reset rotation when exiting fullscreen
        if (window.screen && window.screen.orientation) {
          try {
            const orientation = window.screen.orientation as any;
            if (typeof orientation.unlock === 'function') {
              orientation.unlock();
            }
          } catch (e) {}
        }
      }
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, [containerRef]);

  useEffect(() => {
    if (open) {
      resetControlsTimer();
    }
    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, [open, isPlaying, isLocked]);

  // Handle Play/Pause
  const togglePlay = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const audio = audioRef.current;

    if (isPlaying) {
      video.pause();
      saveCurrentTime();
      if (audio && selectedAudioTrackId !== 'native') {
        audio.pause();
      }
      setIsPlaying(false);
    } else {
      video
        .play()
        .then(() => {
          setIsPlaying(true);
          if (audio && selectedAudioTrackId !== 'native') {
            audio.play().catch((err) => {
              console.error('[AudioSync] Play failed inside gesture:', err);
            });
          }
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

    // Store the last known time in a ref for synchronous saving on fileId change
    if (fileId && restoredFileIdRef.current === fileId && current > 0) {
      lastKnownTimeRef.current = current;
    }

    // Throttled save: once every 1.5 seconds during playback, only after restoring progress
    const now = Date.now();
    if (
      fileId &&
      restoredFileIdRef.current === fileId &&
      now - lastSaveTimestampRef.current > 1500
    ) {
      const data = {
        time: current,
        updatedAt: now,
      };
      localStorage.setItem(`aset-video-time-${fileId}`, JSON.stringify(data));
      lastSaveTimestampRef.current = now;
    }
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
    if (fileId && restoredFileIdRef.current === fileId) {
      lastKnownTimeRef.current = val;
    }
    resetControlsTimer();
  };

  const toggleFullscreen = async () => {
    if (!containerRef.current) return;
    try {
      if (!document.fullscreenElement) {
        await containerRef.current.requestFullscreen();
        setIsFullscreen(true);
        // Try auto-locking orientation to landscape on mobile
        if (window.screen && window.screen.orientation) {
          try {
            const orientation = window.screen.orientation as any;
            if (typeof orientation.lock === 'function') {
              await orientation.lock('landscape');
            }
          } catch (e) {}
        }
      } else {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    } catch (err) {
      console.error('Fullscreen toggle failed:', err);
    }
  };

  const toggleRotation = () => {
    setIsRotated((prev) => !prev);
  };

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!open) return;

      // When locked, block all hotkeys except Escape
      if (isLocked) {
        if (e.key === 'Escape') {
          onClose();
        }
        return;
      }

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
  }, [open, isPlaying, volume, isMuted, skipAmount, duration, isLocked]);

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
    hasRestored: restoredFileIdRef.current === fileId,
  };
}
