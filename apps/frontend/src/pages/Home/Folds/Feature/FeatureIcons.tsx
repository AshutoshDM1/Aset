import React from 'react';
import { motion } from 'motion/react';

interface IconProps {
  hovered?: boolean;
}

// 1. Complex SVG Icon: Direct-to-R2 Cloud Vault (Radar grid, Cloud, Database cylinder & Lightning flows)
export const CloudVaultIcon: React.FC<IconProps> = ({ hovered }) => {
  return (
    <div className="relative flex items-center justify-center size-28 mx-auto select-none">
      {/* Background soft glowing blur - visible in dark mode, subtle shadow in light mode */}
      <div className="absolute inset-0 rounded-full blur-[20px] bg-primary/10 dark:bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

      {/* SVG Canvas */}
      <svg
        width="112"
        height="112"
        viewBox="0 0 112 112"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="relative z-10 overflow-visible"
      >
        <defs>
          {/* Primary Gradients */}
          <linearGradient
            id="cloudVaultGrad"
            x1="0%"
            y1="0%"
            x2="100%"
            y2="100%"
          >
            <stop offset="0%" stopColor="var(--primary)" stopOpacity="1" />
            <stop offset="100%" stopColor="#c084fc" stopOpacity="0.8" />
          </linearGradient>
          <linearGradient id="glowGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.4" />
            <stop offset="100%" stopColor="transparent" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* 1. Radar Grid System (Background) */}
        {/* Outer Circular border with tick marks */}
        <circle
          cx="56"
          cy="56"
          r="48"
          stroke="currentColor"
          strokeWidth="0.75"
          className="text-zinc-200 dark:text-zinc-800/80"
        />
        <circle
          cx="56"
          cy="56"
          r="40"
          stroke="currentColor"
          strokeWidth="0.75"
          strokeDasharray="4 4"
          className="text-zinc-300 dark:text-zinc-800/60"
        />

        {/* Dynamic Rotating Dashed Ring */}
        <motion.circle
          cx="56"
          cy="56"
          r="32"
          stroke="url(#cloudVaultGrad)"
          strokeWidth="1.25"
          strokeDasharray="5 7"
          className="opacity-40 dark:opacity-60"
          animate={{ rotate: hovered ? 360 : 0 }}
          transition={{
            repeat: Infinity,
            duration: hovered ? 12 : 28,
            ease: 'linear',
          }}
        />

        {/* Axis Crosshairs (Radar reticle) */}
        <line
          x1="56"
          y1="4"
          x2="56"
          y2="108"
          stroke="currentColor"
          strokeWidth="0.5"
          strokeDasharray="2 3"
          className="text-zinc-200 dark:text-zinc-900"
        />
        <line
          x1="4"
          y1="56"
          x2="108"
          y2="56"
          stroke="currentColor"
          strokeWidth="0.5"
          strokeDasharray="2 3"
          className="text-zinc-200 dark:text-zinc-900"
        />

        {/* Outer reticle angle lines */}
        <line
          x1="56"
          y1="8"
          x2="56"
          y2="12"
          stroke="var(--primary)"
          strokeWidth="1.5"
          className="opacity-80"
        />
        <line
          x1="56"
          y1="100"
          x2="56"
          y2="104"
          stroke="var(--primary)"
          strokeWidth="1.5"
          className="opacity-80"
        />
        <line
          x1="8"
          y1="56"
          x2="12"
          y2="56"
          stroke="var(--primary)"
          strokeWidth="1.5"
          className="opacity-80"
        />
        <line
          x1="100"
          y1="56"
          x2="104"
          y2="56"
          stroke="var(--primary)"
          strokeWidth="1.5"
          className="opacity-80"
        />

        {/* Orbiting Direct Upload Packets */}
        <motion.circle
          cx="56"
          cy="56"
          r="40"
          className="hidden"
          id="orbit-path"
        />
        {/* Pulsing signal dot on radar path */}
        <motion.circle
          r="3.5"
          fill="var(--primary)"
          className="shadow-xs"
          animate={{
            x: hovered
              ? [
                  56 + 40 * Math.cos(0),
                  56 + 40 * Math.cos(Math.PI),
                  56 + 40 * Math.cos(2 * Math.PI),
                ]
              : [56 + 40 * Math.cos(0), 56 + 40 * Math.cos(2 * Math.PI)],
            y: hovered
              ? [
                  56 + 40 * Math.sin(0),
                  56 + 40 * Math.sin(Math.PI),
                  56 + 40 * Math.sin(2 * Math.PI),
                ]
              : [56 + 40 * Math.sin(0), 56 + 40 * Math.sin(2 * Math.PI)],
          }}
          transition={{
            repeat: Infinity,
            duration: hovered ? 2.5 : 6,
            ease: 'linear',
          }}
        />

        {/* 2. Core Vault Icon (Center) */}
        {/* Glowing aura under vault */}
        <circle
          cx="56"
          cy="56"
          r="20"
          fill="url(#glowGrad)"
          className="opacity-0"
        />

        {/* Floating Core Graphics Group */}
        <motion.g
          animate={hovered ? { y: [0, -4, 0] } : { y: [0, -2, 0] }}
          transition={{
            repeat: Infinity,
            duration: hovered ? 1.8 : 3.5,
            ease: 'easeInOut',
          }}
        >
          {/* Cloud Structure Shape */}
          <path
            d="M 43 62 C 38 62 34 58 34 53 C 34 48.5 37.5 44.5 42 44 C 44.5 39 49.5 36 55 36 C 61.5 36 67 40.5 68 47 C 72.5 47.5 76 51 76 55.5 C 76 60 72 63.5 67.5 63"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-primary"
          />

          {/* Secure R2 Database Cylinder Inside */}
          <rect
            x="48"
            y="47"
            width="16"
            height="18"
            rx="3"
            fill="url(#cloudVaultGrad)"
            stroke="var(--primary)"
            strokeWidth="1.5"
            className="shadow-sm"
          />
          {/* Database Stack lines */}
          <line
            x1="51"
            y1="51.5"
            x2="61"
            y2="51.5"
            stroke="white"
            strokeWidth="1"
            strokeLinecap="round"
          />
          <line
            x1="51"
            y1="56"
            x2="61"
            y2="56"
            stroke="white"
            strokeWidth="1"
            strokeLinecap="round"
          />

          {/* Direct Zero-latency Lightning Cutout Overlay */}
          <path
            d="M57.5 50.5 L52 56 L55.5 56 L54 61 L59.5 55.5 L56 55.5 Z"
            fill="#fbbf24"
            className="drop-shadow-[0_1px_3px_rgba(251,191,36,0.5)]"
          />
        </motion.g>
      </svg>
    </div>
  );
};

