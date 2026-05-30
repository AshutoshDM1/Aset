import React from 'react';
import { motion } from 'motion/react';

const ImageOptimizerCard: React.FC = () => {
  return (
    <motion.div className="relative w-full h-[142px] flex flex-col justify-between p-4 bg-white dark:bg-zinc-950  rounded-3xl shadow-xs select-none cursor-pointer overflow-hidden border border-zinc-200/80 dark:border-zinc-900">
      {/* Background glow in dark mode */}
      <div className="absolute inset-0 bg-radial-[circle_at_center,rgba(124,58,237,0.02),transparent_70%] pointer-events-none" />

      <span className="text-[11px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider text-center leading-none mt-1">
        Go Image Optimizer
      </span>

      {/* Centered High-Tech Optimize Button Widget */}
      <div className="flex flex-col items-center justify-center my-0.5">
        <motion.div
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary text-white text-[9.5px] font-medium uppercase tracking-wider shadow-xs border border-primary/10 cursor-pointer"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          animate={{
            boxShadow: [
              '0 0 0 0px rgba(124,58,237,0.2)',
              '0 0 0 6px rgba(124,58,237,0)',
              '0 0 0 0px rgba(124,58,237,0)',
            ],
          }}
          transition={{
            repeat: Infinity,
            duration: 2,
            ease: 'easeOut',
          }}
        >
          {/* Small loading/compression spinner */}
          <span className="relative flex size-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white/70 opacity-75" />
            <span className="relative inline-flex rounded-full size-2 bg-white" />
          </span>
          <span>Optimize</span>
        </motion.div>

        {/* Compression stats */}
        <span className="text-[9.5px] font-extrabold text-zinc-850 dark:text-zinc-200 mt-2 font-mono leading-none">
          4.2 MB → 420 KB{' '}
          <motion.span
            className="text-emerald-500 font-medium inline-block"
            animate={{
              scale: [1, 1.12, 1],
            }}
            transition={{
              repeat: Infinity,
              duration: 2,
              ease: 'easeInOut',
              delay: 0.4,
            }}
          >
            (-90%)
          </motion.span>
        </span>
      </div>

      <span className="text-[9px] text-zinc-400 dark:text-zinc-600 font-bold uppercase text-center leading-none mb-1">
        High-Performance Go Engine
      </span>
    </motion.div>
  );
};

export default ImageOptimizerCard;
export { ImageOptimizerCard };
