import React from 'react';

// ─────────────────────────────────────────────────────────────────────────────
// IncrementText
// A reusable component that animates a numeric value counting from 0 → `to`
// in steps of `step`, then resets and repeats every `repeatDelay` ms.
//
// Props:
//   to           – target number (e.g. 38)
//   step         – how much to add each tick (default 0.2)
//   tickMs       – milliseconds between each tick (default 16 ≈ 60 fps)
//   suffix       – string appended after the number (e.g. "ms")
//   prefix       – string prepended before the number (e.g. "$")
//   decimals     – decimal places to show (default 0)
//   repeatDelay  – ms to wait at the target before restarting (default 2000)
//   startDelay   – ms before the first animation begins (default 0)
//   className    – extra class names for the <span>
// ─────────────────────────────────────────────────────────────────────────────

export interface IncrementTextProps {
  to: number;
  step?: number;
  tickMs?: number;
  suffix?: string;
  prefix?: string;
  decimals?: number;
  repeatDelay?: number;
  startDelay?: number;
  className?: string;
}

const IncrementText: React.FC<IncrementTextProps> = ({
  to,
  step = 0.2,
  tickMs = 16,
  suffix = '',
  prefix = '',
  decimals = 0,
  repeatDelay = 2000,
  startDelay = 0,
  className,
}) => {
  const [current, setCurrent] = React.useState(0);

  React.useEffect(() => {
    let rafId: number;
    let timeoutId: ReturnType<typeof setTimeout>;
    let value = 0;
    let lastTime = 0;

    const tick = (now: number) => {
      // Throttle by tickMs
      if (now - lastTime >= tickMs) {
        value = Math.min(value + step, to);
        setCurrent(value);
        lastTime = now;
      }

      if (value < to) {
        rafId = requestAnimationFrame(tick);
      } else {
        // Hold at target, then restart
        timeoutId = setTimeout(() => {
          value = 0;
          setCurrent(0);
          lastTime = 0;
          rafId = requestAnimationFrame(tick);
        }, repeatDelay);
      }
    };

    // Respect startDelay before kicking off
    timeoutId = setTimeout(() => {
      rafId = requestAnimationFrame(tick);
    }, startDelay);

    return () => {
      cancelAnimationFrame(rafId);
      clearTimeout(timeoutId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [to, step, tickMs, repeatDelay, startDelay]);

  const display =
    decimals > 0 ? current.toFixed(decimals) : Math.floor(current).toString();

  return (
    <span className={className}>
      {prefix}
      {display}
      {suffix}
    </span>
  );
};

export default IncrementText;
