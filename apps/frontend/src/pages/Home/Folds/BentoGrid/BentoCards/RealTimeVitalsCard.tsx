import React from 'react';
import { motion } from 'motion/react';
import CountUp from '@/components/CountUp';

// ─── Donut Arc ───────────────────────────────────────────────────────────────
interface DonutArcProps {
  /** 0–1 fraction of the arc to fill */
  fraction: number;
  /** stroke color */
  color: string;
  /** stroke width */
  strokeWidth?: number;
  /** radius */
  r?: number;
  /** animation delay in seconds */
  delay?: number;
  /** dash-offset animation duration */
  duration?: number;
  /** when true, suppress CSS transition so the reset is instant */
  instant?: boolean;
}

const SIZE = 120;
const STROKE = 14;
const R = (SIZE - STROKE) / 2;
// const CIRCUMFERENCE = 2 * Math.PI * R;

/**
 * SVG-based arc segment that animates from 0 → target fraction.
 * The arc spans ~270° (¾ of a circle) like the reference design.
 * Pass `instant=true` to suppress the CSS transition (used for snap-reset).
 */
const DonutArc: React.FC<DonutArcProps> = ({
  fraction,
  color,
  strokeWidth = STROKE,
  r = R,
  delay = 0,
  duration = 1.4,
  instant = false,
}) => {
  // 270° sweep = 0.75 of full circumference
  const arcCircumference = 2 * Math.PI * r;
  const arcLength = arcCircumference * 0.75; // 270° arc
  const gapLength = arcCircumference * 0.25; // remaining 90°

  // the filled portion within the 270° arc
  const filledLength = arcLength * fraction;
  const emptyArcLength = arcLength - filledLength;

  // rotate so the gap is at the bottom-centre
  const rotation = -225;

  const transition = instant
    ? 'none'
    : `stroke-dasharray ${duration}s cubic-bezier(0.16,1,0.3,1) ${delay}s`;

  return (
    <circle
      cx={SIZE / 2}
      cy={SIZE / 2}
      r={r}
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeDasharray={`${filledLength} ${emptyArcLength + gapLength}`}
      strokeDashoffset={0}
      transform={`rotate(${rotation} ${SIZE / 2} ${SIZE / 2})`}
      style={{ transition }}
    />
  );
};

// ─── Stat item at the bottom ─────────────────────────────────────────────────
interface StatProps {
  value: React.ReactNode;
  label: string;
  dotColor: string;
  delay: number;
}

const Stat: React.FC<StatProps> = ({ value, label, dotColor, delay }) => (
  <motion.div
    className="flex flex-col items-center gap-1.5"
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay, ease: [0.16, 1, 0.3, 1] }}
  >
    <span className="text-lg font-extrabold text-zinc-900 dark:text-white tracking-tight leading-none">
      {value}
    </span>
    <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-zinc-400 dark:text-zinc-500 leading-none">
      <span
        className="size-1.5 rounded-full shrink-0"
        style={{ backgroundColor: dotColor }}
      />
      {label}
    </span>
  </motion.div>
);

// ─── Main Card ───────────────────────────────────────────────────────────────
const RealTimeVitalsCard: React.FC = () => {
  /**
   * `filled`  — whether the arc should be at its target fraction (true) or 0 (false)
   * `instant` — when true, CSS transition is suppressed so the reset snaps instantly
   *
   * Cycle every 3 s:
   *  1. instant=true  + filled=false  → arc snaps to 0 (no visible animation)
   *  2. on next rAF: instant=false + filled=true → arc animates to 72% over 1.2 s
   */
  const [filled, setFilled] = React.useState(false);
  const [instant, setInstant] = React.useState(false);

  React.useEffect(() => {
    // Initial fill after first paint
    const initId = setTimeout(() => setFilled(true), 80);

    // Repeat every 3 s
    const intervalId = setInterval(() => {
      // Step 1: instant snap back to 0
      setInstant(true);
      setFilled(false);

      // Step 2: one rAF later re-enable transition and fill
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setInstant(false);
          setFilled(true);
        });
      });
    }, 3000);

    return () => {
      clearTimeout(initId);
      clearInterval(intervalId);
    };
  }, []);

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-between p-6 bg-white dark:bg-zinc-950 rounded-3xl shadow-xs select-none min-h-[300px] overflow-hidden border border-zinc-200/80 dark:border-zinc-900">
      {/* Subtle background radial glow */}
      <div className="absolute inset-0 bg-radial-[circle_at_50%_60%,rgba(124,58,237,0.04),transparent_65%] pointer-events-none rounded-3xl" />

      {/* Title */}
      <motion.p
        className="text-[13px] font-bold text-zinc-900 dark:text-zinc-500 uppercase tracking-wide text-center leading-none"
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      >
        Direct Upload Speed
      </motion.p>

      {/* Donut Chart */}
      <div className="relative flex items-center justify-center my-2">
        <svg
          width={SIZE}
          height={SIZE}
          viewBox={`0 0 ${SIZE} ${SIZE}`}
          className="overflow-visible"
        >
          {/* Track ring (background arc) – always visible, fades in once */}
          <DonutArc
            fraction={filled ? 1 : 0}
            color="rgba(161,161,170,0.18)"
            delay={1}
            duration={0.6}
            instant={instant}
          />

          {/* Filled arc – primary violet, repeating fill animation */}
          <DonutArc
            fraction={filled ? 0.72 : 0}
            color="rgba(124,58,237,0.9)"
            delay={0.15}
            duration={1.2}
            instant={instant}
          />
        </svg>

        {/* Centre Label */}
        <motion.div
          className="absolute inset-0 flex flex-col items-center justify-center"
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Dark centre disc */}
          <div className="size-[88px] rounded-full bg-zinc-900 dark:bg-zinc-900 flex flex-col items-center justify-center shadow-[0_4px_24px_rgba(0,0,0,0.22)]">
            {/* Pulsing glow ring */}
            <motion.div
              className="absolute size-[88px] rounded-full border border-primary/20"
              animate={{
                boxShadow: [
                  '0 0 0 0px rgba(124,58,237,0.15)',
                  '0 0 0 8px rgba(124,58,237,0)',
                ],
                scale: [1, 1.12],
              }}
              transition={{ repeat: Infinity, duration: 2, ease: 'easeOut' }}
            />
            <span className="text-2xl font-medium text-white leading-none tracking-tight">
              10X
            </span>
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-0.5 leading-none">
              Faster
            </span>
          </div>
        </motion.div>
      </div>

      {/* Divider */}
      <div className="w-full h-px bg-zinc-100 dark:bg-zinc-900 my-1" />

      {/* Stats Row */}
      <div className="flex items-center justify-between w-full px-2">
        <Stat
          value={
            <>
              <CountUp to={91} duration={1.2} />%
            </>
          }
          label="Bypassed"
          dotColor="#7c3aed"
          delay={0.6}
        />
        <Stat
          value={
            <>
              <CountUp to={0.8} duration={1.2} />s
            </>
          }
          label="Upload"
          dotColor="#a1a1aa"
          delay={0.72}
        />
        <Stat
          value={
            <>
              <CountUp to={0} duration={0.8} />%
            </>
          }
          label="Egress"
          dotColor="#a1a1aa"
          delay={0.84}
        />
      </div>
    </div>
  );
};

export default RealTimeVitalsCard;
export { RealTimeVitalsCard };
