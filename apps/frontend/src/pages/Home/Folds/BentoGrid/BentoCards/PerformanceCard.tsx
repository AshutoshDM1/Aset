import React from 'react';
import { motion } from 'motion/react';

const PerformanceCard: React.FC = () => {
  return (
    <motion.div className="relative w-full h-full flex flex-col justify-between p-6 bg-white dark:bg-zinc-950  rounded-3xl shadow-xs select-none min-h-[300px] cursor-pointer overflow-hidden border border-zinc-200/80 dark:border-zinc-900">
      {/* Background glow in dark mode */}
      <div className="absolute inset-0 bg-radial-[circle_at_center,rgba(124,58,237,0.02),transparent_70%] pointer-events-none rounded-3xl" />

      {/* Header */}
      <div>
        <h3 className="text-lg font-bold text-zinc-955 dark:text-white tracking-tight leading-none">
          Transfer Latency
        </h3>
        <p className="text-[11px] font-bold text-zinc-400 dark:text-zinc-500 mt-1 uppercase tracking-wider">
          Upload Latency Comparison (Lower is better)
        </p>
      </div>

      {/* Line Chart Area */}
      <div className="relative w-full h-[120px] my-4 overflow-visible">
        <svg
          width="100%"
          height="100%"
          viewBox="0 0 240 100"
          preserveAspectRatio="none"
          className="overflow-visible"
        >
          {/* Grids */}
          <line
            x1="0"
            y1="90"
            x2="240"
            y2="90"
            stroke="currentColor"
            strokeWidth="0.5"
            className="text-zinc-100 dark:text-zinc-900"
          />
          <line
            x1="0"
            y1="50"
            x2="240"
            y2="50"
            stroke="currentColor"
            strokeWidth="0.5"
            strokeDasharray="2 3"
            className="text-zinc-100 dark:text-zinc-900"
          />

          {/* Vertical axis lines for quarters */}
          {[12, 72, 132, 192, 232].map((x, i) => (
            <line
              key={i}
              x1={x}
              y1="10"
              x2={x}
              y2="90"
              stroke="currentColor"
              strokeWidth="0.5"
              strokeDasharray="2 4"
              className="text-zinc-200 dark:text-zinc-905"
            />
          ))}

          {/* Line 2 Background Path (Dropbox Standard Network: higher latencies) */}
          <motion.path
            d="M 12 75 Q 72 70 132 80 T 232 50"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            className="text-zinc-300 dark:text-zinc-700/80"
            animate={{
              pathLength: [0, 0, 1, 1, 1, 0, 0],
              opacity: [0, 0, 1, 1, 0, 0, 0],
            }}
            transition={{
              repeat: Infinity,
              duration: 4,
              times: [0, 0.25, 0.6, 0.85, 0.92, 0.96, 1],
              ease: 'easeInOut',
            }}
          />

          {/* Line 1 Primary Path (Aset Direct R2: consistently under 50ms) */}
          <motion.path
            d="M 12 18 Q 72 15 110 17 T 192 12 T 232 14"
            fill="none"
            stroke="var(--primary)"
            strokeWidth="2.5"
            strokeLinecap="round"
            className="drop-shadow-[0_2px_8px_rgba(124,58,237,0.3)]"
            animate={{
              pathLength: [0, 0, 1, 1, 1, 0, 0],
              opacity: [0, 0, 1, 1, 0, 0, 0],
            }}
            transition={{
              repeat: Infinity,
              duration: 4,
              times: [0, 0.25, 0.6, 0.85, 0.92, 0.96, 1],
              ease: 'easeInOut',
              delay: 0.15,
            }}
          />

          {/* Dynamic highlighted interactive tooltip at Q2 (X=110, Y=17) */}
          <motion.g
            animate={{
              opacity: [0, 0, 0, 1, 1, 0, 0, 0],
              scale: [0.9, 0.9, 0.9, 1, 1, 0.9, 0.9, 0.9],
            }}
            transition={{
              repeat: Infinity,
              duration: 4,
              times: [0, 0.25, 0.58, 0.65, 0.85, 0.92, 0.96, 1],
              ease: 'easeOut',
              delay: 0.15,
            }}
            style={{ transformOrigin: '110px 17px' }}
          >
            <circle
              cx="110"
              cy="17"
              r="5"
              fill="var(--primary)"
              className="stroke-white stroke-2 drop-shadow-[0_0_6px_rgba(124,58,237,0.6)]"
            />

            {/* Tooltip dialog overlay */}
            <foreignObject
              x="80"
              y="26"
              width="60"
              height="30"
              className="overflow-visible"
            >
              <div className="px-1.5 py-0.5 rounded-md bg-zinc-950/95 dark:bg-white text-white dark:text-black border border-zinc-800 dark:border-zinc-200 text-[8px] font-extrabold text-center tracking-tight shadow-sm select-none">
                Aset / 38ms
              </div>
            </foreignObject>
          </motion.g>
        </svg>
      </div>

      {/* Quarters axis text */}
      <div className="flex justify-between px-2 text-[8px] font-bold text-zinc-400 uppercase tracking-widest mt-1">
        <span>Q1</span>
        <span>Q2</span>
        <span>Q3</span>
        <span>Q4</span>
      </div>

      {/* Stats at bottom */}
      <div className="flex gap-6 mt-4 border-t border-zinc-100 dark:border-zinc-900 pt-4">
        <div className="flex items-center gap-1.5">
          <span className="size-2 rounded-full bg-primary" />
          <div>
            <span className="text-sm font-extrabold text-zinc-900 dark:text-white leading-none block">
              38ms avg
            </span>
            <span className="text-[9px] text-zinc-400 font-semibold uppercase">
              Aset Direct R2
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="size-2 rounded-full bg-zinc-300 dark:bg-zinc-700" />
          <div>
            <span className="text-sm font-extrabold text-zinc-900 dark:text-white leading-none block">
              480ms avg
            </span>
            <span className="text-[9px] text-zinc-400 font-semibold uppercase">
              Dropbox / GDrive
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default PerformanceCard;
export { PerformanceCard };
