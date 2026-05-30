import React from 'react';
import { motion } from 'motion/react';

interface ClockGaugeProps {
  handAngle: number;
  label: string;
  sublabel: string;
  status: string;
  details: string;
  active: boolean;
}

// 1. Timezone Radar Clock Gauge Component
export const ClockGauge: React.FC<ClockGaugeProps> = ({
  handAngle,
  label,
  sublabel,
  status,
  details,
  active,
}) => {
  // Convert angle in degrees to X/Y coordinates for the clock hand
  // Center is at 36, 36. Radius is 24.
  const radians = ((handAngle - 90) * Math.PI) / 180;
  const handX = 36 + 24 * Math.cos(radians);
  const handY = 36 + 24 * Math.sin(radians);

  return (
    <div className="flex flex-col items-center gap-3">
      {/* Timezone label */}
      <div className="text-center">
        <span className="text-[11px] font-bold text-zinc-800 dark:text-zinc-200 block tracking-tight">
          {label}
        </span>
        <span className="text-[9px] text-zinc-400 dark:text-zinc-500 font-medium block">
          {sublabel}
        </span>
      </div>

      {/* Clock Face Gauge */}
      <div className="relative size-[72px]">
        {/* Outer Tech Concentric Circles */}
        <svg
          width="72"
          height="72"
          viewBox="0 0 72 72"
          className="overflow-visible select-none"
        >
          <circle
            cx="36"
            cy="36"
            r="30"
            stroke="currentColor"
            strokeWidth="0.75"
            strokeDasharray="2 3"
            className="text-zinc-200 dark:text-zinc-800"
          />
          <circle
            cx="36"
            cy="36"
            r="26"
            stroke="currentColor"
            strokeWidth="0.5"
            className="text-zinc-300 dark:text-zinc-850"
          />

          {/* Core Radar Sweep line */}
          <line
            x1="36"
            y1="36"
            x2={handX}
            y2={handY}
            stroke="var(--primary)"
            strokeWidth="1.5"
            strokeLinecap="round"
            className="drop-shadow-[0_0_4px_rgba(124,58,237,0.4)]"
          />

          {/* Center node dot */}
          <circle cx="36" cy="36" r="2.5" fill="var(--primary)" />
        </svg>

        {/* Small light indicator */}
        <div className="absolute top-0 right-0 flex size-1.5">
          {active ? (
            <>
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full size-1.5 bg-emerald-500" />
            </>
          ) : (
            <span className="relative inline-flex rounded-full size-1.5 bg-zinc-300 dark:bg-zinc-700" />
          )}
        </div>
      </div>

      {/* Status Indicators */}
      <div className="flex flex-col items-center gap-1 mt-1">
        {/* Active Node Dots */}
        <div className="flex gap-1">
          {[1, 2, 3, 4].map((dot) => (
            <span
              key={dot}
              className={`size-1 rounded-full ${
                active
                  ? dot <= 3
                    ? 'bg-primary'
                    : 'bg-zinc-200 dark:bg-zinc-800'
                  : 'bg-zinc-200 dark:bg-zinc-800'
              }`}
            />
          ))}
        </div>
        <span className="text-[11px] font-bold text-zinc-900 dark:text-white mt-1 leading-none">
          {status}
        </span>
        <span className="text-[9px] text-zinc-400 dark:text-zinc-500 font-semibold">
          {details}
        </span>
      </div>
    </div>
  );
};

// 2. Glowing Battery charge indicator representing AI Processing / Performance cell
interface BatteryStatusProps {
  percentage: number;
}

export const BatteryStatus: React.FC<BatteryStatusProps> = ({ percentage }) => {
  const barsCount = 5;
  const activeBars = Math.ceil((percentage / 100) * barsCount);

  return (
    <div className="flex items-center gap-4 py-1 select-none">
      <div className="relative w-8 h-[54px] border-2 border-zinc-300 dark:border-zinc-700 rounded-md p-0.5 flex flex-col-reverse gap-0.5 justify-between items-center bg-zinc-50/50 dark:bg-zinc-950/20 shadow-2xs">
        {/* Battery Top Terminal cap */}
        <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-3 h-0.5 bg-zinc-300 dark:bg-zinc-700 rounded-t-xs" />

        {/* Battery Charging Bars (Gradient from purple to violet) */}
        {Array.from({ length: barsCount }).map((_, idx) => {
          const isActive = idx < activeBars;
          return (
            <motion.div
              key={idx}
              className={`w-full h-1.5 rounded-3xs transition-all duration-500 ${
                isActive
                  ? 'bg-linear-to-r from-primary to-[#c084fc] shadow-[0_0_6px_rgba(124,58,237,0.25)]'
                  : 'bg-zinc-200/50 dark:bg-zinc-800/40'
              }`}
              animate={
                isActive && percentage >= 99
                  ? {
                      opacity: [0.8, 1, 0.8],
                    }
                  : {}
              }
              transition={{
                repeat: Infinity,
                duration: 2.2,
                delay: idx * 0.25,
              }}
            />
          );
        })}
      </div>

      <div className="text-left leading-none">
        <span className="text-2xl font-extrabold text-zinc-900 dark:text-zinc-100 tracking-tight block">
          {percentage}%
        </span>
        <span className="text-[8px] text-zinc-400 dark:text-zinc-500 font-bold uppercase block mt-1 tracking-wider">
          Integrity Ratio
        </span>
      </div>
    </div>
  );
};

// 3. Reusable Custom Dropbox Integration SVG Icon
export const DropboxIcon: React.FC = () => {
  return (
    <svg
      width="34"
      height="34"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="text-primary drop-shadow-[0_2px_8px_rgba(124,58,237,0.35)]"
    >
      <path
        d="M6 2L1 5.5L6 9L11 5.5L6 2Z"
        fill="currentColor"
        stroke="currentColor"
        strokeWidth="0.75"
        strokeLinejoin="round"
      />
      <path
        d="M18 2L13 5.5L18 9L23 5.5L18 2Z"
        fill="currentColor"
        stroke="currentColor"
        strokeWidth="0.75"
        strokeLinejoin="round"
      />
      <path
        d="M1 12.5L6 9L11 12.5L6 16L1 12.5Z"
        fill="currentColor"
        stroke="currentColor"
        strokeWidth="0.75"
        strokeLinejoin="round"
      />
      <path
        d="M23 12.5L18 9L13 12.5L18 16L23 12.5Z"
        fill="currentColor"
        stroke="currentColor"
        strokeWidth="0.75"
        strokeLinejoin="round"
      />
      <path
        d="M6 16.8L12 20.5L18 16.8L12 13L6 16.8Z"
        fill="currentColor"
        stroke="currentColor"
        strokeWidth="0.75"
        strokeLinejoin="round"
      />
    </svg>
  );
};