// 2. Complex SVG Icon: Dynamic File Organizer (3D Isometric Cube Hexagon & Branching Tree Nodes)
export const FolderOrganizerIcon: React.FC<IconProps> = ({ hovered }) => {
  return (
    <div className="relative flex items-center justify-center size-28 mx-auto select-none">
      {/* Background soft glowing blur */}
      <div className="absolute inset-0 rounded-full blur-[20px] bg-primary/10 dark:bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

      {/* SVG Canvas */}
      <svg
        width="112"
        height="112"
        viewBox="0 0 112 112"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="relative z-10 overflow-visible"
      >
        <defs>
          <linearGradient id="folderGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="var(--primary)" stopOpacity="1" />
            <stop offset="100%" stopColor="#c084fc" stopOpacity="0.8" />
          </linearGradient>
          <linearGradient id="hexGlow" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.25" />
            <stop offset="100%" stopColor="transparent" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* 1. Isometric Hexagon Wireframe Grid Pattern (Background) */}
        {/* Outer Hexagon outline */}
        <polygon
          points="56,12 94,34 94,78 56,100 18,78 18,34"
          stroke="currentColor"
          strokeWidth="0.75"
          className="text-zinc-200 dark:text-zinc-800/80 fill-zinc-50/20 dark:fill-zinc-950/10"
        />

        {/* Inner vertex connector lines forming a 3D Cube outline */}
        <line
          x1="56"
          y1="12"
          x2="56"
          y2="100"
          stroke="currentColor"
          strokeWidth="0.5"
          strokeDasharray="2 2"
          className="text-zinc-200 dark:text-zinc-800/60"
        />
        <line
          x1="18"
          y1="34"
          x2="94"
          y2="78"
          stroke="currentColor"
          strokeWidth="0.5"
          strokeDasharray="2 2"
          className="text-zinc-200 dark:text-zinc-800/60"
        />
        <line
          x1="94"
          y1="34"
          x2="18"
          y2="78"
          stroke="currentColor"
          strokeWidth="0.5"
          strokeDasharray="2 2"
          className="text-zinc-200 dark:text-zinc-800/60"
        />

        {/* Rotating concentric nodes on hexagon perimeter */}
        <motion.polygon
          points="56,22 86,39 86,73 56,90 26,73 26,39"
          stroke="url(#folderGrad)"
          strokeWidth="1"
          strokeDasharray="4 6"
          className="opacity-30 dark:opacity-50"
          animate={{ rotate: hovered ? -360 : 0 }}
          transition={{
            repeat: Infinity,
            duration: hovered ? 15 : 35,
            ease: 'linear',
          }}
        />

        {/* 2. Core Interactive Directory Node Tree (Center) */}
        <polygon
          cx="56"
          cy="56"
          r="22"
          fill="url(#hexGlow)"
          className="opacity-45"
        />

        {/* Node connections that branch out */}
        <g stroke="var(--primary)" strokeWidth="1.25">
          {/* Main Tree Trunk Connectors */}
          <motion.line
            x1="56"
            y1="56"
            x2="34"
            y2="34"
            strokeDasharray="3 2"
            animate={hovered ? { strokeDashoffset: [0, -10] } : {}}
            transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}
          />
          <motion.line
            x1="56"
            y1="56"
            x2="78"
            y2="34"
            strokeDasharray="3 2"
            animate={hovered ? { strokeDashoffset: [0, -10] } : {}}
            transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}
          />
          <motion.line
            x1="56"
            y1="56"
            x2="56"
            y2="78"
            strokeDasharray="3 2"
            animate={hovered ? { strokeDashoffset: [0, -10] } : {}}
            transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}
          />
        </g>

        {/* Orbiting folder nodes */}
        {/* Node A (Top-Left) */}
        <motion.circle
          cx="34"
          cy="34"
          r="4.5"
          fill="white"
          stroke="var(--primary)"
          strokeWidth="1.5"
          className="dark:fill-zinc-950"
          animate={hovered ? { scale: [1, 1.25, 1] } : {}}
          transition={{ duration: 1.2, repeat: Infinity }}
        />
        {/* Node B (Top-Right) */}
        <motion.circle
          cx="78"
          cy="34"
          r="4.5"
          fill="white"
          stroke="var(--primary)"
          strokeWidth="1.5"
          className="dark:fill-zinc-950"
          animate={hovered ? { scale: [1, 1.25, 1] } : {}}
          transition={{ duration: 1.2, repeat: Infinity, delay: 0.4 }}
        />
        {/* Node C (Bottom-Center) */}
        <motion.circle
          cx="56"
          cy="78"
          r="4.5"
          fill="white"
          stroke="var(--primary)"
          strokeWidth="1.5"
          className="dark:fill-zinc-950"
          animate={hovered ? { scale: [1, 1.25, 1] } : {}}
          transition={{ duration: 1.2, repeat: Infinity, delay: 0.8 }}
        />

        {/* Center Master Folder Icon */}
        <motion.g
          animate={
            hovered
              ? {
                  scale: 1.05,
                  rotate: [0, 3, -3, 0],
                }
              : { scale: 1 }
          }
          transition={{ duration: 0.4, ease: 'easeInOut' }}
        >
          {/* Main folder body */}
          <path
            d="M 44 43 L 49 43 L 52 46 L 68 46 C 70 46 71 47 71 49 L 71 65 C 71 67 70 68 68 68 L 44 68 C 42 68 41 67 41 65 L 41 46 C 41 44 42 43 44 43 Z"
            fill="url(#folderGrad)"
            stroke="var(--primary)"
            strokeWidth="1.25"
            className="shadow-md"
          />
          {/* Internal folder accent node line */}
          <path
            d="M 46 51 H 60 M 46 55 H 55 M 46 59 H 63"
            stroke="white"
            strokeWidth="1"
            strokeLinecap="round"
            className="opacity-75"
          />
        </motion.g>
      </svg>
    </div>
  );
};

