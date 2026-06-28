import React from 'react';
import { cn } from '@/lib/utils';
import BrandButton from '@/shared/BrandButton/BrandButton';
import { useNavigate } from 'react-router';
import { useUser } from '@clerk/react';
import { useQuery } from '@tanstack/react-query';
import { trpc } from '@/utils/trpc';
import { Loader2 } from 'lucide-react';
import { useBillingStore } from '@/store/billingStore';

interface PricingPlan {
  name: string;
  subtitle: string;
  storage: string;
  storageMb: number;
  monthlyPrice: number;
  yearlyPrice: number;
  monthlyDiscountOriginal?: number;
  yearlyDiscountOriginal?: number;
  btnText: string;
  features: string[];
  isPro?: boolean;
  description: string;
}

interface PricingCardsProps {
  billingCycle: 'monthly' | 'yearly';
}

const getDisplayPrice = (plan: PricingPlan, cycle: 'monthly' | 'yearly') => {
  if (cycle === 'monthly') {
    return {
      price: plan.monthlyPrice,
      original:
        plan.monthlyDiscountOriginal && plan.monthlyDiscountOriginal > 0
          ? plan.monthlyDiscountOriginal
          : null,
    };
  } else {
    const price = Math.round(plan.yearlyPrice / 12);
    const original =
      plan.yearlyDiscountOriginal && plan.yearlyDiscountOriginal > 0
        ? Math.round(plan.yearlyDiscountOriginal / 12)
        : null;
    return { price, original };
  }
};

const PricingCards: React.FC<PricingCardsProps> = ({ billingCycle }) => {
  const navigate = useNavigate();
  const { isSignedIn } = useUser();
  const openBilling = useBillingStore((state) => state.openBilling);
  const { data: plansData, isPending } = useQuery(
    trpc.pricing.getPlans.queryOptions(),
  );

  if (isPending) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-zinc-500 w-full col-span-3">
        <Loader2 className="size-8 animate-spin text-indigo-500 mb-2" />
        <p className="text-sm font-medium">Loading plans...</p>
      </div>
    );
  }

  if (!plansData) {
    return (
      <div className="text-center py-20 text-zinc-500 text-sm font-semibold col-span-3 w-full">
        Failed to load pricing plans.
      </div>
    );
  }

  // Filter out the free trial plan from the main pricing page cards grid
  const plans = plansData.filter(
    (p) => p.name.toLowerCase() !== '15-day free trial',
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12 items-stretch">
      {plans.map((plan) => {
        const { price, original } = getDisplayPrice(plan, billingCycle);
        const isFree = plan.monthlyPrice === 0 && plan.yearlyPrice === 0;

        const handlePlanClick = () => {
          if (!isSignedIn) {
            navigate('/sign-in');
            return;
          }
          if (isFree) {
            navigate('/dashboard/my-files');
          } else {
            openBilling(plan.name, billingCycle);
          }
        };

        return (
          <div
            key={plan.name}
            className={cn(
              'flex flex-col rounded-[2.5rem] overflow-hidden border border-zinc-200/80 dark:border-zinc-800/80 bg-white dark:bg-zinc-950 transition-all duration-300',
              'hover:shadow-[0_20px_50px_rgba(0,0,0,0.04)] dark:hover:shadow-[0_20px_50px_rgba(0,0,0,0.2)]',
              plan.isPro &&
                'ring-2 ring-violet-500/20 dark:ring-violet-400/20 shadow-[0_10px_35px_rgba(94,67,243,0.03)]',
            )}
          >
            {/* Top Card Section: Info, Price, Button */}
            <div className="p-5 md:p-9 flex flex-col justify-between min-h-[100px] md:min-h-[230px] bg-white dark:bg-zinc-950 border-b border-zinc-100 dark:border-zinc-900">
              <div>
                <div className="flex justify-between items-start gap-4">
                  <div className="space-y-1">
                    <h3 className="text-lg md:text-xl font-bold tracking-tight text-zinc-900 dark:text-white">
                      {plan.name}
                    </h3>
                    <p className="text-xs md:text-sm font-medium text-zinc-500 dark:text-zinc-450 leading-snug">
                      {plan.subtitle}
                    </p>
                  </div>
                  <div className="flex flex-col items-end text-zinc-900 dark:text-white shrink-0">
                    <div className="flex items-baseline">
                      <span className="text-2xl md:text-3xl lg:text-4xl font-semibold tracking-tight">
                        ${price}
                      </span>
                      <span className="text-xs md:text-sm text-zinc-500 font-medium ml-1">
                        /month
                      </span>
                    </div>
                    {original !== null && original > 0 && (
                      <span className="text-xs md:text-sm font-semibold text-zinc-400 dark:text-zinc-500 line-through mt-0.5">
                        ${original}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-8">
                {plan.isPro ? (
                  <button
                    onClick={handlePlanClick}
                    className={cn(
                      'w-full text-sm md:text-base text-primary-foreground bg-linear-to-b from-indigo-600 via-indigo-500 to-indigo-400 hover:bg-indigo-500/70 rounded-4xl px-4 py-3 font-semibold shadow-[0_3px_17px_rgba(0,0,0,0.2)] shadow-[#5E43F3] ',
                      'ring-1 ring-indigo-600/90 hover:ring-indigo-500/70',
                      'transition-all duration-300 ease-in-out cursor-pointer text-white text-center flex justify-center items-center',
                    )}
                  >
                    {plan.btnText}
                  </button>
                ) : (
                  <BrandButton
                    onClick={handlePlanClick}
                    label={plan.btnText}
                    className="w-full text-center flex justify-center py-3 text-sm md:text-base cursor-pointer"
                  />
                )}
              </div>
            </div>

            {/* Bottom Card Section: Features List */}
            <div className="p-5 md:p-9 flex-1 bg-zinc-50/50 dark:bg-zinc-900/10 flex flex-col gap-4 text-left">
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 select-none">
                Included features:
              </span>
              <ul className="list-disc pl-5 space-y-3.5 text-xs md:text-sm font-medium text-zinc-600 dark:text-zinc-400">
                {plan.features.map((feature, i) => (
                  <li key={i} className="leading-relaxed">
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default PricingCards;
