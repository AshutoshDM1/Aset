import React from 'react';
import { motion } from 'motion/react';
import {
  CustomClientIcon,
  CustomAuthIcon,
  CustomR2Icon,
} from './WorkflowIcons';

const WorkflowWireframe: React.FC = () => {
  // Coordinates matching the linear 3-node vertical layout precisely
  // Top Card (Client): centered at X=150, Y=70 (Bottom port at Y=117.5)
  // Middle Card (Auth): centered at X=150, Y=225 (Top port at Y=187.5, Bottom port at Y=262.5)
  // Bottom Card (R2 Storage): centered at X=150, Y=380 (Top port at Y=335)
  const pathLeftToMiddle = 'M 150 117.5 L 150 187.5';
  const pathMiddleToRight = 'M 150 262.5 L 150 335';

  return (
    <div className="w-full max-w-[420px] min-h-[500px] bg-linear-to-b from-white to-zinc-50/50 dark:from-zinc-950 dark:to-zinc-900/50 border border-zinc-200/80 dark:border-zinc-800 rounded-3xl p-3 shadow-xs relative overflow-hidden select-none mx-auto transition-colors duration-350">
      {/* Inline CSS for animated elements */}
      <style>{`
        @keyframes flowDash {
          to {
            stroke-dashoffset: -20;
          }
        }
        .animate-flow-dash-slow {
          animation: flowDash 2.4s linear infinite;
        }
        @keyframes ripple {
          0% {
            transform: scale(0.95);
            opacity: 0.8;
          }
          100% {
            transform: scale(1.35);
            opacity: 0;
          }
        }
        .animate-ripple {
          animation: ripple 1.6s cubic-bezier(0.16, 1, 0.3, 1) infinite;
        }
        @keyframes bounceSlow {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-3px);
          }
        }
        .animate-bounce-slow {
          animation: bounceSlow 3s ease-in-out infinite;
        }
      `}</style>

      {/* Primary Colored Grid Pattern Overlay */}
      <svg
        className="absolute inset-0 -z-10 h-full w-full stroke-primary/10 dark:stroke-primary/15 mask-[radial-gradient(100%_100%_at_top_right,white,transparent)]"
        aria-hidden="true"
      >
        <defs>
          <pattern
            id="grid-pattern"
            width={18}
            height={18}
            patternUnits="userSpaceOnUse"
            x="-1"
            y="-1"
          >
            <path d="M.5 18V.5H18" fill="none" strokeDasharray="3 3" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid-pattern)" />
      </svg>

      {/* Main Canvas Container (Light & Dark Mode Compatible) */}
      <div className="w-full h-full relative bg-white/30 dark:bg-zinc-950/20 border border-zinc-100 dark:border-zinc-900 rounded-2xl overflow-hidden shadow-2xs ">
        {/* Soft Violet Radial Background Glow */}
        <div className="absolute inset-0 bg-radial-[circle_at_center,rgba(124,58,237,0.06),transparent_70%] dark:bg-radial-[circle_at_center,rgba(124,58,237,0.09),transparent_65%] pointer-events-none z-0" />

        {/* SVG Flow Lines & Connection Ports */}
        <svg
          viewBox="0 0 300 450"
          width="100%"
          height="100%"
          className="absolute inset-0 pointer-events-none z-10 overflow-visible"
        >
          {/* Hardware-Accelerated Glow Filters */}
          <defs>
            <filter
              id="primary-glow"
              x="-35%"
              y="-35%"
              width="170%"
              height="170%"
            >
              <feGaussianBlur stdDeviation="5.5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Persistent Glowing Connections (Linear Vertical Path in Vibrant Violet) */}
          <g fill="none">
            {/* 1. Underlying soft blurred primary glow */}
            <path
              d={pathLeftToMiddle}
              stroke="var(--primary)"
              strokeWidth="5"
              filter="url(#primary-glow)"
              className="opacity-15 dark:opacity-20 transition-colors duration-500"
            />
            <path
              d={pathMiddleToRight}
              stroke="var(--primary)"
              strokeWidth="5"
              filter="url(#primary-glow)"
              className="opacity-15 dark:opacity-20 transition-colors duration-500"
            />

            {/* 2. Core flowing paths (Always active flowing dash stream) */}
            <path
              d={pathLeftToMiddle}
              stroke="var(--primary)"
              strokeWidth="2"
              strokeDasharray="5 9"
              className="animate-flow-dash-slow opacity-60 dark:opacity-75"
            />
            <path
              d={pathMiddleToRight}
              stroke="var(--primary)"
              strokeWidth="2"
              strokeDasharray="5 9"
              className="animate-flow-dash-slow opacity-60 dark:opacity-75"
            />

            {/* 3. Connector Port Dots on the card edges */}
            <circle
              cx="150"
              cy="117.5"
              r="4.5"
              fill="white"
              stroke="var(--primary)"
              strokeWidth="2.5"
              className="shadow-sm dark:fill-zinc-950"
            />
            <circle
              cx="150"
              cy="187.5"
              r="4.5"
              fill="white"
              stroke="var(--primary)"
              strokeWidth="2.5"
              className="shadow-sm dark:fill-zinc-950"
            />
            <circle
              cx="150"
              cy="262.5"
              r="4.5"
              fill="white"
              stroke="var(--primary)"
              strokeWidth="2.5"
              className="shadow-sm dark:fill-zinc-950"
            />
            <circle
              cx="150"
              cy="335"
              r="4.5"
              fill="white"
              stroke="var(--primary)"
              strokeWidth="2.5"
              className="shadow-sm dark:fill-zinc-950"
            />
          </g>
        </svg>

        {/* ------------------------------------------------------------- */}
        {/* Node Overlays (Vertical 3-Node Stack styled for both Light & Dark themes) */}
        {/* ------------------------------------------------------------- */}

        {/* Node 1: TOP CARD (Client App) */}
        <motion.div
          className="absolute left-[50%] top-[15.5%] -translate-x-1/2 -translate-y-1/2 w-[145px] flex flex-col items-center gap-1.5 p-3 border-dashed border bg-white dark:bg-zinc-950 border-primary/20 dark:border-primary/30 shadow-none! dark:shadow-2xs z-20"
          animate={{
            boxShadow: [
              '0 2px 8px 0px rgba(124,58,237,0.06)',
              '0 4px 20px 2px rgba(124,58,237,0.18)',
              '0 2px 8px 0px rgba(124,58,237,0.06)',
            ],
            scale: [1, 1.02, 1],
          }}
          transition={{
            repeat: Infinity,
            duration: 2.8,
            ease: 'easeInOut',
          }}
        >
          <CustomClientIcon active={false} success={false} />

          <div className="text-center">
            <h4 className="text-[11px] font-semibold text-zinc-800 dark:text-zinc-200 tracking-tight leading-none">
              Client Web App
            </h4>
            <span className="text-[9px] text-primary/75 dark:text-primary/90 font-semibold mt-0.5 block">
              SDK Client
            </span>
          </div>

          <div className="mt-1 flex items-center justify-center px-2 py-0.5 rounded-md bg-zinc-50 dark:bg-zinc-900 border border-zinc-150 dark:border-zinc-800">
            <span className="text-[8px] text-zinc-500 dark:text-zinc-400 font-bold tracking-tight">
              Active Tunnel
            </span>
          </div>
        </motion.div>

        {/* Node 2: MIDDLE CARD (Credentials Gate) */}
        <motion.div
          className="absolute left-[50%] top-[50%] -translate-x-1/2 -translate-y-1/2 w-[175px] flex items-center gap-2.5 p-2 border-dashed border bg-white dark:bg-zinc-950 border-primary/20 dark:border-primary/30  shadow-none! dark:shadow-2xs z-20"
          animate={{
            boxShadow: [
              '0 2px 8px 0px rgba(124,58,237,0.06)',
              '0 4px 16px 2px rgba(124,58,237,0.15)',
              '0 2px 8px 0px rgba(124,58,237,0.06)',
            ],
          }}
          transition={{
            repeat: Infinity,
            duration: 2.8,
            ease: 'easeInOut',
            delay: 0.7,
          }}
        >
          <CustomAuthIcon active={true} success={false} />

          <div className="flex flex-col min-w-0">
            <h4 className="text-[10px] font-semibold text-zinc-800 dark:text-zinc-200 leading-none">
              Presigned URL Auth
            </h4>
            <p className="text-[8px] text-zinc-400 dark:text-zinc-500 font-medium truncate mt-0.5">
              Secure key handshake
            </p>
          </div>
        </motion.div>

        {/* Node 3: BOTTOM CARD (Cloudflare R2 Target) */}
        <motion.div
          className="absolute left-[50%] top-[84.4%] -translate-x-1/2 -translate-y-1/2 w-[145px] flex flex-col items-center gap-1.5 p-3 border-dashed border bg-white dark:bg-zinc-950 border-primary/20 dark:border-primary/30 shadow-none! dark:shadow-2xs z-20"
          animate={{
            boxShadow: [
              '0 2px 8px 0px rgba(124,58,237,0.08)',
              '0 4px 20px 2px rgba(124,58,237,0.22)',
              '0 2px 8px 0px rgba(124,58,237,0.08)',
            ],
            scale: [1, 1.02, 1],
          }}
          transition={{
            repeat: Infinity,
            duration: 2.8,
            ease: 'easeInOut',
            delay: 1.4, // Phase offset from Top card to create wave effect
          }}
        >
          <CustomR2Icon active={true} success={false} />

          <div className="text-center">
            <h4 className="text-[11px] font-semibold text-zinc-800 dark:text-zinc-200 tracking-tight leading-none">
              Cloudflare R2
            </h4>
            <span className="text-[9px] text-primary/75 dark:text-primary/90 font-semibold mt-0.5 block">
              Object Storage
            </span>
          </div>

          <div className="mt-1 flex items-center justify-center px-2 py-0.5 rounded-md bg-zinc-50 dark:bg-zinc-900 border border-zinc-150 dark:border-zinc-800">
            <span className="text-[8px] text-zinc-500 dark:text-zinc-400 font-bold tracking-tight">
              Bucket Ready
            </span>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default WorkflowWireframe;
