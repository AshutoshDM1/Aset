import React from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Check, Loader2, X, ArrowBigLeftDash } from 'lucide-react';
import { toast } from 'sonner';

import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { trpc, queryClient } from '@/utils/trpc';
import { useBillingStore } from '../../store/billingStore';
import { useSettingStore } from '@/shared/Setting/Storage/settingStore';

export const PricingDailog: React.FC = () => {
  const {
    isPricingOpen,
    closePricing,
    openBilling,
    billingCycle,
    setBillingCycle,
  } = useBillingStore();
  const openSettings = useSettingStore((state) => state.openDialog);

  const { data: plansData, isPending: isPlansLoading } = useQuery(
    trpc.pricing.getPlans.queryOptions(),
  );

  const { data: userData } = useQuery({
    ...trpc.user.me.queryOptions(),
    enabled: isPricingOpen,
  });

  const updateStorage = useMutation({
    ...trpc.user.updateStorageLimit.mutationOptions(),
    onSuccess: () => {
      void queryClient.invalidateQueries(trpc.user.me.queryFilter());
      toast.success(
        'Plan cancelled successfully. You are now on the Starter (Free) plan.',
      );
      closePricing();
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to cancel plan.');
    },
  });

  const currentMb = userData?.storage?.totalStorage ?? 5120;
  const hasUsedTrial = userData?.storage?.hasUsedTrial ?? false;

  if (!isPricingOpen) return null;

  const getDisplayPrice = (plan: any, cycle: 'monthly' | 'yearly') => {
    if (plan.storageMb === 20 * 1024) {
      return { price: 0, original: null, unit: '15 days' };
    }
    if (cycle === 'monthly') {
      return {
        price: plan.monthlyPrice,
        original:
          plan.monthlyDiscountOriginal && plan.monthlyDiscountOriginal > 0
            ? plan.monthlyDiscountOriginal
            : null,
        unit: 'mo',
      };
    } else {
      const price = Math.round(plan.yearlyPrice / 12);
      const original =
        plan.yearlyDiscountOriginal && plan.yearlyDiscountOriginal > 0
          ? Math.round(plan.yearlyDiscountOriginal / 12)
          : null;
      return { price, original, unit: 'mo' };
    }
  };

  const plansDataList = plansData || [];
  const plansToShow = plansDataList.filter((plan) => {
    const isTrial = plan.storageMb === 20 * 1024;
    const isActive = currentMb === plan.storageMb;
    if (isTrial && hasUsedTrial && !isActive) return false;
    return true;
  });

  return (
    <Dialog
      open={isPricingOpen}
      onOpenChange={(open) => !open && closePricing()}
    >
      <DialogContent
        className={cn(
          'p-0 overflow-hidden flex flex-col rounded-3xl border border-border bg-background shadow-2xl w-[calc(100vw-2rem)] max-h-[90vh] md:max-h-[85vh]',
          plansToShow.length === 4 ? 'md:max-w-5xl' : 'md:max-w-4xl',
        )}
        showCloseButton={false}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border shrink-0">
          <div className="flex flex-col gap-2">
            <button
              onClick={() => {
                closePricing();
                openSettings();
              }}
              className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors cursor-pointer group text-xs font-normal w-fit"
              aria-label="Back to settings"
            >
              <ArrowBigLeftDash className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" />
              Back
            </button>
            <div>
              <DialogTitle className="text-lg font-normal tracking-tight text-foreground">
                Select a Plan
              </DialogTitle>
            </div>
          </div>
          <button
            onClick={closePricing}
            className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer rounded-xl p-1.5 hover:bg-muted"
            aria-label="Close pricing"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {isPlansLoading ? (
            <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-2">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <span className="text-xs font-normal">
                Loading available plans...
              </span>
            </div>
          ) : (
            <>
              {/* Cycle Toggle */}
              <div className="flex items-center justify-center gap-4 select-none">
                <span
                  onClick={() => setBillingCycle('monthly')}
                  className={cn(
                    'text-xs font-normal transition-colors duration-200 cursor-pointer',
                    billingCycle === 'monthly'
                      ? 'text-foreground'
                      : 'text-muted-foreground hover:text-foreground',
                  )}
                >
                  Monthly
                </span>

                <button
                  onClick={() =>
                    setBillingCycle(
                      billingCycle === 'monthly' ? 'yearly' : 'monthly',
                    )
                  }
                  className="w-11 h-6 bg-muted border border-border rounded-full p-0.5 cursor-pointer transition-colors duration-300 flex items-center relative focus:outline-hidden"
                  aria-label="Toggle billing cycle"
                >
                  <div
                    className={cn(
                      'bg-primary rounded-full w-4 h-4 transition-transform duration-300 shadow-md shadow-primary/30',
                      billingCycle === 'yearly'
                        ? 'translate-x-5'
                        : 'translate-x-0',
                    )}
                  />
                </button>

                <div
                  className="flex items-center cursor-pointer"
                  onClick={() => setBillingCycle('yearly')}
                >
                  <span
                    className={cn(
                      'text-xs font-normal transition-colors duration-200',
                      billingCycle === 'yearly'
                        ? 'text-foreground'
                        : 'text-muted-foreground hover:text-foreground',
                    )}
                  >
                    Yearly
                  </span>
                  <span className="text-[10px] font-normal text-emerald-600 dark:text-emerald-400 ml-1.5 bg-emerald-500/10 px-2 py-0.5 rounded-full shadow-xs">
                    Save 20%
                  </span>
                </div>
              </div>

              {/* Cards Grid */}
              <div
                className={cn(
                  'grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4',
                  plansToShow.length === 4
                    ? 'lg:grid-cols-4'
                    : 'lg:grid-cols-3',
                )}
              >
                {plansToShow.map((plan) => {
                  const { price, original, unit } = getDisplayPrice(
                    plan,
                    billingCycle,
                  );
                  const isTrial = plan.storageMb === 20 * 1024;
                  const isActive = currentMb === plan.storageMb;
                  const isDisabled = isTrial && hasUsedTrial && !isActive;

                  return (
                    <div
                      key={plan.name}
                      className={cn(
                        'flex flex-col rounded-2xl border bg-card p-5 transition-all duration-300 relative',
                        isActive
                          ? 'border-primary/50 bg-primary/5 ring-1 ring-primary/30'
                          : plan.isPro
                            ? 'border-primary/25 shadow-md shadow-primary/5 dark:shadow-none hover:border-border/80'
                            : 'border-border hover:border-border/80',
                        isDisabled &&
                          'opacity-50 cursor-not-allowed border-border/40',
                      )}
                    >
                      {/* Badge for Pro */}
                      {plan.isPro && (
                        <Badge
                          variant="secondary"
                          className="absolute -top-2.5 right-4 text-[9px] font-normal px-2 py-0.5 bg-primary hover:bg-primary/90 text-primary-foreground rounded-full border-none shadow-xs uppercase tracking-wider"
                        >
                          Recommended
                        </Badge>
                      )}

                      {/* Header */}
                      <div className="space-y-1 pb-4 border-b border-border">
                        <h4 className="text-base font-normal text-foreground ">
                          {plan.name}
                        </h4>
                        <p className="text-xs text-muted-foreground font-normal leading-relaxed">
                          {plan.subtitle}
                        </p>
                      </div>

                      {/* Price Section */}
                      <div className="py-4 flex flex-col justify-center">
                        <div className="flex items-baseline">
                          <span className="text-2xl md:text-3xl font-normal text-foreground tracking-tight">
                            ${price}
                          </span>
                          <span className="text-xs text-muted-foreground font-normal ml-1">
                            /{unit}
                          </span>
                        </div>
                        {original !== null && original > 0 && (
                          <span className="text-xs font-normal text-muted-foreground/60 line-through mt-0.5">
                            ${original}/mo
                          </span>
                        )}
                        <span className="text-xs font-normal text-primary mt-1">
                          {plan.storage} cloud storage
                        </span>
                      </div>

                      {/* Features */}
                      <div className="flex-1 space-y-2.5 pt-2 mb-6">
                        <span className="text-[10px] font-normal text-muted-foreground block select-none">
                          Includes:
                        </span>
                        <ul className="space-y-2">
                          {plan.features.map((feature: string, idx: number) => (
                            <li
                              key={idx}
                              className="flex items-start gap-2 text-xs font-normal text-muted-foreground leading-relaxed"
                            >
                              <Check className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5 stroke-2" />
                              <span>{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Action Button */}
                      <button
                        onClick={() => {
                          if (!isActive && !isDisabled) {
                            if (plan.storageMb === 5 * 1024) {
                              if (
                                window.confirm(
                                  'Are you sure you want to cancel your current subscription and downgrade to the Free plan?',
                                )
                              ) {
                                updateStorage.mutate({ planId: 'free' });
                              }
                            } else {
                              openBilling(
                                isTrial ? 'trial' : plan.name,
                                billingCycle,
                              );
                            }
                          }
                        }}
                        disabled={
                          isActive || isDisabled || updateStorage.isPending
                        }
                        className={cn(
                          'w-full text-xs font-normal rounded-xl py-2.5 transition-all duration-200 cursor-pointer flex items-center justify-center gap-1.5 shadow-xs',
                          isActive
                            ? 'bg-primary/10 text-primary cursor-default shadow-none border border-primary/20'
                            : isDisabled
                              ? 'bg-muted text-muted-foreground cursor-not-allowed border border-border/30 shadow-none'
                              : plan.storageMb === 5 * 1024
                                ? 'bg-muted hover:bg-muted/80 text-foreground border border-border'
                                : plan.isPro
                                  ? 'bg-primary hover:bg-primary/95 text-primary-foreground shadow-primary/10'
                                  : 'bg-foreground hover:bg-foreground/90 text-background shadow-foreground/10',
                        )}
                      >
                        {updateStorage.isPending &&
                        plan.storageMb === 5 * 1024 ? (
                          <Loader2 className="size-3 animate-spin" />
                        ) : isActive ? (
                          'Current Plan'
                        ) : isDisabled ? (
                          'Redeemed'
                        ) : plan.storageMb === 5 * 1024 ? (
                          'Downgrade'
                        ) : (
                          <>{'Get Started'}</>
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
