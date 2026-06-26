import { HugeiconsIcon } from '@hugeicons/react';
import {
  ArrowUp01Icon,
  ArrowDown01Icon,
  MinusSignIcon,
} from '@hugeicons/core-free-icons';
import { cn } from '@/lib/utils';
import type { StatTrend } from './mockData';

type StatCardProps = {
  label: string;
  value: string;
  change: string;
  trend: StatTrend;
  hint?: string;
  icon?: React.ReactNode;
};

const trendStyles: Record<StatTrend, string> = {
  up: 'text-emerald-600 bg-emerald-500/10',
  down: 'text-emerald-600 bg-emerald-500/10',
  flat: 'text-emerald-600 bg-emerald-500/10',
};

const trendIcons: Record<StatTrend, typeof ArrowUp01Icon> = {
  up: ArrowUp01Icon,
  down: ArrowDown01Icon,
  flat: MinusSignIcon,
};

export function StatCard({
  label,
  value,
  change,
  trend,
  hint,
  icon,
}: StatCardProps) {
  const TrendIcon = trendIcons[trend];

  return (
    <div className="">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm text-muted-foreground">{label}</p>
        {icon ? <span className="text-muted-foreground">{icon}</span> : null}
      </div>
      <p className="mt-2 text-2xl font-semibold tracking-tight">{value}</p>
      <div className="mt-2 flex items-center gap-2 text-xs">
        <span
          className={cn(
            'inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 font-medium',
            trendStyles[trend],
          )}
        >
          <HugeiconsIcon icon={TrendIcon} size={12} strokeWidth={2} />
          {change}
        </span>
        {hint ? (
          <span className="text-muted-foreground text-[10px]">{hint}</span>
        ) : null}
      </div>
    </div>
  );
}
