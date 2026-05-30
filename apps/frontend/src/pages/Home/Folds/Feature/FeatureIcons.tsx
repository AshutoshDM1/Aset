import React from 'react';
import { motion } from 'motion/react';
import {
  CloudLightning,
  FolderLock,
  Share2,
  DatabaseZap,
  FolderClosed,
  Star,
  ShieldCheck,
  CheckCircle2,
  GitBranch,
} from 'lucide-react';

interface IconProps {
  hovered?: boolean;
}

// 1. Custom Animated Cloud Vault Icon (Direct-to-R2 Upload)
export const CloudVaultIcon: React.FC<IconProps> = ({ hovered }) => {
  return (
    <div className="relative flex items-center justify-center p-3 rounded-2xl border border-zinc-100/80 dark:border-zinc-800/60 transition-all duration-300">
      {/* Background glow in dark mode */}
      <div className="absolute inset-0 rounded-2xl blur-[10px] bg-primary opacity-20 hidden dark:block transition-all duration-500" />

      {/* Inner visual box */}
      <motion.div
        className="relative z-10 flex items-center justify-center size-14 rounded-2xl border bg-primary/5 dark:bg-primary/10 border-primary/10 dark:border-primary/20 text-primary shadow-2xs dark:shadow-[0_0_15px_rgba(124,58,237,0.25)]"
        animate={
          hovered
            ? {
                scale: 1.05,
                boxShadow: '0 4px 15px rgba(124,58,237,0.15)',
              }
            : {
                scale: 1,
                boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
              }
        }
        transition={{ duration: 0.3 }}
      >
        <motion.div
          animate={
            hovered
              ? {
                  y: [-2, 2, -2],
                }
              : {
                  y: [0, -2, 0],
                }
          }
          transition={{
            repeat: Infinity,
            duration: hovered ? 1.5 : 3.5,
            ease: 'easeInOut',
          }}
        >
          <DatabaseZap className="size-6 stroke-[2]" />
        </motion.div>

        {/* Small floating sub-icon droplet */}
        <motion.div
          className="absolute -top-1 -right-1 p-1 bg-white dark:bg-zinc-950 border border-primary/20 rounded-md text-primary/80 size-5.5 flex items-center justify-center shadow-xs"
          animate={
            hovered
              ? {
                  rotate: [0, 15, -15, 0],
                  scale: 1.1,
                }
              : {
                  scale: 1,
                }
          }
          transition={{ duration: 0.4 }}
        >
          <CloudLightning className="size-3.5 stroke-[2.2]" />
        </motion.div>
      </motion.div>
    </div>
  );
};

// 2. Custom Animated Folder Organizer Icon (Nested Folders)
export const FolderOrganizerIcon: React.FC<IconProps> = ({ hovered }) => {
  return (
    <div className="relative flex items-center justify-center p-3 rounded-2xl border border-zinc-100/80 dark:border-zinc-800/60 transition-all duration-300">
      {/* Background glow in dark mode */}
      <div className="absolute inset-0 rounded-2xl blur-[10px] bg-primary opacity-20 hidden dark:block transition-all duration-500" />

      {/* Inner visual box */}
      <motion.div
        className="relative z-10 flex items-center justify-center size-14 rounded-2xl border bg-primary/5 dark:bg-primary/10 border-primary/10 dark:border-primary/20 text-primary shadow-2xs dark:shadow-[0_0_15px_rgba(124,58,237,0.25)]"
        animate={
          hovered
            ? {
                scale: 1.05,
                boxShadow: '0 4px 15px rgba(124,58,237,0.15)',
              }
            : {
                scale: 1,
                boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
              }
        }
        transition={{ duration: 0.3 }}
      >
        <motion.div
          animate={
            hovered
              ? {
                  rotate: [0, 4, -4, 0],
                }
              : {}
          }
          transition={{ duration: 0.5, ease: 'easeInOut' }}
        >
          <FolderClosed className="size-6 stroke-[2]" />
        </motion.div>

        {/* Dynamic Branching Node Connector Dot */}
        <motion.div
          className="absolute -top-1 -right-1 p-1 bg-white dark:bg-zinc-950 border border-primary/20 rounded-md text-primary/80 size-5.5 flex items-center justify-center shadow-xs"
          animate={
            hovered
              ? {
                  x: [0, 2, -2, 0],
                }
              : {}
          }
          transition={{ duration: 0.6 }}
        >
          <GitBranch className="size-3.5 stroke-[2.2]" />
        </motion.div>
      </motion.div>
    </div>
  );
};

// 3. Custom Animated Smart Sharing Icon (Collaboration & Sharing)
export const SmartSharingIcon: React.FC<IconProps> = ({ hovered }) => {
  return (
    <div className="relative flex items-center justify-center p-3 rounded-2xl border border-zinc-100/80 dark:border-zinc-800/60 transition-all duration-300">
      {/* Background glow in dark mode */}
      <div className="absolute inset-0 rounded-2xl blur-[10px] bg-primary opacity-20 hidden dark:block transition-all duration-500" />

      {/* Inner visual box */}
      <motion.div
        className="relative z-10 flex items-center justify-center size-14 rounded-2xl border bg-primary/5 dark:bg-primary/10 border-primary/10 dark:border-primary/20 text-primary shadow-2xs dark:shadow-[0_0_15px_rgba(124,58,237,0.25)]"
        animate={
          hovered
            ? {
                scale: 1.05,
                boxShadow: '0 4px 15px rgba(124,58,237,0.15)',
              }
            : {
                scale: 1,
                boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
              }
        }
        transition={{ duration: 0.3 }}
      >
        <motion.div
          animate={
            hovered
              ? {
                  rotate: [0, 45, 90, 180, 360],
                }
              : {
                  rotate: 0,
                }
          }
          transition={{ duration: hovered ? 1.5 : 0.8, ease: 'easeInOut' }}
        >
          <Share2 className="size-6 stroke-[2]" />
        </motion.div>

        {/* Small floating sub-icon star */}
        <motion.div
          className="absolute -top-1 -right-1 p-1 bg-white dark:bg-zinc-950 border border-primary/20 rounded-md text-primary/80 size-5.5 flex items-center justify-center shadow-xs"
          animate={
            hovered
              ? {
                  scale: [1, 1.25, 1],
                }
              : {}
          }
          transition={{ repeat: Infinity, duration: 1.5 }}
        >
          <Star className="size-3.5 fill-primary text-primary stroke-[1.8]" />
        </motion.div>
      </motion.div>
    </div>
  );
};
