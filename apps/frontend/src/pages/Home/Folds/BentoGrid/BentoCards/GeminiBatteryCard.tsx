import React from 'react';
import { motion } from 'motion/react';

const GeminiBatteryCard: React.FC = () => {
  const percentage = 99.6;
  const barsCount = 5;
  const activeBars = Math.ceil((percentage / 100) * barsCount);

  return (
    <motion.div className="relative w-full h-[142px] flex flex-col items-center justify-between p-4 bg-white dark:bg-zinc-950  rounded-3xl shadow-xs select-none cursor-pointer overflow-hidden border border-zinc-200/80 dark:border-zinc-900">
      {/* Background glow in dark mode */}
      <div className="absolute inset-0 bg-radial-[circle_at_center,rgba(124,58,237,0.02),transparent_70%] pointer-events-none" />

      {/* Badge at top with live pulse */}
      <span className="text-[9px] uppercase tracking-wider font-extrabold text-primary bg-primary/5 dark:bg-primary/10 px-2 py-0.5 rounded-full mb-1 border border-primary/10 flex items-center gap-1.5">
        <span className="relative flex size-1.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
          <span className="relative inline-flex rounded-full size-1.5 bg-primary" />
        </span>
        Client-Side Security
      </span>

      {/* Custom Inline Animated Battery block */}
      <div className="flex items-center gap-4 py-1 select-none">
        <div className="relative w-8 h-[54px] border-2 border-zinc-300 dark:border-zinc-700 rounded-md p-0.5 flex flex-col-reverse gap-0.5 justify-between items-center bg-zinc-50/50 dark:bg-zinc-950/20 shadow-2xs">
          {/* Battery Top Terminal cap */}
          <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-3 h-0.5 bg-zinc-300 dark:bg-zinc-700 rounded-t-xs" />

          {/* Battery Charging Bars with looping sequential charge animation */}
          {Array.from({ length: barsCount }).map((_, idx) => {
            const isActive = idx < activeBars;
            return (
              <motion.div
                key={idx}
                className={`w-full h-1.5 rounded-3xs ${
                  isActive
                    ? 'bg-linear-to-r from-primary to-[#c084fc] shadow-[0_0_6px_rgba(124,58,237,0.25)]'
                    : 'bg-zinc-200/50 dark:bg-zinc-800/40'
                }`}
                animate={{
                  opacity: [0.15, 1, 1, 0.15],
                  scale: [0.95, 1, 1, 0.95],
                }}
                transition={{
                  repeat: Infinity,
                  duration: 2.5,
                  times: [0, 0.3, 0.8, 1],
                  delay: idx * 0.18,
                  ease: 'easeInOut',
                }}
              />
            );
          })}
        </div>

        <div className="text-left leading-none">
          <span className="text-2xl font-medium text-zinc-900 dark:text-zinc-100 tracking-tight block">
            {percentage}%
          </span>
          <span className="text-[8px] text-zinc-400 dark:text-zinc-500 font-bold uppercase block mt-1 tracking-wider">
            Integrity Ratio
          </span>
        </div>
      </div>

      <span className="text-[11px] text-zinc-800 dark:text-zinc-200 uppercase tracking-tight text-center leading-none mt-1">
        AES-256 Crypto Shield
      </span>
    </motion.div>
  );
};

export default GeminiBatteryCard;
export { GeminiBatteryCard };
