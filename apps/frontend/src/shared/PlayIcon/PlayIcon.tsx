import { motion } from 'motion/react';

interface PlayIconProps {
  isPlaying: boolean;
  className?: string;
  size?: number;
}

export function PlayIcon({ isPlaying, className, size = 24 }: PlayIconProps) {
  // Vertices for Pause state
  const pauseLeft = 'M 6,5 L 10,5 L 10,19 L 6,19 Z';
  const pauseRight = 'M 14,5 L 18,5 L 18,19 L 14,19 Z';

  // Vertices for Play state
  const playLeft = 'M 8,5 L 13.5,8.82 L 13.5,15.18 L 8,19 Z';
  const playRight = 'M 13.5,8.82 L 19,12 L 19,12 L 13.5,15.18 Z';

  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      className={className}
      fill="currentColor"
    >
      <motion.path
        animate={{ d: isPlaying ? pauseLeft : playLeft }}
        transition={{ duration: 0.25, ease: 'easeInOut' }}
      />
      <motion.path
        animate={{ d: isPlaying ? pauseRight : playRight }}
        transition={{ duration: 0.25, ease: 'easeInOut' }}
      />
    </svg>
  );
}

export default PlayIcon;
