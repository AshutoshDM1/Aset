import React from 'react';
import { cn } from '@/lib/utils';

interface SectionHeadingProps {
  tittle?: string; // Support typo "tittle" from user definition
  title?: string; // Support standard "title"
  description?: string;
  badge?: string;
  align?: 'left' | 'center' | 'right';
  className?: string;
}

const SectionHeading: React.FC<SectionHeadingProps> = ({
  tittle,
  title,
  description,
  badge,
  align = 'left',
  className,
}) => {
  const displayTitle = title || tittle || '';

  return (
    <div
      className={cn(
        'flex flex-col gap-3 w-full',
        align === 'center' && 'items-center text-center',
        align === 'right' && 'items-end text-right',
        align === 'left' && 'items-start text-left',
        className,
      )}
    >
      {/* Premium Pill Badge with active pulse dot */}
      {badge && (
        <span
          className={cn(
            'inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-mono font-bold tracking-widest uppercase border',
            'bg-zinc-100/80 dark:bg-zinc-900/50 text-zinc-800 dark:text-zinc-300 border-zinc-200 dark:border-zinc-800 shadow-xs select-none',
          )}
        >
          <span className="relative flex h-1.5 w-1.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-primary"></span>
          </span>
          {badge}
        </span>
      )}

      {/* Main Title Heading */}
      {displayTitle && (
        <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight text-zinc-900 dark:text-white leading-tight font-sans">
          {displayTitle}
        </h2>
      )}

      {/* Description Text */}
      {description && (
        <p
          className={cn(
            'text-sm font-medium leading-relaxed text-zinc-500 dark:text-zinc-400 md:text-lg',
            align === 'center' ? 'max-w-2xl' : 'max-w-xl',
          )}
        >
          {description}
        </p>
      )}
    </div>
  );
};

export default SectionHeading;
