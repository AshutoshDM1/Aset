import React from 'react';
import { motion } from 'motion/react';
import {
  Database,
  Cpu,
  Globe,
  Server,
  Laptop,
  RefreshCw,
  Zap,
  Network,
  ArrowUpRight,
  Cloud,
} from 'lucide-react';
import IncrementText from '@/shared/IncrementText/IncrementText';

// Premium, custom-designed spinning network device client icon
const ClientDeviceIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    width="22"
    height="22"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    {/* Outer rotating concentric dash circle representing client data network interface */}
    <motion.circle
      cx="12"
      cy="12"
      r="9.5"
      stroke="currentColor"
      strokeWidth="1.25"
      strokeDasharray="2 3"
      className="text-violet-500/35 dark:text-violet-400/35"
      animate={{ rotate: 360 }}
      transition={{ repeat: Infinity, duration: 12, ease: 'linear' }}
      style={{ transformOrigin: '12px 12px' }}
    />

    {/* Clean, high-tech monitor frame */}
    <rect
      x="5"
      y="5"
      width="14"
      height="9"
      rx="1.5"
      stroke="currentColor"
      strokeWidth="1.5"
      className="text-violet-500 dark:text-violet-400"
    />

    {/* Keyboard / base pad */}
    <path
      d="M 3 17 H 21"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      className="text-violet-500 dark:text-violet-400"
    />

    {/* Screen stand support */}
    <path
      d="M 9 14 L 12 17 L 15 14"
      stroke="currentColor"
      strokeWidth="1.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-violet-500/60 dark:text-violet-400/60"
    />

    {/* Upload signal pointer in monitor center */}
    <path
      d="M 12 7 V 11 M 10 9 L 12 7 L 14 9"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-violet-500 dark:text-violet-400"
    />
  </svg>
);

