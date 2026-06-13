import React from 'react';
import { ArrowLeft, Info, Ticket } from 'lucide-react';
import Logo from '@/shared/Navbar/Logo';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

interface PlanSummaryProps {
  planKey: string;
  storage: string;
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  totalPrice: number;
  currency: 'INR' | 'USD';
  setCurrency: (c: 'INR' | 'USD') => void;
  currencySymbol: string;
  isYearly: boolean;
  appliedCoupon: { code: string; discountPercent: number } | null;
  handleToggleCycle: () => void;
  onBack: () => void;
}

export const PlanSummary: React.FC<PlanSummaryProps> = ({
  planKey,
  storage,
  subtotal,
  taxAmount,
  discountAmount,
  totalPrice,
  currency,
  setCurrency,
  currencySymbol,
  isYearly,
  appliedCoupon,
  handleToggleCycle,
  onBack,
}) => {
  const isINR = currency === 'INR';

  return (
    <div className="bg-zinc-950 text-zinc-100 flex flex-col justify-start p-8 md:p-12 lg:pl-8 lg:pr-16 lg:min-h-screen border-b lg:border-b-0 lg:border-r border-zinc-900 font-medium select-none">
      {/* Header logo & back button */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-zinc-400 hover:text-zinc-150 transition-colors cursor-pointer group text-sm font-medium"
        >
          <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-1" />
          Back
        </button>
        <div className="flex items-center gap-2 text-white">
          <Logo className="size-7 text-white" />
          <span className="text-lg font-medium tracking-tight">Aset</span>
        </div>
      </div>

      {/* Main pricing & subscription section */}
      <div className="ml-auto py-16 space-y-8 max-w-md w-full font-medium">
        <div className="space-y-3">
          <h2 className="text-2xl md:text-3xl font-medium text-white leading-tight">
            Subscribe to {planKey}
          </h2>

          {/* Huge price display */}
          <div className="flex items-baseline pt-2">
            <span className="text-4xl md:text-5xl font-medium tracking-tight text-white">
              {currencySymbol}
              {totalPrice.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </span>
            <span className="text-zinc-400 text-sm ml-2 font-medium">
              {isYearly ? 'per year' : 'per month'}
            </span>
          </div>
        </div>

        {/* Currency switcher tabs */}
        <div className="space-y-2 font-medium">
          <div className="inline-flex rounded-xl bg-zinc-900 p-1 border border-zinc-800/80">
            <button
              onClick={() => setCurrency('INR')}
              className={`rounded-lg px-4 py-2 text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                isINR
                  ? 'bg-zinc-800 text-white shadow-xs'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <span>🇮🇳</span> INR
            </button>
            <button
              onClick={() => setCurrency('USD')}
              className={`rounded-lg px-4 py-2 text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                !isINR
                  ? 'bg-zinc-800 text-white shadow-xs'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <span>🇺🇸</span> USD
            </button>
          </div>
          <p className="text-[11px] text-zinc-500 font-medium">
            1 USD = 98.9776 INR. Exchange rates may vary.
          </p>
        </div>

        {/* Product Info Card (Simplified) */}
        <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-5 space-y-4 font-medium">
          <div className="flex items-center justify-between gap-4">
            <div className="space-y-1">
              <h4 className="text-sm text-zinc-150 font-medium">{planKey}</h4>
              <p className="text-xs text-indigo-400 font-medium">
                {storage} cloud storage
              </p>
            </div>
            <div className="text-right shrink-0">
              <span className="text-xs text-zinc-100 font-medium">
                {currencySymbol}
                {subtotal.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>
              <p className="text-[10px] text-zinc-500 font-medium">
                {isYearly ? 'yearly' : 'monthly'}
              </p>
            </div>
          </div>

          {/* Save toggle match */}
          <div className="pt-3 border-t border-zinc-800/80 flex items-center justify-between font-medium">
            <span className="text-xs text-zinc-300 flex items-center gap-1.5 font-medium">
              <Badge className="bg-emerald-500/15 hover:bg-emerald-500/15 text-emerald-400 border-none font-medium text-[9px] px-1.5 py-0.5 rounded-sm">
                Save ~20%
              </Badge>
              Annual billing
            </span>

            <button
              onClick={handleToggleCycle}
              className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                isYearly ? 'bg-indigo-500' : 'bg-zinc-800'
              }`}
            >
              <span
                className={`pointer-events-none inline-block size-4 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                  isYearly ? 'translate-x-4' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Pricing breakdown list */}
        <div className="space-y-3.5 text-xs text-zinc-400 pt-2 font-medium">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span className="text-zinc-200">
              {currencySymbol}
              {subtotal.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="flex items-center gap-1">
              Tax
              <Info className="size-3 text-zinc-500 cursor-help" />
            </span>
            <span className="text-zinc-200">
              {currencySymbol}
              {taxAmount.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </span>
          </div>

          {appliedCoupon && (
            <div className="flex justify-between text-emerald-400">
              <span className="flex items-center gap-1">
                <Ticket className="size-3.5" />
                Discount ({appliedCoupon.code} - {appliedCoupon.discountPercent}
                %)
              </span>
              <span>
                -{currencySymbol}
                {discountAmount.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>
            </div>
          )}

          <Separator className="bg-zinc-800" />

          <div className="flex justify-between items-baseline text-sm pt-1 font-medium">
            <span className="text-white">Total due today</span>
            <span className="text-xl text-white font-medium">
              {currencySymbol}
              {totalPrice.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
