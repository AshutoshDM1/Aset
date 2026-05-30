import React from 'react';
import BrandButton from '@/shared/BrandButton/BrandButton';

const CTA: React.FC = () => {
  return (
    <div className="w-full relative overflow-hidden rounded-3xl border border-zinc-200/80 dark:border-zinc-900 bg-linear-to-b from-zinc-50/80 to-zinc-100/30 dark:from-zinc-950 dark:to-zinc-900/40 p-8 md:p-16 flex flex-col items-start justify-center gap-6 md:gap-8 shadow-xs select-none group transition-all duration-300">
      {/* Premium Primary Colored Grid Pattern overlay */}
      <svg
        className="absolute inset-0 -z-10 h-full w-full stroke-zinc-200/60 dark:stroke-zinc-900/60 mask-[radial-gradient(100%_100%_at_bottom_left,white,transparent_80%)]"
        aria-hidden="true"
      >
        <defs>
          <pattern
            id="cta-grid"
            width={24}
            height={24}
            patternUnits="userSpaceOnUse"
            x="-1"
            y="-1"
          >
            <path d="M.5 24V.5H24" fill="none" strokeDasharray="3 3" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#cta-grid)" />
      </svg>

      {/* Ambient background glow in dark mode */}
      <div className="absolute right-0 bottom-0 size-80 bg-radial-[circle_at_center,rgba(124,58,237,0.035),transparent_70%] dark:bg-radial-[circle_at_center,rgba(124,58,237,0.06),transparent_65%] pointer-events-none rounded-full" />

      {/* Upper Label */}
      <span className="text-[10px] md:text-[11px] font-extrabold tracking-widest text-zinc-400 dark:text-zinc-500 uppercase leading-none">
        CTA
      </span>

      {/* Main Copy Details */}
      <div className="flex flex-col gap-2.5 max-w-2xl">
        <h2 className="text-2xl md:text-4xl font-medium text-zinc-950 dark:text-white tracking-tighter leading-tight">
          Ready to simplify your file management
        </h2>
        <p className="text-[13px] md:text-[14px] font-medium text-zinc-500 dark:text-zinc-400 tracking-tight leading-relaxed">
          Free expert workflow setup included
        </p>
      </div>

      {/* Start Free Trial Button */}
      <BrandButton to="/dashboard">Get Start Now</BrandButton>

      {/* Little clean decorative light pulse indicator at top right */}
      <div className="absolute top-6 right-6 flex size-1.5 pointer-events-none">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary/25 opacity-75" />
        <span className="relative inline-flex rounded-full size-1.5 bg-primary/50" />
      </div>
    </div>
  );
};

export default CTA;
export { CTA };