const GlobalStatusCard: React.FC = () => {
  return (
    <motion.div
      className="relative w-full h-full flex flex-col justify-between p-6 bg-white dark:bg-zinc-950 rounded-3xl shadow-xs select-none min-h-[300px] overflow-hidden border border-zinc-200/80 dark:border-zinc-900 cursor-pointer"
      whileHover={{ y: -2 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
    >
      {/* Subtle background radial glows */}
      <div className="absolute inset-0 bg-radial-[circle_at_center,rgba(124,58,237,0.02),transparent_70%] pointer-events-none rounded-3xl" />
      <div className="absolute inset-0 bg-radial-[circle_at_30%_50%,rgba(124,58,237,0.02),transparent_60%] pointer-events-none rounded-3xl" />

      {/* Header Info */}
      <div className="flex justify-between items-start z-10">
        <div>
          <h3 className="text-lg font-bold text-zinc-900 dark:text-white tracking-tight leading-none">
            Global Edge Accelerator
          </h3>
          <p className="text-[11px] font-bold text-zinc-400 dark:text-zinc-500 mt-1 uppercase tracking-wider">
            Zero-latency file delivery network
          </p>
        </div>
        <span className="text-[9px] uppercase tracking-wider font-extrabold text-primary bg-primary/5 dark:bg-primary/10 px-2.5 py-1 rounded-full border border-primary/15 flex items-center gap-1.5">
          <span className="relative flex size-1.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary/70 opacity-75" />
            <span className="relative inline-flex rounded-full size-1.5 bg-primary" />
          </span>
          Live CDN Nodes
        </span>
      </div>

      {/* Network Flow Diagram */}
      <div className="relative w-full h-[190px] my-2 flex items-center justify-center overflow-visible z-10">
        <svg
          width="100%"
          height="100%"
          viewBox="0 0 500 200"
          preserveAspectRatio="xMidYMid meet"
          className="overflow-visible select-none"
        >
          {/* Subtle architectural background network grid */}
          <defs>
            <pattern
              id="network-grid"
              width="20"
              height="20"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 20 0 L 0 0 0 20"
                fill="none"
                stroke="currentColor"
                strokeWidth="0.5"
                className="text-zinc-100 dark:text-zinc-900/60"
              />
            </pattern>
          </defs>
          <rect
            width="100%"
            height="100%"
            fill="url(#network-grid)"
            opacity="0.75"
          />

          {/* SVG Glow Filters for Neon Path FX */}
          <defs>
            <filter
              id="glow-indigo"
              x="-20%"
              y="-20%"
              width="140%"
              height="140%"
            >
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <filter
              id="glow-violet"
              x="-20%"
              y="-20%"
              width="140%"
              height="140%"
            >
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* ================= BACKGROUND PATHS (Solid Fiber Links) ================= */}
          {/* Origin -> CDN */}
          <path
            d="M 45 100 C 100 100, 120 100, 185 100"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.25"
            className="text-zinc-200 dark:text-zinc-800/80"
          />
          {/* CDN -> NA */}
          <path
            d="M 315 85 C 360 85, 365 50, 415 50"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.25"
            className="text-zinc-200 dark:text-zinc-800/80"
          />
          {/* CDN -> EU */}
          <path
            d="M 315 100 H 415"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.25"
            className="text-zinc-200 dark:text-zinc-800/80"
          />
          {/* CDN -> AS */}
          <path
            d="M 315 115 C 360 115, 365 150, 415 150"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.25"
            className="text-zinc-200 dark:text-zinc-800/80"
          />

          {/* ================= NEON PATH GLOWS ================= */}
          {/* Origin -> CDN Violet Glow */}
          <path
            d="M 45 100 C 100 100, 120 100, 185 100"
            fill="none"
            stroke="rgba(124, 58, 237, 0.08)"
            strokeWidth="5"
          />
          {/* CDN -> World Indigo Glows */}
          <path
            d="M 315 85 C 360 85, 365 50, 415 50"
            fill="none"
            stroke="rgba(99, 102, 241, 0.08)"
            strokeWidth="5"
          />
          <path
            d="M 315 100 H 415"
            fill="none"
            stroke="rgba(99, 102, 241, 0.08)"
            strokeWidth="5"
          />
          <path
            d="M 315 115 C 360 115, 365 150, 415 150"
            fill="none"
            stroke="rgba(99, 102, 241, 0.08)"
            strokeWidth="5"
          />

          {/* ================= ANIMATED FLOW LINES (Dashed & Glowing) ================= */}
          {/* Origin -> CDN (Violet Data Stream) */}
          <motion.path
            d="M 45 100 C 100 100, 120 100, 185 100"
            fill="none"
            stroke="#7c3aed"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeDasharray="4 6"
            className="drop-shadow-[0_0_4px_rgba(124,58,237,0.5)]"
            animate={{
              strokeDashoffset: [0, -20],
            }}
            transition={{
              repeat: Infinity,
              duration: 1.5,
              ease: 'linear',
            }}
          />

          {/* CDN -> NA (Indigo Flow Stream) */}
          <motion.path
            d="M 315 85 C 360 85, 365 50, 415 50"
            fill="none"
            stroke="#6366f1"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeDasharray="5 7"
            className="drop-shadow-[0_0_5px_rgba(99,102,241,0.6)]"
            animate={{
              strokeDashoffset: [0, -24],
            }}
            transition={{
              repeat: Infinity,
              duration: 1.2,
              ease: 'linear',
            }}
          />

          {/* CDN -> EU (Indigo Flow Stream) */}
          <motion.path
            d="M 315 100 H 415"
            fill="none"
            stroke="#6366f1"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeDasharray="5 7"
            className="drop-shadow-[0_0_5px_rgba(99,102,241,0.6)]"
            animate={{
              strokeDashoffset: [0, -24],
            }}
            transition={{
              repeat: Infinity,
              duration: 0.9,
              ease: 'linear',
            }}
          />

          {/* CDN -> AS (Indigo Flow Stream) */}
          <motion.path
            d="M 315 115 C 360 115, 365 150, 415 150"
            fill="none"
            stroke="#6366f1"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeDasharray="5 7"
            className="drop-shadow-[0_0_5px_rgba(99,102,241,0.6)]"
            animate={{
              strokeDashoffset: [0, -24],
            }}
            transition={{
              repeat: Infinity,
              duration: 1.4,
              ease: 'linear',
            }}
          />

          {/* ================= INTERACTIVE WIDGET NODES ================= */}

          {/* Origin Node Card */}
          <foreignObject
            x="5"
            y="70"
            width="75"
            height="60"
            className="overflow-visible"
          >
            <div className="flex flex-col items-center justify-center p-1.5 rounded-xl border bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-855 shadow-xs hover:border-violet-500/40 dark:hover:border-violet-500/45 transition-colors duration-300">
              <ClientDeviceIcon className="drop-shadow-[0_2px_8px_rgba(124,58,237,0.35)]" />
              <span className="text-[8px] font-medium text-zinc-400 dark:text-zinc-500 tracking-wider uppercase mt-1.5 leading-none">
                Client
              </span>
            </div>
          </foreignObject>

          {/* Central Aset CDN Box (Style Inspired by Reference Image) */}
          <foreignObject
            x="185"
            y="55"
            width="130"
            height="90"
            className="overflow-visible"
          >
            <div className="flex flex-col items-center justify-center p-2.5 h-full rounded-2xl bg-linear-to-b from-purple-400 to-indigo-500 border border-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.2)] select-none">
              {/* Spinning White Router Engine */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 8, ease: 'linear' }}
                className="text-white drop-shadow-[0_0_6px_rgba(255,255,255,0.4)]"
              >
                <Cpu size={22} className="stroke-2" />
              </motion.div>
              <span className="text-[10px] font-medium text-white uppercase tracking-widest leading-none mt-2">
                ASET CDN
              </span>
              <span className="text-[8px] text-indigo-100 font-extrabold uppercase tracking-wider leading-none mt-1.5">
                Edge Router
              </span>
            </div>
          </foreignObject>

          {/* NA Node (New York - USA Flag) */}
          <foreignObject
            x="415"
            y="30"
            width="80"
            height="42"
            className="overflow-visible"
          >
            <div className="flex items-center gap-2 p-1.5 rounded-xl border bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-855 shadow-xs hover:border-indigo-500/30 transition-colors duration-300">
              <span
                className="text-xs shrink-0 select-none"
                title="United States"
              >
                🇺🇸
              </span>
              <div className="flex flex-col leading-none">
                <span className="text-[7.5px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wide">
                  US-EAST
                </span>
                <span className="text-[10px] font-medium text-zinc-850 dark:text-zinc-100 font-mono mt-0.5">
                  <IncrementText to={12} suffix="ms" step={0.2} />
                </span>
              </div>
            </div>
          </foreignObject>

          {/* EU Node (London - UK Flag) */}
          <foreignObject
            x="415"
            y="79"
            width="80"
            height="42"
            className="overflow-visible"
          >
            <div className="flex items-center gap-2 p-1.5 rounded-xl border bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-855 shadow-xs hover:border-indigo-500/30 transition-colors duration-300">
              <span
                className="text-xs shrink-0 select-none"
                title="United Kingdom"
              >
                🇬🇧
              </span>
              <div className="flex flex-col leading-none">
                <span className="text-[7.5px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wide">
                  EU-WEST
                </span>
                <span className="text-[10px] font-medium text-zinc-850 dark:text-zinc-100 font-mono mt-0.5">
                  <IncrementText to={18} suffix="ms" step={0.3} />
                </span>
              </div>
            </div>
          </foreignObject>

          {/* AS Node (Tokyo - Japan Flag) */}
          <foreignObject
            x="415"
            y="128"
            width="80"
            height="42"
            className="overflow-visible"
          >
            <div className="flex items-center gap-2 p-1.5 rounded-xl border bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-855 shadow-xs hover:border-indigo-500/30 transition-colors duration-300">
              <span className="text-xs shrink-0 select-none" title="Japan">
                🇯🇵
              </span>
              <div className="flex flex-col leading-none">
                <span className="text-[7.5px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wide">
                  AS-PAC
                </span>
                <span className="text-[10px] font-medium text-zinc-850 dark:text-zinc-100 font-mono mt-0.5">
                  <IncrementText to={26} suffix="ms" step={0.4} />
                </span>
              </div>
            </div>
          </foreignObject>
        </svg>
      </div>

      {/* Stats Divider Line */}
      <div className="w-full h-px bg-zinc-100 dark:bg-zinc-900 z-10" />

      {/* Premium Dashboard Footer Metrics */}
      <div className="flex items-center justify-between w-full mt-2 px-1 z-10">
        <div className="flex flex-col">
          <span className="text-lg font-medium text-zinc-900 dark:text-white tracking-tight leading-none">
            <IncrementText to={18} suffix="ms" step={0.3} />
          </span>
          <span className="text-[9px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest mt-1.5 leading-none">
            Avg Edge Latency
          </span>
        </div>

        <div className="flex flex-col">
          <span className="text-lg font-medium text-zinc-900 dark:text-white tracking-tight leading-none">
            <IncrementText to={310} suffix="+" step={5} />
          </span>
          <span className="text-[9px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest mt-1.5 leading-none">
            Global Edge POPs
          </span>
        </div>

        <div className="flex flex-col">
          <span className="text-lg font-medium text-zinc-900 dark:text-white tracking-tight leading-none">
            <IncrementText to={99.4} decimals={1} suffix="%" step={1.5} />
          </span>
          <span className="text-[9px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest mt-1.5 leading-none">
            Cache Hit Ratio
          </span>
        </div>
      </div>
    </motion.div>
  );
};

export default GlobalStatusCard;
export { GlobalStatusCard };
