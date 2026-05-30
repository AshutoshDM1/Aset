import React from 'react';
import { motion } from 'motion/react';
import { ClockGauge, BatteryStatus, DropboxIcon } from './BentoIcons';

// -------------------------------------------------------------
// CARD 1: REAL-TIME PLATFORM VITALS (Glowing Donut Chart)
// -------------------------------------------------------------
export const RealTimeVitalsCard: React.FC = () => {
  // SVG Donut Chart Calculation:
  // Radius r = 38. Circumference C = 2 * PI * r = 238.76.
  // 66% (Optimal - Purple): length = 157.58, offset = 0
  // 25% (Stable - Slate): length = 59.69, offset = -157.58
  // 9% (Issues - Dark): length = 21.49, offset = -217.27
  const circ = 238.76;
  const optimalDash = circ * 0.66;
  const stableDash = circ * 0.25;
  const issuesDash = circ * 0.09;

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-between p-6 bg-white dark:bg-zinc-950 border border-zinc-200/80 dark:border-zinc-900 rounded-3xl shadow-xs select-none min-h-[300px]">
      {/* Background glow in dark mode */}
      <div className="absolute inset-0 bg-radial-[circle_at_center,rgba(124,58,237,0.02),transparent_70%] pointer-events-none rounded-3xl" />

      {/* Header */}
      <span className="text-[12px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-2">
        Real-time platform vitals
      </span>

      {/* Donut Canvas */}
      <div className="relative size-[140px] flex items-center justify-center my-3">
        <svg
          width="140"
          height="140"
          viewBox="0 0 140 140"
          className="rotate-[-90deg] overflow-visible"
        >
          {/* Base track */}
          <circle
            cx="70"
            cy="70"
            r="38"
            stroke="currentColor"
            strokeWidth="14"
            className="text-zinc-50/50 dark:text-zinc-900/40"
          />

          {/* 1. Optimal Segment (66% - Purple Gradient) */}
          <motion.circle
            cx="70"
            cy="70"
            r="38"
            stroke="var(--primary)"
            strokeWidth="14"
            fill="none"
            strokeDasharray={`${optimalDash} ${circ}`}
            strokeDashoffset="0"
            className="drop-shadow-[0_0_8px_rgba(124,58,237,0.25)]"
            initial={{ strokeDashoffset: circ }}
            animate={{ strokeDashoffset: 0 }}
            transition={{ duration: 1.5, ease: 'easeOut' }}
          />

          {/* 2. Stable Segment (25% - Light gray) */}
          <motion.circle
            cx="70"
            cy="70"
            r="38"
            stroke="currentColor"
            strokeWidth="14"
            fill="none"
            strokeDasharray={`${stableDash} ${circ}`}
            strokeDashoffset={-optimalDash}
            className="text-zinc-300 dark:text-zinc-700"
            initial={{ strokeDashoffset: circ }}
            animate={{ strokeDashoffset: -optimalDash }}
            transition={{ duration: 1.5, ease: 'easeOut', delay: 0.2 }}
          />

          {/* 3. Issues Segment (9% - Dark zinc) */}
          <motion.circle
            cx="70"
            cy="70"
            r="38"
            stroke="currentColor"
            strokeWidth="14"
            fill="none"
            strokeDasharray={`${issuesDash} ${circ}`}
            strokeDashoffset={-(optimalDash + stableDash)}
            className="text-zinc-400 dark:text-zinc-800"
            initial={{ strokeDashoffset: circ }}
            animate={{ strokeDashoffset: -(optimalDash + stableDash) }}
            transition={{ duration: 1.5, ease: 'easeOut', delay: 0.4 }}
          />
        </svg>

        {/* Center label */}
        <div className="absolute text-center">
          <span className="text-2xl font-extrabold text-zinc-900 dark:text-white tracking-tight">
            91%
          </span>
          <span className="text-[9px] text-zinc-400 font-semibold block leading-none">
            Health
          </span>
        </div>
      </div>

      {/* Legends at the bottom */}
      <div className="grid grid-cols-3 w-full gap-2 text-center mt-3 border-t border-zinc-100 dark:border-zinc-900 pt-4">
        <div>
          <span className="text-base font-extrabold text-zinc-950 dark:text-white block">
            66%
          </span>
          <div className="flex items-center justify-center gap-1.5 mt-0.5">
            <span className="size-1.5 rounded-full bg-primary" />
            <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-bold uppercase">
              Optimal
            </span>
          </div>
        </div>
        <div>
          <span className="text-base font-extrabold text-zinc-950 dark:text-white block">
            25%
          </span>
          <div className="flex items-center justify-center gap-1.5 mt-0.5">
            <span className="size-1.5 rounded-full bg-zinc-300 dark:bg-zinc-700" />
            <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-bold uppercase">
              Stable
            </span>
          </div>
        </div>
        <div>
          <span className="text-base font-extrabold text-zinc-950 dark:text-white block">
            9%
          </span>
          <div className="flex items-center justify-center gap-1.5 mt-0.5">
            <span className="size-1.5 rounded-full bg-zinc-400 dark:bg-zinc-800" />
            <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-bold uppercase">
              Issues
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

// -------------------------------------------------------------
// CARD 2: GLOBAL SYSTEM STATUS (Concentric Clock Radar timezones)
// -------------------------------------------------------------
export const GlobalStatusCard: React.FC = () => {
  return (
    <div className="relative w-full h-full flex flex-col justify-between p-6 bg-white dark:bg-zinc-950 border border-zinc-200/80 dark:border-zinc-900 rounded-3xl shadow-xs select-none min-h-[300px]">
      {/* Background glow */}
      <div className="absolute inset-0 bg-radial-[circle_at_center,rgba(124,58,237,0.02),transparent_70%] pointer-events-none rounded-3xl" />

      {/* Clock timezone Row */}
      <div className="grid grid-cols-3 gap-3 w-full">
        <ClockGauge
          label="Amsterdam"
          sublabel="UTC +1"
          handAngle={105}
          status="Enhanced"
          details="24ms → 11ms"
          active={true}
        />
        <ClockGauge
          label="New York"
          sublabel="UTC -4"
          handAngle={220}
          status="Optimized"
          details="37ms → 19ms"
          active={true}
        />
        <ClockGauge
          label="Dubai"
          sublabel="UTC +6"
          handAngle={320}
          status="Scaling"
          details="Adjusting"
          active={false}
        />
      </div>

      {/* Footer System Details */}
      <div className="flex flex-col items-center mt-6 w-full text-center">
        <div className="px-3 py-1 rounded-full bg-primary/5 dark:bg-primary/10 border border-primary/10 text-primary text-[10px] font-bold uppercase tracking-wider mb-2.5">
          Response Time Optimization
        </div>
        <h3 className="text-xl font-extrabold text-zinc-900 dark:text-white tracking-tight">
          Global System Status
        </h3>
      </div>
    </div>
  );
};

// -------------------------------------------------------------
// CARD 3: PERFORMANCE METRICS (Double-line area chart with Q2/41% tooltip)
// -------------------------------------------------------------
export const PerformanceCard: React.FC = () => {
  return (
    <div className="relative w-full h-full flex flex-col justify-between p-6 bg-white dark:bg-zinc-950 border border-zinc-200/80 dark:border-zinc-900 rounded-3xl shadow-xs select-none min-h-[300px]">
      {/* Header */}
      <div>
        <h3 className="text-lg font-bold text-zinc-950 dark:text-white tracking-tight leading-none">
          Performance
        </h3>
        <p className="text-[11px] font-bold text-zinc-400 dark:text-zinc-500 mt-1 uppercase tracking-wider">
          Current performance metrics
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

          {/* Line 2 Background Path (Standard Performance) */}
          <path
            d="M 12 75 Q 72 70 132 80 T 232 50"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            className="text-zinc-300 dark:text-zinc-700/80"
          />

          {/* Line 1 Primary Path (Optimized Performance - Purple Glow) */}
          <motion.path
            d="M 12 70 Q 72 30 110 50 T 192 20 T 232 30"
            fill="none"
            stroke="var(--primary)"
            strokeWidth="2.5"
            strokeLinecap="round"
            className="drop-shadow-[0_2px_8px_rgba(124,58,237,0.3)]"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 2, ease: 'easeInOut' }}
          />

          {/* Dynamic highlighted interactive tooltip at Q2 (X=110, Y=50) */}
          <g>
            <circle
              cx="110"
              cy="50"
              r="5"
              fill="var(--primary)"
              className="stroke-white stroke-2 drop-shadow-[0_0_6px_rgba(124,58,237,0.6)]"
            />

            {/* Tooltip dialog overlay */}
            <foreignObject
              x="80"
              y="10"
              width="60"
              height="30"
              className="overflow-visible"
            >
              <div className="px-1.5 py-0.5 rounded-md bg-zinc-950/95 dark:bg-white text-white dark:text-black border border-zinc-800 dark:border-zinc-200 text-[8px] font-extrabold text-center tracking-tight shadow-sm select-none">
                Q2 / 41%
              </div>
            </foreignObject>
          </g>
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
              97%
            </span>
            <span className="text-[9px] text-zinc-400 font-semibold uppercase">
              Optimized
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="size-2 rounded-full bg-zinc-300 dark:bg-zinc-700" />
          <div>
            <span className="text-sm font-extrabold text-zinc-900 dark:text-white leading-none block">
              51%
            </span>
            <span className="text-[9px] text-zinc-400 font-semibold uppercase">
              Standard
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

// -------------------------------------------------------------
// CARD 4: SYSTEM EVOLUTION (Vertical bars and evolution scores)
// -------------------------------------------------------------
interface BarProps {
  label: string;
  percent: number;
  hovered: boolean;
}

const EvolutionBar: React.FC<BarProps> = ({ label, percent, hovered }) => {
  return (
    <div className="flex flex-col items-center gap-2 flex-1">
      {/* Target Column track container */}
      <div className="w-8 md:w-9 h-[120px] bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-100 dark:border-zinc-900 rounded-lg relative overflow-hidden flex items-end shadow-2xs">
        <motion.div
          className="w-full rounded-t-sm bg-linear-to-t from-primary to-[#c084fc] shadow-[0_0_12px_rgba(124,58,237,0.25)] relative"
          initial={{ height: 0 }}
          animate={{ height: `${percent}%` }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
        >
          {/* Light overlay highlight on top edge */}
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-white/40" />

          {/* Internal percentage text */}
          <span className="absolute bottom-2 left-1/2 -translate-x-1/2 text-[9px] font-bold text-white leading-none select-none">
            {percent}%
          </span>
        </motion.div>
      </div>

      <span className="text-[9px] text-zinc-400 dark:text-zinc-500 font-bold uppercase tracking-tight text-center leading-none">
        {label}
      </span>
    </div>
  );
};

export const SystemEvolutionCard: React.FC = () => {
  const bars = [
    { label: 'Integration', percent: 38 },
    { label: 'Efficiency', percent: 79 },
    { label: 'Security', percent: 92 },
    { label: 'Scaling', percent: 84 },
    { label: 'Uptime', percent: 98 },
  ];

  return (
    <div className="relative w-full h-full flex flex-col justify-between p-6 bg-white dark:bg-zinc-950 border border-zinc-200/80 dark:border-zinc-900 rounded-3xl shadow-xs select-none min-h-[300px]">
      {/* Header */}
      <div className="flex justify-between items-start w-full">
        <div>
          <h3 className="text-lg font-bold text-zinc-950 dark:text-white tracking-tight leading-none">
            System Evolution
          </h3>
          <p className="text-[11px] font-bold text-zinc-400 dark:text-zinc-500 mt-1 uppercase tracking-wider">
            The pulse of progress
          </p>
        </div>

        {/* Evolution Score Badge */}
        <div className="text-right">
          <span className="text-[9px] text-zinc-400 font-bold uppercase block tracking-wider leading-none">
            Evolution Score
          </span>
          <span className="text-xl font-extrabold text-primary tracking-tight mt-0.5 block leading-none">
            86
            <span className="text-zinc-400 dark:text-zinc-600 text-xs font-semibold">
              /100
            </span>
          </span>
        </div>
      </div>

      {/* Columns Row */}
      <div className="flex justify-between gap-2.5 w-full mt-4">
        {bars.map((bar, idx) => (
          <EvolutionBar
            key={idx}
            label={bar.label}
            percent={bar.percent}
            hovered={false}
          />
        ))}
      </div>
    </div>
  );
};

// -------------------------------------------------------------
// CARD 5: RIGHT MINI STACK (Active AI model & Integration gateway)
// -------------------------------------------------------------
export const GeminiBatteryCard: React.FC = () => {
  return (
    <div className="relative w-full h-[142px] flex flex-col items-center justify-between p-4 bg-white dark:bg-zinc-950 border border-zinc-200/80 dark:border-zinc-900 rounded-3xl shadow-xs select-none">
      {/* Badge at top */}
      <span className="text-[9px] uppercase tracking-wider font-extrabold text-primary bg-primary/5 dark:bg-primary/10 px-2 py-0.5 rounded-full border border-primary/10">
        Gemini 2.5 Pro
      </span>

      {/* Charging outline */}
      <BatteryStatus percentage={99.6} />
    </div>
  );
};

export const IntegrationPartnersCard: React.FC = () => {
  return (
    <div className="relative w-full h-[142px] flex flex-col justify-between p-4 bg-white dark:bg-zinc-950 border border-zinc-200/80 dark:border-zinc-900 rounded-3xl shadow-xs select-none">
      <span className="text-[11px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider text-center leading-none mt-1">
        Integration Partners
      </span>

      {/* Centered Dropbox sync widget */}
      <div className="flex items-center justify-center my-1.5 relative">
        {/* Soft layout ring */}
        <div className="absolute size-14 rounded-full border border-dashed border-zinc-200 dark:border-zinc-800 animate-[spin_40s_linear_infinite]" />

        <DropboxIcon />
      </div>

      <span className="text-[9px] text-zinc-400 dark:text-zinc-600 font-bold uppercase text-center leading-none mb-1">
        Pipeline Sync
      </span>
    </div>
  );
};
