import { AlignLeft, ListOrdered, Type } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '@/lib/utils';

interface TextControlsProps {
  lineNumbers: boolean;
  wordWrap: boolean;
  fontSize: 'sm' | 'md' | 'lg';
  setLineNumbers: (val: boolean) => void;
  setWordWrap: (val: boolean) => void;
  setFontSize: (val: 'sm' | 'md' | 'lg') => void;
}

export function TextControls({
  lineNumbers,
  wordWrap,
  fontSize,
  setLineNumbers,
  setWordWrap,
  setFontSize,
}: TextControlsProps) {
  return (
    <motion.div
      initial={{ y: 80 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="absolute bottom-0 left-0 right-0 z-110 flex items-center justify-center p-4 md:p-6 bg-linear-to-t from-black via-black/80 to-transparent"
    >
      <div className="flex items-center gap-2 md:gap-4 bg-white/5 border border-white/10 backdrop-blur-md rounded-2xl p-2 px-3 shadow-2xl">
        {/* Toggle Line Numbers */}
        <motion.button
          type="button"
          onClick={() => setLineNumbers(!lineNumbers)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={cn(
            'flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition-all cursor-pointer',
            lineNumbers
              ? 'bg-white/10 border-white/20 text-white'
              : 'bg-transparent border-transparent text-white/60 hover:text-white hover:bg-white/5',
          )}
          title="Toggle Line Numbers"
        >
          <ListOrdered className="size-4" />
          <span className="hidden sm:inline">Lines</span>
        </motion.button>

        {/* Toggle Word Wrap */}
        <motion.button
          type="button"
          onClick={() => setWordWrap(!wordWrap)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={cn(
            'flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition-all cursor-pointer',
            wordWrap
              ? 'bg-white/10 border-white/20 text-white'
              : 'bg-transparent border-transparent text-white/60 hover:text-white hover:bg-white/5',
          )}
          title="Toggle Word Wrap"
        >
          <AlignLeft className="size-4" />
          <span className="hidden sm:inline">Wrap</span>
        </motion.button>

        <div className="h-4 w-px bg-white/15" />

        {/* Font Size Selector */}
        <div className="flex items-center gap-1 bg-white/5 p-0.5 rounded-lg border border-white/5">
          <div
            className="flex items-center text-white/40 px-1.5"
            title="Font Size"
          >
            <Type className="size-3.5" />
          </div>
          {(['sm', 'md', 'lg'] as const).map((size) => (
            <button
              key={size}
              type="button"
              onClick={() => setFontSize(size)}
              className={cn(
                'px-2.5 py-1 rounded-md text-[10px] font-bold uppercase transition-all cursor-pointer',
                fontSize === size
                  ? 'bg-white/15 text-white'
                  : 'text-white/50 hover:text-white hover:bg-white/5',
              )}
            >
              {size}
            </button>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
