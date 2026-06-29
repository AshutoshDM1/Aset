import { ArrowUp, ArrowDown, Minus } from 'lucide-react';
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

const trendIcons = {
  up: ArrowUp,
  down: ArrowDown,
  flat: Minus,
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
    <div className="rounded-xl bg-background p-5 shadow-sm ring-1 ring-border/60 flex items-start gap-4">
      {icon}
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
        <p className="mt-1 text-2xl font-bold tracking-tight text-foreground">
          {value}
        </p>
        <div className="mt-2 flex items-center gap-1.5 text-[11px]">
          <span
            className={cn(
              'inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 font-semibold leading-none',
              trendStyles[trend],
            )}
          >
            <TrendIcon className="size-3" strokeWidth={2.5} />
            {change.replace(/[+-]/g, '')}
          </span>
          {hint ? (
            <span className="text-muted-foreground text-[10px] truncate">
              {hint}
            </span>
          ) : null}
        </div>
      </div>
    </div>
  );
}
