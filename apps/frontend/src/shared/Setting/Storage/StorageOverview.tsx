// StorageOverview.tsx
// Right-panel content for the Storage tab — shows usage stats and a CTA to view plans.

import { useQuery } from '@tanstack/react-query';
import { ArrowRight, ChevronRight } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { trpc } from '@/utils/trpc';
import { useSettingStore } from './settingStore';

const MB_PER_GB = 1024;

function mbToGb(mb: number) {
  return (mb / MB_PER_GB).toFixed(2);
}

function currentPlanLabel(totalMb: number) {
  if (totalMb <= 10240) return 'Free — 10 GB';
  if (totalMb <= 20480) return 'Plus — 20 GB';
  return 'Max — 50 GB';
}

export function StorageOverview() {
  const { setStorageView } = useSettingStore();
  const { data, isPending } = useQuery(trpc.user.me.queryOptions());

  const storage = data?.storage;
  const totalMb = storage?.totalStorage ?? 10240;
  const usedMb = storage?.usedStorage ?? 0;
  const totalGb = totalMb / MB_PER_GB;
  const usedGb = usedMb / MB_PER_GB;
  const percent =
    totalMb > 0 ? Math.min(100, Math.round((usedMb / totalMb) * 100)) : 0;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-base font-semibold">Storage</h2>
        <p className="text-xs text-muted-foreground mt-0.5">
          Your current storage usage and plan details.
        </p>
      </div>

      {/* Usage meter */}
      <div className="flex flex-col gap-3 py-4 px-5 rounded-xl border border-border/60 bg-muted/20">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Used</span>
          <span className="font-semibold tabular-nums">
            {isPending ? '—' : `${mbToGb(usedMb)} / ${totalGb.toFixed(0)} GB`}
          </span>
        </div>

        <Progress value={percent} className="h-2" />

        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{percent}% used</span>
          <span>{(totalGb - usedGb).toFixed(2)} GB free</span>
        </div>
      </div>

      {/* Current plan row */}
      <div className="flex items-center justify-between py-3 border-b border-border/40">
        <div>
          <p className="text-sm font-medium">Current plan</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {currentPlanLabel(totalMb)}
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="gap-1 text-xs text-primary hover:text-primary cursor-pointer"
          onClick={() => setStorageView('plans')}
        >
          Change plan
          <ChevronRight className="h-3.5 w-3.5" />
        </Button>
      </div>

      {/* Upgrade CTA */}
      <Button
        className="w-full cursor-pointer"
        onClick={() => setStorageView('plans')}
      >
        Upgrade Storage
        <ArrowRight className="h-4 w-4 ml-1" />
      </Button>
    </div>
  );
}
