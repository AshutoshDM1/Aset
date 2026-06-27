import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { ChevronRight, Loader2, X } from 'lucide-react';
import { toast } from 'sonner';

import { Badge } from '@/components/ui/badge';
import { trpc, queryClient } from '@/utils/trpc';
import { cn } from '@/lib/utils';
import { useSettingStore } from './settingStore';
import { ConfirmCancellationDialog } from './ConfirmCancellationDialog';
import { useBillingStore } from '../../../store/billingStore';

export function StoragePlans() {
  const { setStorageView, closeDialog } = useSettingStore();
  const { data: userData } = useQuery(trpc.user.me.queryOptions());
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const openBilling = useBillingStore((state) => state.openBilling);

  // Fetch centralized pricing plans
  const { data: plans, isPending: isPlansLoading } = useQuery(
    trpc.pricing.getPlans.queryOptions(),
  );

  const updateStorage = useMutation({
    ...trpc.user.updateStorageLimit.mutationOptions(),
    onSuccess: () => {
      void queryClient.invalidateQueries(trpc.user.me.queryFilter());
      toast.success(
        'Plan cancelled successfully. You are now on the Starter (Free) plan.',
      );
      setStorageView('overview');
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to cancel plan.');
    },
  });

  const currentMb = userData?.storage?.totalStorage ?? 5120; // Default to free 5GB limit
  const hasUsedTrial = userData?.storage?.hasUsedTrial ?? false;

  const handleCancel = () => {
    setIsConfirmOpen(true);
  };

  const handleSelect = (plan: any) => {
    const limitMb = plan.storageMb;
    if (currentMb === limitMb) return;

    if (limitMb === 5 * 1024) {
      // Downgrading to Free plan (Cancelling plan)
      handleCancel();
    } else {
      // Upgrading to Pro, Business or Trial opens the billing dialog directly
      closeDialog();
      const planParam = limitMb === 20 * 1024 ? 'trial' : plan.name;
      openBilling(planParam, 'monthly');
    }
  };

  if (isPlansLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-10 gap-2 text-zinc-500">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
        <span className="text-xs">Loading plans...</span>
      </div>
    );
  }

  const plansList = plans || [];

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-base font-semibold">Storage Plans</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Upgrade instantly — pricing details available.
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
        {plansList.map((plan) => {
          const isTrialPlan = plan.storageMb === 20 * 1024;
          const isActive = currentMb === plan.storageMb;
          const isDisabled = isTrialPlan && hasUsedTrial && !isActive;

          let targetPlanId = 'free';
          if (plan.storageMb === 20 * 1024) targetPlanId = 'trial';
          else if (plan.storageMb === 500 * 1024) targetPlanId = 'pro';
          else if (plan.storageMb === 1024 * 1024) targetPlanId = 'business';

          const isPending =
            updateStorage.isPending &&
            updateStorage.variables?.planId === targetPlanId;

          const displayPrice =
            plan.monthlyPrice === 0 ? 'Free' : `$${plan.monthlyPrice} / mo`;

          return (
            <div
              key={plan.name}
              onClick={() => !isActive && !isDisabled && handleSelect(plan)}
              className={cn(
                'flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 py-3.5 rounded-xl border transition-all duration-150',
                isActive
                  ? 'border-primary/50 bg-primary/4'
                  : isDisabled
                    ? 'border-border/30 bg-card/10 opacity-50 cursor-not-allowed'
                    : 'border-border/50 bg-card/30 hover:border-border hover:bg-muted/20 cursor-pointer',
              )}
            >
              {/* Left: name + size */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-medium">{plan.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {plan.storage}
                  </span>
                  {plan.isPro && (
                    <Badge
                      variant="secondary"
                      className="text-[10px] px-1.5 py-0 h-4 bg-primary/10 text-primary border-primary/20 border"
                    >
                      Recommended
                    </Badge>
                  )}
                </div>
              </div>

              {/* Right: price + status */}
              <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-1.5 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-border/30">
                <span className="text-xs font-medium text-muted-foreground">
                  {displayPrice}
                </span>
                {isActive ? (
                  <div className="flex flex-col items-center sm:items-end gap-1">
                    <span className="text-[11px] font-semibold text-primary">
                      Active
                    </span>
                    {plan.storageMb !== 5 * 1024 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation(); // Avoid row navigation trigger
                          handleCancel();
                        }}
                        className="text-[10px] font-semibold text-red-500 hover:text-red-400 cursor-pointer mt-0.5 underline underline-offset-2"
                      >
                        Cancel Plan
                      </button>
                    )}
                  </div>
                ) : isPending ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
                ) : isDisabled ? (
                  <span className="text-[11px] font-medium text-zinc-500">
                    Redeemed
                  </span>
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

      {/* Confirmation Dialog */}
      <ConfirmCancellationDialog
        isOpen={isConfirmOpen}
        onOpenChange={setIsConfirmOpen}
        onConfirm={() => {
          setIsConfirmOpen(false);
          updateStorage.mutate({ planId: 'free' });
        }}
        isPending={updateStorage.isPending}
      />
    </div>
  );
}
