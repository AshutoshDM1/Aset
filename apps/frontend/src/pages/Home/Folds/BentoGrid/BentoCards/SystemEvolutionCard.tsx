import React from 'react';
import { motion } from 'motion/react';

interface BarProps {
  label: string;
  percent: number;
  delay: number;
}

const EvolutionBar: React.FC<BarProps> = ({ label, percent, delay }) => {
  return (
    <div className="flex flex-col items-center gap-2 flex-1">
      {/* Target Column track container */}
      <motion.div
        className="w-8 md:w-9 h-[120px] bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-100 dark:border-zinc-900 rounded-lg relative overflow-hidden flex items-end shadow-2xs cursor-pointer"
        whileHover={{
          y: -6,
          borderColor: 'rgba(124,58,237,0.45)',
          boxShadow: '0 6px 16px rgba(124,58,237,0.08)',
        }}
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      >
        <motion.div
          className="w-full rounded-t-sm bg-linear-to-t from-primary to-[#c084fc] shadow-[0_0_12px_rgba(124,58,237,0.25)] relative"
          animate={{
            height: [0, `${percent}%`, `${percent}%`, 0],
          }}
          transition={{
            height: {
              repeat: Infinity,
              duration: 2,
              times: [0, 0.3, 0.85, 1],
              ease: 'easeInOut',
              delay,
            },
          }}
          whileHover={{
            filter: 'brightness(1.15)',
            boxShadow: '0 0 20px rgba(124,58,237,0.5)',
          }}
        >
          {/* Light overlay highlight on top edge */}
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-white/40" />

          {/* Internal percentage text */}
          <motion.span
            className="absolute bottom-2 left-1/2 -translate-x-1/2 text-[9px] font-bold text-white leading-none select-none"
            animate={{ opacity: [0, 1, 1, 0] }}
            transition={{
              repeat: Infinity,
              duration: 4,
              times: [0.15, 0.35, 0.8, 0.95],
              ease: 'easeInOut',
              delay,
            }}
          >
            {percent}%
          </motion.span>
        </motion.div>
      </motion.div>

      <span className="text-[9px] text-zinc-400 dark:text-zinc-500 font-bold uppercase tracking-tight text-center leading-none">
        {label}
      </span>
    </div>
  );
};

const SystemEvolutionCard: React.FC = () => {
  const bars = [
    { label: 'Direct R2', percent: 98 },
    { label: 'Edge Cache', percent: 92 },
    { label: 'Upload Speed', percent: 89 },
    { label: 'AI Index', percent: 84 },
    { label: 'Cost Savings', percent: 95 },
  ];

  return (
    <motion.div
      className="relative w-full h-full flex flex-col justify-between p-6 bg-white dark:bg-zinc-950 border border-zinc-200/80 dark:border-zinc-900 rounded-3xl shadow-xs select-none min-h-[300px]"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Header */}
      <div className="flex justify-between items-start w-full">
        <div>
          <h3 className="text-lg font-bold text-zinc-950 dark:text-white tracking-tight leading-none">
            Aset vs Dropbox
          </h3>
          <p className="text-[11px] font-bold text-zinc-400 dark:text-zinc-500 mt-1 uppercase tracking-wider">
            Key Architecture Advantages
          </p>
        </div>

        {/* Evolution Score Badge */}
        <motion.div
          className="text-right"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{
            duration: 0.6,
            type: 'spring',
            stiffness: 200,
            delay: 0.5,
          }}
        >
          <span className="text-[9px] text-zinc-400 font-bold uppercase block tracking-wider leading-none">
            Aset Power
          </span>
          <span className="text-xl font-extrabold text-primary tracking-tight mt-0.5 block leading-none">
            96
            <span className="text-zinc-400 dark:text-zinc-600 text-xs font-semibold">
              /100
            </span>
          </span>
        </motion.div>
      </div>

      {/* Columns Row */}
      <div className="flex justify-between gap-2.5 w-full mt-4">
        {bars.map((bar, idx) => (
          <EvolutionBar
            key={idx}
            label={bar.label}
            percent={bar.percent}
            delay={idx * 0.12}
          />
        ))}
      </div>
    </motion.div>
  );
};

export default SystemEvolutionCard;
export { SystemEvolutionCard };
