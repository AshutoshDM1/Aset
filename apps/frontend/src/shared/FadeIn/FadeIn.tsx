import React from 'react';
import { motion } from 'motion/react';

export interface FadeInProps {
  children: React.ReactNode;
  direction?: 'up' | 'down' | 'left' | 'right' | 'none';
  delay?: number;
  duration?: number;
  distance?: number;
  once?: boolean;
  margin?: string;
  className?: string;
}

const FadeIn: React.FC<FadeInProps> = ({
  children,
  direction = 'up',
  delay = 0,
  duration = 0.8,
  distance = 40,
  once = true,
  margin = '-100px',
  className,
}) => {
  // Compute initial translation coordinates based on direction
  const getInitialCoordinates = () => {
    switch (direction) {
      case 'up':
        return { opacity: 0, y: distance, x: direction };
      case 'down':
        return { opacity: 0, y: -distance, x: direction };
      case 'left':
        return { opacity: 0, x: distance, y: direction };
      case 'right':
        return { opacity: 0, x: -distance, y: direction };
      case 'none':
      default:
        return { opacity: 0, x: 0, y: 0 };
    }
  };

  return (
    <motion.div
      initial={getInitialCoordinates()}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once, margin }}
      transition={{
        type: 'spring',
        stiffness: 50,
        damping: 20,
        delay,
        duration,
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export default FadeIn;
export { FadeIn };
