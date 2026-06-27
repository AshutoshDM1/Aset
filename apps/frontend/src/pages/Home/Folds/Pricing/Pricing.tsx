import React, { useState } from 'react';
import SectionHeading from '@/shared/SectionHeading/SectionHeading';
import PricingCards from './PricingCards';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router';
import { useUser } from '@clerk/react';
import { useBillingStore } from '@/store/billingStore';

export const Pricing: React.FC = () => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>(
    'monthly',
  );
  const openBilling = useBillingStore((state) => state.openBilling);
  const navigate = useNavigate();
  const { isSignedIn } = useUser();

  return (
    <div className="space-y-10 max-w-6xl mx-auto">
      {/* Header */}
      <SectionHeading
        badge="Pricing"
        title="Simple, transparent plans."
        description="Select the perfect cloud storage tier to back up, share, and access your assets from anywhere with full privacy."
        align="center"
      />

      {/* Monthly / Yearly Billing Toggle */}
      <div className="flex items-center justify-center gap-4 mt-6 select-none">
        <span
          onClick={() => setBillingCycle('monthly')}
          className={cn(
            'text-sm font-semibold transition-colors duration-200 cursor-pointer',
            billingCycle === 'monthly'
              ? 'text-zinc-900 dark:text-white'
              : 'text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-400',
          )}
        >
          Monthly
        </span>

        <button
          onClick={() =>
            setBillingCycle(billingCycle === 'monthly' ? 'yearly' : 'monthly')
          }
          className="w-14 h-7 bg-zinc-200/80 dark:bg-zinc-800 rounded-full p-1 cursor-pointer transition-colors duration-300 flex items-center relative focus:outline-hidden"
          aria-label="Toggle billing cycle"
        >
          <div
            className={cn(
              'bg-indigo-600 dark:bg-indigo-500 rounded-full w-5 h-5 transition-transform duration-300 shadow-[0_2px_8px_rgba(94,67,243,0.3)]',
              billingCycle === 'yearly' ? 'translate-x-7' : 'translate-x-0',
            )}
          />
        </button>

        <div
          className="flex items-center cursor-pointer"
          onClick={() => setBillingCycle('yearly')}
        >
          <span
            className={cn(
              'text-sm font-semibold transition-colors duration-200',
              billingCycle === 'yearly'
                ? 'text-zinc-900 dark:text-white'
                : 'text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-400',
            )}
          >
            Yearly
          </span>
          <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 ml-1.5 bg-indigo-50 dark:bg-indigo-950/40 px-2 py-0.5 rounded-full select-none">
            20% off
          </span>
        </div>
      </div>

      {/* Pricing Cards Grid */}
      <PricingCards billingCycle={billingCycle} />

      {/* Still Confused Free Trial Link */}
      <div className="text-center">
        <p className="text-sm text-zinc-500 dark:text-zinc-450 font-medium">
          Still confused?{' '}
          <button
            onClick={() => {
              if (!isSignedIn) {
                navigate('/sign-in');
              } else {
                openBilling('trial', 'monthly');
              }
            }}
            className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300 font-semibold underline underline-offset-4 cursor-pointer bg-transparent border-none p-0 inline align-baseline"
          >
            Start your free trial now
          </button>
        </p>
      </div>
    </div>
  );
};

export default Pricing;
