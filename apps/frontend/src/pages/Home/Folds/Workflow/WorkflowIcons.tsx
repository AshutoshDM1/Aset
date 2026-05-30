import React from 'react';
import { motion } from 'motion/react';
import {
  Upload,
  Lock,
  Database,
  Check,
  Cloud,
  BookCopy,
  Unlink,
  DatabaseZap,
} from 'lucide-react';

interface IconProps {
  active?: boolean;
  success?: boolean;
}

// 1. Custom Glowing Client Icon (Upload Node)
export const CustomClientIcon: React.FC<IconProps> = ({ active, success }) => {
  return (
    <div className="relative flex items-center justify-center p-2  border border-zinc-100/80 dark:border-zinc-800/60 transition-all duration-300">
      {/* Background glow in primary color - HIDDEN in light mode, active in dark mode */}
      <div
        className={`absolute inset-0  transition-all duration-500 blur-[8px] opacity-25 hidden dark:block
          ${success ? 'bg-emerald-500' : 'bg-primary'}`}
      />

      {/* Visual ring wrapper */}
      <motion.div
        className={`relative z-10 flex items-center justify-center size-9  border transition-all duration-300
          ${
            success
              ? 'bg-emerald-50 border-emerald-200 text-emerald-600 shadow-xs'
              : 'bg-primary/5 dark:bg-primary/10 border-primary/10 dark:border-primary/20 text-primary shadow-2xs'
          }`}
        animate={{
          y: [0, -3, 0],
          boxShadow: success
            ? '0 1px 2px rgba(16,185,129,0.15)'
            : active
              ? '0 4px 12px rgba(124,58,237,0.15)'
              : '0 1px 2px rgba(0,0,0,0.03)',
        }}
        transition={{
          y: { repeat: Infinity, duration: 3, ease: 'easeInOut' },
        }}
      >
        <BookCopy className="size-4.5 stroke-2" />
      </motion.div>
    </div>
  );
};

// 2. Custom Glowing Auth Icon (Presigned URL Gate)
export const CustomAuthIcon: React.FC<IconProps> = ({ active, success }) => {
  return (
    <div className="relative flex items-center justify-center p-1.5 rounded-lg border border-zinc-100/80 dark:border-zinc-800/60 transition-all duration-300">
      {/* Underglow blur - HIDDEN in light mode */}
      <div
        className={`absolute inset-0 rounded-lg transition-all duration-500 blur-[6px] opacity-20 hidden dark:block
          ${success ? 'bg-emerald-500' : 'bg-primary'}`}
      />

      {/* Icon frame */}
      <motion.div
        className={`relative z-10 flex items-center justify-center size-8 rounded-lg border transition-all duration-300
          ${
            success
              ? 'bg-emerald-50 border-emerald-200 text-emerald-600 shadow-xs'
              : 'bg-primary/5 dark:bg-primary/10 border-primary/10 dark:border-primary/20 text-primary shadow-2xs'
          }`}
        animate={
          active
            ? {
                scale: [1, 1.05, 1],
                borderColor: 'rgba(124,58,237,0.3)',
              }
            : {}
        }
        transition={{
          repeat: Infinity,
          duration: 1.8,
          ease: 'easeInOut',
        }}
      >
        {success ? (
          <Check className="size-4 stroke-[2.2]" />
        ) : (
          <Unlink className="size-4 stroke-[1.8]" />
        )}
      </motion.div>
    </div>
  );
};

// 3. Custom Glowing Cloudflare R2 Storage Icon
export const CustomR2Icon: React.FC<IconProps> = ({ active, success }) => {
  return (
    <div className="relative flex items-center justify-center p-2  border border-zinc-100/80 dark:border-zinc-800/60 transition-all duration-300">
      {/* Cloud-like deep glow background - HIDDEN in light mode */}
      <div
        className={`absolute inset-0  transition-all duration-500 blur-sm opacity-25 hidden dark:block
          ${success ? 'bg-emerald-500' : 'bg-primary'}`}
      />

      {/* Server stack frame */}
      <motion.div
        className={`relative z-10 flex items-center justify-center size-9  border transition-all duration-300
          ${
            success
              ? 'bg-emerald-50 border-emerald-200 text-emerald-600 shadow-xs'
              : 'bg-primary/5 dark:bg-primary/10 border-primary/10 dark:border-primary/20 text-primary shadow-2xs'
          }`}
        animate={{
          y: [0, -3, 0],
          boxShadow: success
            ? '0 1px 2px rgba(16,185,129,0.15)'
            : active
              ? '0 4px 12px rgba(124,58,237,0.15)'
              : '0 1px 2px rgba(0,0,0,0.03)',
        }}
        transition={{
          y: { repeat: Infinity, duration: 3, ease: 'easeInOut', delay: 1.5 },
        }}
      >
        {success ? (
          <Cloud className="size-4.5 stroke-[2] animate-bounce-slow" />
        ) : (
          <DatabaseZap className="size-4.5 stroke-[2]" />
        )}
      </motion.div>
    </div>
  );
};
export default CustomClientIcon;
