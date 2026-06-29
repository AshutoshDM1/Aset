import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useUser } from '@clerk/react';
import { toast } from 'sonner';
import {
  ArrowBigLeftDash,
  ArrowLeft,
  Check,
  ChevronRight,
  Loader,
  Loader2,
  ShieldCheck,
  Ticket,
  X,
} from 'lucide-react';

import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { trpc, queryClient } from '@/utils/trpc';
import { useBillingStore } from '../../store/billingStore';
import { cn } from '@/lib/utils';

export const BillingDailog: React.FC = () => {
  const {
    isBillingOpen,
    closeBilling,
    openPricing,
    selectedPlanName,
    billingCycle,
    setBillingCycle,
  } = useBillingStore();

  const { user } = useUser();
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [step, setStep] = useState<1 | 2>(1);

  // Currency state
  const [currency, setCurrency] = useState<'INR' | 'USD'>('USD');

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [country, setCountry] = useState('United States');

  // Coupon states
  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    discountPercent: number;
  } | null>(null);

  // Auto-fill from Clerk
  useEffect(() => {
    if (user && isBillingOpen) {
      setName(user.fullName || '');
      setEmail(user.primaryEmailAddress?.emailAddress || '');
    }
  }, [user, isBillingOpen]);

  // Reset states when dialog opens/closes
  useEffect(() => {
    if (!isBillingOpen) {
      setPaymentSuccess(false);
      setAppliedCoupon(null);
      setCouponInput('');
      setStep(1);
    } else {
      setStep(1);
    }
  }, [isBillingOpen]);

  // Fetch centralized pricing plans from tRPC
  const { data: plans, isPending: isPlansLoading } = useQuery({
    ...trpc.pricing.getPlans.queryOptions(),
    enabled: isBillingOpen,
  });

  // Fetch user storage details to check trial eligibility
  const { data: userData } = useQuery({
    ...trpc.user.me.queryOptions(),
    enabled: !!user && isBillingOpen,
  });

  const isYearly = billingCycle === 'yearly';
  const isTrial = selectedPlanName.toLowerCase() === 'trial';

  // Normalize selected plan
  const plansList = plans || [];
  const selectedPlan = isTrial
    ? {
        name: '15-day Free Trial',
        subtitle: 'Test drive Aset premium storage',
        storage: '20 GB high-speed',
        storageMb: 20 * 1024,
        monthlyPrice: 0,
        yearlyPrice: 0,
        btnText: 'Start Trial',
        description: 'Enjoy 20 GB of secure high-speed storage for 15 days.',
        features: [
          '20 GB secure high-speed storage',
          'Full premium sharing capabilities',
          'No credit card required',
          'One-time trial per user account',
        ],
      }
    : plansList.find(
        (p) => p.name.toLowerCase() === selectedPlanName.toLowerCase(),
      ) ||
      plansList.find((p) => p.isPro) ||
      plansList[0];

  const basePriceUSD = selectedPlan
    ? isYearly
      ? selectedPlan.yearlyPrice
      : selectedPlan.monthlyPrice
    : 0;

  // Currency logic
  const exchangeRate = 98.9776;
  const isINR = currency === 'INR';
  const multiplier = isINR ? exchangeRate : 1;
  const currencySymbol = isINR ? '₹' : '$';

  const subtotal = basePriceUSD * multiplier;
  const taxPercent = 0;
  const taxAmount = subtotal * (taxPercent / 100);
  const totalWithTax = subtotal + taxAmount;

  // Calculate prices
  const discountPercent = appliedCoupon ? appliedCoupon.discountPercent : 0;
  const discountAmount = (totalWithTax * discountPercent) / 100;
  const totalPrice = Math.max(0, totalWithTax - discountAmount);

  // Toggle billing cycle state
  const handleToggleCycle = () => {
    setBillingCycle(billingCycle === 'monthly' ? 'yearly' : 'monthly');
  };

  // tRPC Coupon Query
  const { refetch: validateCoupon, isFetching: isValidating } = useQuery({
    ...trpc.coupon.validate.queryOptions({ code: couponInput }),
    enabled: false,
  });

  // tRPC Storage Mutation
  const upgradeStorage = useMutation({
    ...trpc.user.updateStorageLimit.mutationOptions(),
    onSuccess: () => {
      void queryClient.invalidateQueries(trpc.user.me.queryFilter());
      toast.success(
        isTrial
          ? 'Free trial activated successfully!'
          : 'Subscription activated successfully!',
      );
      setPaymentSuccess(true);
      setTimeout(() => {
        closeBilling();
      }, 2500);
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to update plan.');
    },
  });

  const handleApplyCoupon = async () => {
    const code = couponInput.trim();
    if (!code) {
      toast.error('Please enter a coupon code.');
      return;
    }

    try {
      const { data: coupon, error } = await validateCoupon();
      if (error) {
        toast.error(error.message || 'Invalid coupon code.');
        setAppliedCoupon(null);
        return;
      }
      if (coupon) {
        setAppliedCoupon(coupon);
        toast.success(
          `Coupon "${coupon.code}" applied! ${coupon.discountPercent}% discount.`,
        );
      } else {
        toast.error('Invalid coupon code.');
        setAppliedCoupon(null);
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to validate coupon.');
      setAppliedCoupon(null);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponInput('');
    toast.info('Coupon code removed.');
  };

  const handleCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error('Please sign in to complete checkout.');
      return;
    }

    if (!name || !email) {
      toast.error('Please fill in all contact details.');
      return;
    }

    if (totalPrice > 0) {
      toast.error(
        'Payment processing is currently locked. Use a 100% discount coupon to proceed.',
      );
      return;
    }

    if (!selectedPlan) {
      toast.error('Selected plan not loaded.');
      return;
    }

    let planId: 'free' | 'trial' | 'pro' | 'business' = 'free';
    const limitMb = selectedPlan.storageMb;
    if (limitMb === 20 * 1024) planId = 'trial';
    else if (limitMb === 500 * 1024) planId = 'pro';
    else if (limitMb === 1024 * 1024) planId = 'business';

    upgradeStorage.mutate({ planId });
  };

  const isCheckoutLoading = upgradeStorage.isPending;
  const hasUsedTrial = userData?.storage?.hasUsedTrial ?? false;
  const isEligibleForTrial = !hasUsedTrial;

  if (!isBillingOpen) return null;
  if (isPlansLoading) {
    return (
      <Dialog
        open={isBillingOpen}
        onOpenChange={(open) => !open && closeBilling()}
      >
        <DialogContent className="max-w-md p-8 flex flex-col items-center justify-center text-muted-foreground rounded-3xl border border-border bg-background">
          <Loader2 className="size-8 animate-spin text-primary mb-2" />
          <p className="text-xs font-semibold">Loading checkout details...</p>
        </DialogContent>
      </Dialog>
    );
  }

  if (isTrial && !isEligibleForTrial) {
    return (
      <Dialog
        open={isBillingOpen}
        onOpenChange={(open) => !open && closeBilling()}
      >
        <DialogContent className="max-w-md p-6 flex flex-col items-center text-center space-y-4 rounded-3xl border border-border bg-background">
          <div className="size-12 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center">
            <X className="size-6 stroke-2" />
          </div>
          <h3 className="text-base font-normal text-foreground">
            Trial Not Available
          </h3>
          <p className="text-xs text-muted-foreground font-semibold leading-relaxed">
            You have already redeemed your 15-day free trial on this account.
            Please select one of our premium plans to upgrade your vault.
          </p>
          <Button
            onClick={() => openPricing()}
            className="rounded-xl px-4 py-2 text-xs font-normal bg-primary hover:bg-primary/90 text-primary-foreground cursor-pointer"
          >
            View Pricing Plans
          </Button>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog
      open={isBillingOpen}
      onOpenChange={(open) => !open && closeBilling()}
    >
      <DialogContent
        className="p-0 overflow-hidden flex flex-col md:flex-row rounded-3xl border border-border bg-background shadow-2xl w-[calc(100vw-2rem)] md:max-w-3xl max-h-[90vh] md:max-h-[85vh] gap-0"
        showCloseButton={false}
      >
        {/* Left Side: Summary Panel */}
        <div
          className={cn(
            'md:w-1/2 bg-muted/30 p-6 md:p-8 flex flex-col justify-between select-none',
            step !== 1 && 'hidden md:flex',
          )}
        >
          <div className="space-y-6">
            {/* Back to plans trigger */}
            <button
              onClick={() => openPricing()}
              className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors cursor-pointer group text-xs font-normal"
            >
              <ArrowBigLeftDash className="size-3.5 transition-transform group-hover:-translate-x-0.5" />
              Back
            </button>

            {/* Plan Info */}
            <div className="space-y-3">
              <h3 className="text-xl font-medium text-foreground">
                {selectedPlan?.name}
              </h3>
              <p className="text-sm">{selectedPlan?.storage} cloud storage</p>
            </div>

            {/* Currency Selector */}
            <div className="space-y-1.5">
              <div className="inline-flex rounded-xl bg-muted/80 p-0.5 border border-border">
                <button
                  onClick={() => setCurrency('INR')}
                  className={`rounded-lg px-3 py-1 text-[10px] font-normal transition-all cursor-pointer flex items-center gap-1 ${
                    isINR
                      ? 'bg-background text-foreground shadow-xs'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  INR
                </button>
                <button
                  onClick={() => setCurrency('USD')}
                  className={`rounded-lg px-3 py-1 text-[10px] font-normal transition-all cursor-pointer flex items-center gap-1 ${
                    !isINR
                      ? 'bg-background text-foreground shadow-xs'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  USD
                </button>
              </div>
            </div>

            {/* Total Display */}
            <div className="flex items-baseline py-2">
              <span className="text-3xl text-foreground tracking-tight">
                {currencySymbol}
                {totalPrice.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>
              <span className="text-muted-foreground text-[10px] font-normal ml-1.5">
                {isYearly ? 'due yearly' : 'due monthly'}
              </span>
            </div>

            {/* Switch Billing Cycle (only if not free trial) */}
            {!isTrial && (
              <div className="flex items-center justify-between p-3 rounded-2xl border border-border/50 bg-card/40">
                <span className="text-xs text-muted-foreground font-normal flex items-center gap-1.5">
                  <Badge className="bg-emerald-500/10 hover:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-none font-normal text-[9px] px-1.5 py-0.5 rounded-sm">
                    Save ~20%
                  </Badge>
                  Annual Billing
                </span>
                <button
                  onClick={handleToggleCycle}
                  className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                    isYearly ? 'bg-primary' : 'bg-muted'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block size-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                      isYearly ? 'translate-x-4' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            )}
          </div>

          {/* Pricing Breakdown */}
          <div className="flex flex-col gap-4 pt-6 border-t border-border">
            <div className="space-y-2.5 text-xs font-semibold text-muted-foreground">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="text-foreground/90">
                  {currencySymbol}
                  {subtotal.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </span>
              </div>

              {appliedCoupon && (
                <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-normal">
                  <span className="flex items-center gap-1">
                    <Ticket className="size-3.5" />
                    Discount ({appliedCoupon.code})
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

              <Separator className="bg-border" />

              <div className="flex justify-between items-baseline text-xs pt-1">
                <span className="text-foreground/90 font-normal">
                  Total due today
                </span>
                <span className="text-base text-foreground font-medium">
                  {currencySymbol}
                  {totalPrice.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </span>
              </div>
            </div>

            {/* Mobile Continue Button */}
            <div className="md:hidden">
              <Button
                type="button"
                onClick={() => setStep(2)}
                className="w-full text-xs font-normal rounded-xl py-5 bg-primary hover:bg-primary/95 text-primary-foreground flex items-center justify-center gap-1.5 cursor-pointer"
              >
                Continue to Billing
                <ChevronRight className="size-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Right Side: Form / Success Panel */}
        <div
          className={cn(
            'md:w-1/2 p-6 md:p-8 flex flex-col justify-between border-t md:border-t-0 md:border-l border-border bg-background',
            step !== 2 && 'hidden md:flex',
          )}
        >
          {paymentSuccess ? (
            <div className="flex-1 flex flex-col items-center justify-center py-12 text-center space-y-4">
              <div className="size-14 rounded-full bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-500 flex items-center justify-center ">
                <ShieldCheck className="size-8 stroke-2" />
              </div>
              <h3 className="text-lg font-normal text-foreground tracking-tight">
                Upgrade Confirmed!
              </h3>
              <p className="text-xs text-muted-foreground max-w-[200px] leading-relaxed font-semibold">
                Your vault storage capacity has been expanded. Enjoy your
                upgrade!
              </p>
            </div>
          ) : (
            <form
              onSubmit={handleCheckout}
              className="flex-1 flex flex-col justify-between space-y-5"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="md:hidden text-muted-foreground hover:text-foreground p-1 rounded-md hover:bg-muted transition-colors cursor-pointer"
                      aria-label="Back to summary"
                    >
                      <ArrowLeft className="size-4" />
                    </button>
                    <h3 className="text-xs font-normal text-muted-foreground">
                      Billing Details
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={closeBilling}
                    className="text-muted-foreground hover:text-foreground rounded-lg p-1 hover:bg-muted"
                  >
                    <X className="size-4" />
                  </button>
                </div>

                <div className="space-y-3.5">
                  {/* Email */}
                  <div className="space-y-1">
                    <Label
                      htmlFor="dlg-email"
                      className="text-[10px] font-medium text-muted-foreground"
                    >
                      Email Address
                    </Label>
                    <Input
                      id="dlg-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      disabled={isCheckoutLoading}
                      placeholder="name@email.com"
                      className="rounded-xl border-border bg-card/45 text-xs py-2 focus:ring-primary focus:border-primary"
                    />
                  </div>

                  {/* Name */}
                  <div className="space-y-1">
                    <Label
                      htmlFor="dlg-name"
                      className="text-[10px] font-medium text-muted-foreground tracking-wider"
                    >
                      Full Name
                    </Label>
                    <Input
                      id="dlg-name"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      disabled={isCheckoutLoading}
                      placeholder="Full Name"
                      className="rounded-xl border-border bg-card/45 text-xs py-2 focus:ring-primary focus:border-primary"
                    />
                  </div>

                  {/* Country */}
                  <div className="space-y-1">
                    <Label
                      htmlFor="dlg-country"
                      className="text-[10px] font-medium text-muted-foreground tracking-wider"
                    >
                      Country or Region
                    </Label>
                    <Input
                      id="dlg-country"
                      type="text"
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      required
                      disabled={isCheckoutLoading}
                      placeholder="United States"
                      className="rounded-xl border-border bg-card/45 text-xs py-2 focus:ring-primary focus:border-primary"
                    />
                  </div>
                </div>

                {/* Promo Code Section */}
                <div className="space-y-1.5 pt-1.5">
                  <Label
                    htmlFor="dlg-coupon"
                    className="text-[10px] font-medium text-muted-foreground tracking-wider"
                  >
                    Promo Code
                  </Label>
                  {!appliedCoupon ? (
                    <div className="flex gap-2">
                      <Input
                        id="dlg-coupon"
                        placeholder="e.g. WELCOME50"
                        value={couponInput}
                        onChange={(e) => setCouponInput(e.target.value)}
                        disabled={isValidating || isCheckoutLoading}
                        className="rounded-xl border-border bg-card/45 text-xs py-2 focus:ring-primary focus:border-primary placeholder-zinc-350"
                      />
                      <Button
                        type="button"
                        onClick={handleApplyCoupon}
                        disabled={
                          isValidating ||
                          isCheckoutLoading ||
                          !couponInput.trim()
                        }
                        className="rounded-xl px-4 text-xs font-normal bg-foreground hover:bg-foreground/90 text-background cursor-pointer shrink-0 transition-colors"
                      >
                        {isValidating ? (
                          <Loader2 className="size-3 animate-spin" />
                        ) : (
                          'Apply'
                        )}
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between bg-emerald-500/5 border border-emerald-550/20 p-2.5 rounded-xl">
                      <div className="flex items-center gap-2">
                        <Check className="size-3.5 text-emerald-500 stroke-2" />
                        <div className="space-y-0.5">
                          <p className="text-[10px] font-normal text-foreground tracking-wider">
                            {appliedCoupon.code}
                          </p>
                          <p className="text-[9px] text-muted-foreground font-normal">
                            {appliedCoupon.discountPercent}% off
                          </p>
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={handleRemoveCoupon}
                        disabled={isCheckoutLoading}
                        className="text-[10px] text-muted-foreground hover:text-foreground cursor-pointer h-6 px-1.5 font-normal"
                      >
                        Remove
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              {/* Submit / Activate Plan button */}
              <div className="space-y-3 pt-4 border-t border-border">
                <Button
                  type="submit"
                  disabled={isCheckoutLoading || paymentSuccess}
                  className={`w-full text-xs font-normal rounded-xl py-5 transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer ${
                    totalPrice > 0
                      ? 'bg-muted hover:bg-muted text-muted-foreground cursor-not-allowed border border-border'
                      : 'bg-foreground hover:bg-foreground hover:opacity-80 text-background'
                  }`}
                >
                  {isCheckoutLoading ? (
                    <>
                      <Loader className="size-3.5 animate-spin" />
                      Activating plan...
                    </>
                  ) : totalPrice > 0 ? (
                    'Confirm'
                  ) : (
                    'Confirm'
                  )}
                </Button>

                {totalPrice > 0 ? (
                  <p className="hidden text-[9px] text-primary leading-relaxed font-semibold text-center select-none bg-amber-500/5 border border-amber-550/15 p-2 rounded-xl">
                    Payments are locked. Use a 100% discount promo code to
                    activate.
                  </p>
                ) : (
                  <p className="text-[9px] text-muted-foreground leading-relaxed font-semibold text-center select-none">
                    Confirm your details to activate your storage upgrade
                    instantly.
                  </p>
                )}
              </div>
            </form>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