// 3. Complex SVG Icon: Smart Sharing & Starred Lists (Constellation grid, Radiant Stars & Link pipelines)
export const SmartSharingIcon: React.FC<IconProps> = ({ hovered }) => {
  return (
    <div className="relative flex items-center justify-center size-28 mx-auto select-none">
      {/* Background soft glowing blur */}
      <div className="absolute inset-0 rounded-full blur-[20px] bg-primary/10 dark:bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

      {/* SVG Canvas */}
      <svg
        width="112"
        height="112"
        viewBox="0 0 112 112"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="relative z-10 overflow-visible"
      >
        <defs>
          <linearGradient id="starGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="var(--primary)" stopOpacity="1" />
            <stop offset="100%" stopColor="#c084fc" stopOpacity="0.8" />
          </linearGradient>
          <linearGradient
            id="constellationGlow"
            x1="0%"
            y1="0%"
            x2="100%"
            y2="100%"
          >
            <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.3" />
            <stop offset="100%" stopColor="transparent" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* 1. Constellation Network Grid (Background) */}
        {/* Geometric radiating web lines */}
        <polygon
          points="56,16 90,56 56,96 22,56"
          stroke="currentColor"
          strokeWidth="0.75"
          className="text-zinc-200 dark:text-zinc-800/80"
        />
        <line
          x1="22"
          y1="56"
          x2="90"
          y2="56"
          stroke="currentColor"
          strokeWidth="0.75"
          strokeDasharray="3 3"
          className="text-zinc-200 dark:text-zinc-850"
        />
        <line
          x1="56"
          y1="16"
          x2="56"
          y2="96"
          stroke="currentColor"
          strokeWidth="0.75"
          strokeDasharray="3 3"
          className="text-zinc-200 dark:text-zinc-850"
        />

        {/* Concentric sharing rings */}
        <circle
          cx="56"
          cy="56"
          r="28"
          stroke="currentColor"
          strokeWidth="0.5"
          className="text-zinc-300 dark:text-zinc-800"
        />

        {/* Orbiting dashed linkage circles */}
        <motion.circle
          cx="56"
          cy="56"
          r="36"
          stroke="url(#starGrad)"
          strokeWidth="1"
          strokeDasharray="3 6"
          className="opacity-40"
          animate={{ rotate: hovered ? 360 : 0 }}
          transition={{
            repeat: Infinity,
            duration: hovered ? 10 : 25,
            ease: 'linear',
          }}
        />

        {/* 2. Constellation Nodes & Secure Sharing Bridges */}
        <circle
          cx="56"
          cy="56"
          r="22"
          fill="url(#constellationGlow)"
          className="opacity-50"
        />

        {/* Node A Link Pipeline */}
        <motion.line
          x1="56"
          y1="56"
          x2="90"
          y2="28"
          stroke="var(--primary)"
          strokeWidth="1.25"
          strokeDasharray="4 2"
          animate={hovered ? { strokeDashoffset: [0, -12] } : {}}
          transition={{ repeat: Infinity, duration: 1.2, ease: 'linear' }}
        />
        {/* Node B Link Pipeline */}
        <motion.line
          x1="56"
          y1="56"
          x2="22"
          y2="84"
          stroke="var(--primary)"
          strokeWidth="1.25"
          strokeDasharray="4 2"
          animate={hovered ? { strokeDashoffset: [0, -12] } : {}}
          transition={{ repeat: Infinity, duration: 1.2, ease: 'linear' }}
        />

        {/* End Orbiting Gateway Nodes */}
        {/* Right Gateway node */}
        <motion.g
          animate={
            hovered ? { scale: [1, 1.15, 1], y: [-1, 1, -1] } : { scale: 1 }
          }
          transition={{ repeat: Infinity, duration: 2 }}
        >
          <circle
            cx="90"
            cy="28"
            r="6"
            fill="white"
            stroke="var(--primary)"
            strokeWidth="1.5"
            className="dark:fill-zinc-950"
          />
          <path
            d="M88 28 H92 M90 26 V30"
            stroke="var(--primary)"
            strokeWidth="1"
          />
        </motion.g>

        {/* Left Gateway node */}
        <motion.g
          animate={
            hovered ? { scale: [1, 1.15, 1], y: [1, -1, 1] } : { scale: 1 }
          }
          transition={{ repeat: Infinity, duration: 2, delay: 0.5 }}
        >
          <circle
            cx="22"
            cy="84"
            r="6"
            fill="white"
            stroke="var(--primary)"
            strokeWidth="1.5"
            className="dark:fill-zinc-950"
          />
          <path d="M20 84 H24" stroke="var(--primary)" strokeWidth="1" />
        </motion.g>

        {/* Center Radiant 8-Point Star Icon */}
        <motion.g
          animate={
            hovered
              ? {
                  scale: 1.1,
                  rotate: 45,
                }
              : {
                  scale: 1,
                  rotate: 0,
                }
          }
          transition={{ duration: 0.6, ease: 'easeInOut' }}
        >
          {/* Star Polygon */}
          <path
            d="M 56 38 L 60.5 48.5 L 71 48.5 L 63 56 L 66 67 L 56 61.5 L 46 67 L 49 56 L 41 48.5 L 51.5 48.5 Z"
            fill="url(#starGrad)"
            stroke="var(--primary)"
            strokeWidth="1.5"
            className="shadow-lg drop-shadow-[0_2px_8px_rgba(124,58,237,0.35)]"
          />
        </motion.g>
      </svg>
    </div>
  );
};
