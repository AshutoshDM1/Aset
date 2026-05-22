// StoragePlans.tsx
// Right-panel content showing available storage plans.
// Selecting a plan calls the backend mutation and returns to the overview on success.

import { useMutation, useQuery } from '@tanstack/react-query';
import { Check, ChevronRight, Loader2, X } from 'lucide-react';
import { toast } from 'sonner';

import { Badge } from '@/components/ui/badge';
import { trpc, queryClient } from '@/utils/trpc';
import { cn } from '@/lib/utils';
import { useSettingStore } from './settingStore';

const MB_PER_GB = 1024;

interface Plan {
  id: string;
  label: string;
  gb: number;
  price: string;
  features: string[];
  recommended?: boolean;
  upcoming?: boolean;
}

const PLANS: Plan[] = [
  {
    id: 'free',
    label: 'Free',
    gb: 10,
    price: '$0 / mo',
    features: ['Standard upload speed', 'Folder sharing & links'],
  },
  {
    id: 'plus',
    label: 'Plus',
    gb: 20,
    price: 'Free trial',
    features: ['2× faster uploads', 'Double capacity', 'Priority delivery'],
    recommended: true,
  },
  {
    id: 'max',
    label: 'Max',
    gb: 50,
    price: '$9.99 / mo',
    features: ['Uncapped speed', 'Priority support', 'Unlimited transfers'],
    upcoming: true,
  },
];

export function StoragePlans() {
  const { setStorageView } = useSettingStore();
  const { data } = useQuery(trpc.user.me.queryOptions());

  const updateStorage = useMutation({
    ...trpc.user.updateStorageLimit.mutationOptions(),
    onSuccess: () => {
      void queryClient.invalidateQueries(trpc.user.me.queryFilter());
      toast.success('Plan updated — your new storage limit is live.');
      setStorageView('overview');
    },
    onError: (err) => {
      toast.error(err.message || 'Failed to update plan.');
    },
  });

  const currentMb = data?.storage?.totalStorage ?? 10240;

  const handleSelect = (plan: Plan) => {
    if (plan.upcoming) return;
    const limitMb = plan.gb * MB_PER_GB;
    if (currentMb === limitMb) return;
    updateStorage.mutate({ limitMb });
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-base font-semibold">Storage Plans</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Upgrade instantly — no payment required right now.
          </p>
        </div>
        <button
          onClick={() => setStorageView('overview')}
          className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer rounded-md p-1 hover:bg-muted"
          aria-label="Back to storage overview"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Plan rows */}
      <div className="flex flex-col gap-2">
        {PLANS.map((plan) => {
          const isActive = currentMb === plan.gb * MB_PER_GB;
          const isPending =
            updateStorage.isPending &&
            updateStorage.variables?.limitMb === plan.gb * MB_PER_GB;

          return (
            <div
              key={plan.id}
              onClick={() => !plan.upcoming && !isActive && handleSelect(plan)}
              className={cn(
                'flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 py-3.5 rounded-xl border transition-all duration-150',
                plan.upcoming
                  ? 'border-border/30 bg-muted/10 opacity-50 cursor-not-allowed'
                  : isActive
                    ? 'border-primary/50 bg-primary/4'
                    : 'border-border/50 bg-card/30 hover:border-border hover:bg-muted/20 cursor-pointer',
              )}
            >
              {/* Left: name + features */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-medium">{plan.label}</span>
                  <span className="text-xs text-muted-foreground">
                    {plan.gb} GB
                  </span>
                  {plan.recommended && (
                    <Badge
                      variant="secondary"
                      className="text-[10px] px-1.5 py-0 h-4 bg-primary/10 text-primary border-primary/20 border"
                    >
                      Recommended
                    </Badge>
                  )}
                  {plan.upcoming && (
                    <Badge
                      variant="secondary"
                      className="text-[10px] px-1.5 py-0 h-4"
                    >
                      Coming soon
                    </Badge>
                  )}
                </div>
                <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-1.5">
                  {plan.features.map((f) => (
                    <span
                      key={f}
                      className="flex items-center gap-1 text-[11px] text-muted-foreground"
                    >
                      <Check className="h-3 w-3 shrink-0 text-emerald-500" />
                      {f}
                    </span>
                  ))}
                </div>
              </div>

              {/* Right: price + status — row on mobile (below features), column on sm+ */}
              <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-1.5 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-border/30">
                <span className="text-xs font-medium text-muted-foreground">
                  {plan.price}
                </span>
                {isActive ? (
                  <span className="text-[11px] font-medium text-primary">
                    Active
                  </span>
                ) : plan.upcoming ? (
                  <span className="text-[11px] text-muted-foreground">
                    Locked
                  </span>
                ) : isPending ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
                ) : (
                  <span className="text-[11px] font-medium text-foreground/70 flex items-center gap-0.5">
                    Select
                    <ChevronRight className="h-3 w-3" />
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
