import React from 'react';
import { ShieldCheck, Loader2, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface BillingFormProps {
  email: string;
  setEmail: (e: string) => void;
  name: string;
  setName: (n: string) => void;
  country: string;
  setCountry: (c: string) => void;
  couponInput: string;
  setCouponInput: (c: string) => void;
  appliedCoupon: { code: string; discountPercent: number } | null;
  handleApplyCoupon: () => void;
  handleRemoveCoupon: () => void;
  isValidating: boolean;
  isCheckoutLoading: boolean;
  paymentSuccess: boolean;
  totalPrice: number;
  currency: 'INR' | 'USD';
  handleCheckout: (e: React.FormEvent) => void;
}

export const BillingForm: React.FC<BillingFormProps> = ({
  email,
  setEmail,
  name,
  setName,
  country,
  setCountry,
  couponInput,
  setCouponInput,
  appliedCoupon,
  handleApplyCoupon,
  handleRemoveCoupon,
  isValidating,
  isCheckoutLoading,
  paymentSuccess,
  totalPrice,
  currency,
  handleCheckout,
}) => {
  return (
    <div className="bg-white dark:bg-zinc-955 text-zinc-900 dark:text-zinc-100 flex flex-col justify-between p-8 md:p-12 lg:p-16 lg:min-h-screen">
      <div className="my-auto py-10 max-w-md w-full mx-auto space-y-8">
        {paymentSuccess ? (
          <div className="flex flex-col items-center justify-center py-12 text-center space-y-4">
            <div className="size-16 rounded-full bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-500 flex items-center justify-center animate-bounce">
              <ShieldCheck className="size-10 stroke-2" />
            </div>
            <h3 className="text-2xl font-bold text-zinc-900 dark:text-white tracking-tight">
              Upgrade Confirmed!
            </h3>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-xs leading-relaxed font-semibold">
              Your vault capacity has been successfully expanded. Redirecting to
              your dashboard...
            </p>
          </div>
        ) : (
          <form onSubmit={handleCheckout} className="space-y-6">
            <div className="space-y-2">
              <h3 className="text-lg font-bold text-zinc-800 dark:text-zinc-200">
                Billing Information
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 font-semibold leading-relaxed">
                Please enter your contact details. Payment processors are
                currently locked. Use a discount code to activate your storage
                upgrade.
              </p>
            </div>

            {/* Standard Billing Input Fields */}
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label
                  htmlFor="billing-email"
                  className="text-xs font-bold text-zinc-550 dark:text-zinc-450 uppercase tracking-wider"
                >
                  Email Address
                </Label>
                <Input
                  id="billing-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isCheckoutLoading}
                  placeholder="name@email.com"
                  className="rounded-xl border-zinc-200 dark:border-zinc-800 bg-white/40 dark:bg-zinc-900/40 text-sm py-2.5 focus:ring-primary focus:border-primary placeholder-zinc-350 dark:placeholder-zinc-650"
                />
              </div>

              <div className="space-y-1.5">
                <Label
                  htmlFor="billing-name"
                  className="text-xs font-bold text-zinc-550 dark:text-zinc-450 uppercase tracking-wider"
                >
                  Full Name
                </Label>
                <Input
                  id="billing-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  disabled={isCheckoutLoading}
                  placeholder="Full Name"
                  className="rounded-xl border-zinc-200 dark:border-zinc-800 bg-white/40 dark:bg-zinc-900/40 text-sm py-2.5 focus:ring-primary focus:border-primary placeholder-zinc-350 dark:placeholder-zinc-650"
                />
              </div>

              <div className="space-y-1.5">
                <Label
                  htmlFor="billing-country"
                  className="text-xs font-bold text-zinc-550 dark:text-zinc-450 uppercase tracking-wider"
                >
                  Country or Region
                </Label>
                <Input
                  id="billing-country"
                  type="text"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  required
                  disabled={isCheckoutLoading}
                  placeholder="United States"
                  className="rounded-xl border-zinc-200 dark:border-zinc-800 bg-white/40 dark:bg-zinc-900/40 text-sm py-2.5 focus:ring-primary focus:border-primary placeholder-zinc-350 dark:placeholder-zinc-650"
                />
              </div>
            </div>

            {/* Coupon Code Section */}
            <div className="space-y-2.5 pt-2">
              <Label
                htmlFor="coupon-code"
                className="text-xs font-bold text-zinc-550 dark:text-zinc-455 uppercase tracking-wider"
              >
                Promo Code
              </Label>

              {!appliedCoupon ? (
                <div className="flex gap-2">
                  <Input
                    id="coupon-code"
                    placeholder="e.g. FREE100"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value)}
                    disabled={isValidating || isCheckoutLoading}
                    className="rounded-xl border-zinc-200 dark:border-zinc-800 bg-white/40 dark:bg-zinc-900/40 text-xs py-2 focus:ring-primary focus:border-primary placeholder-zinc-350 dark:placeholder-zinc-600"
                  />
                  <Button
                    type="button"
                    onClick={handleApplyCoupon}
                    disabled={
                      isValidating || isCheckoutLoading || !couponInput.trim()
                    }
                    className="rounded-xl px-4 text-xs font-bold bg-zinc-950 hover:bg-zinc-900 dark:bg-zinc-100 dark:hover:bg-zinc-200 dark:text-zinc-950 text-white cursor-pointer shrink-0 transition-colors"
                  >
                    {isValidating ? (
                      <Loader2 className="size-3 animate-spin" />
                    ) : (
                      'Apply'
                    )}
                  </Button>
                </div>
              ) : (
                <div className="flex items-center justify-between bg-emerald-500/10 dark:bg-emerald-500/20 border border-emerald-500/25 p-3.5 rounded-xl">
                  <div className="flex items-center gap-2.5">
                    <Check className="size-4 text-emerald-500" />
                    <div className="space-y-0.5">
                      <p className="text-xs font-bold text-zinc-900 dark:text-white uppercase tracking-wider">
                        {appliedCoupon.code} Applied
                      </p>
                      <p className="text-[10px] text-zinc-500 dark:text-zinc-400 font-semibold">
                        Enjoy {appliedCoupon.discountPercent}% off your order
                        total
                      </p>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleRemoveCoupon}
                    disabled={isCheckoutLoading}
                    className="text-xs text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 cursor-pointer h-7 px-2 font-bold"
                  >
                    Remove
                  </Button>
                </div>
              )}
            </div>

            {/* Submit checkout block */}
            <div className="space-y-4 pt-4">
              <Button
                type="submit"
                disabled={isCheckoutLoading || paymentSuccess}
                className={`w-full text-sm font-bold rounded-xl py-6 transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer ${
                  totalPrice > 0
                    ? 'bg-zinc-100 hover:bg-zinc-100 dark:bg-zinc-800 dark:hover:bg-zinc-800 text-zinc-400 dark:text-zinc-500 cursor-not-allowed'
                    : 'bg-zinc-950 hover:bg-zinc-900 dark:bg-zinc-100 dark:hover:bg-zinc-200 dark:text-zinc-950 text-white shadow-md'
                }`}
              >
                {isCheckoutLoading ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Processing...
                  </>
                ) : totalPrice > 0 ? (
                  'Subscribe'
                ) : (
                  'Subscribe'
                )}
              </Button>

              <p className="text-[10px] text-zinc-450 dark:text-zinc-500 leading-relaxed font-semibold text-center">
                By subscribing, you authorize Aset to charge you in {currency}{' '}
                at the displayed exchange rate or the exchange rate at the time
                of billing, according to the terms until you cancel.
              </p>
            </div>

            {/* Pay with Dodo Payment note */}
            <div className="pt-2 text-center">
              <span className="text-[11px] text-zinc-400 hover:text-zinc-650 dark:hover:text-zinc-200 font-bold transition-colors select-none cursor-pointer">
                Pay with Dodo Payment (coming soon)
              </span>
            </div>
          </form>
        )}
      </div>

      {/* Footer matching Stripe checkout */}
      <div className="flex items-center justify-center gap-4 text-[10px] text-zinc-450 dark:text-zinc-550 font-bold pt-10">
        <span className="text-zinc-500 dark:text-zinc-400">
          Powered by Aset
        </span>
        <span>•</span>
        <a href="#" className="hover:text-zinc-700 dark:hover:text-zinc-300">
          Terms
        </a>
        <span>•</span>
        <a href="#" className="hover:text-zinc-700 dark:hover:text-zinc-300">
          Privacy
        </a>
      </div>
    </div>
  );
};
