// StorageOverview.tsx
// Right-panel content for the Storage tab — shows usage stats and a CTA to view plans.

import { useQuery } from '@tanstack/react-query';
import { ArrowRight, ChevronRight } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { trpc } from '@/utils/trpc';
import { useSettingStore } from './settingStore';
import { useBillingStore } from '../../../store/billingStore';

const MB_PER_GB = 1024;

function mbToGb(mb: number) {
  return (mb / MB_PER_GB).toFixed(2);
}

function getPlanLabel(plan: string | undefined, totalMb: number) {
  const planKey = plan?.toLowerCase() || '';
  if (planKey === 'free' || totalMb <= 5120) return 'Starter plan — 5 GB';
  if (planKey === 'trial' || totalMb <= 20480) return 'Free Trial — 20 GB';
  if (planKey === 'pro' || totalMb <= 512000) return 'Pro plan — 500 GB';
  if (planKey === 'business' || totalMb <= 1048576)
    return 'Business plan — 1 TB';
  return `Custom plan — ${(totalMb / 1024).toFixed(0)} GB`;
}

export function StorageOverview() {
  const { setStorageView, closeDialog } = useSettingStore();
  const openPricing = useBillingStore((state) => state.openPricing);
  const { data, isPending } = useQuery(trpc.user.me.queryOptions());

  const storage = data?.storage;
  const totalMb = storage?.totalStorage ?? 5120;
  const usedMb = storage?.usedStorage ?? 0;
  const totalGb = totalMb / MB_PER_GB;
  const usedGb = usedMb / MB_PER_GB;
  const percent =
    totalMb > 0 ? Math.min(100, Math.round((usedMb / totalMb) * 100)) : 0;

  const isTrial =
    storage?.plan === 'trial' ||
    (totalMb === 20480 && storage?.plan !== 'free');
  let daysLeft: number | undefined;
  if (isTrial && storage?.trialExpiresAt) {
    const expires = new Date(storage.trialExpiresAt).getTime();
    const diff = expires - Date.now();
    daysLeft = Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  }

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
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-xs text-muted-foreground">
              {isPending ? 'Loading...' : getPlanLabel(storage?.plan, totalMb)}
            </span>
            {!isPending && isTrial && daysLeft !== undefined && (
              <span className="text-[10px] font-semibold tracking-wide bg-linear-to-r from-amber-500/10 to-orange-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded-full shadow-xs">
                {daysLeft} {daysLeft === 1 ? 'day' : 'days'} left
              </span>
            )}
          </div>
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
        onClick={() => {
          closeDialog();
          openPricing();
        }}
      >
        Upgrade Storage
        <ArrowRight className="h-4 w-4 ml-1" />
      </Button>
    </div>
  );
}
