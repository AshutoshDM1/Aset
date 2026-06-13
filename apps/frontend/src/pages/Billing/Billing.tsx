import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useUser } from '@clerk/react';
import ScrollSmoother from '@/shared/SmoothScroll/SmoothScroll';
import { toast } from 'sonner';
import { trpc, queryClient } from '@/utils/trpc';
import { PlanSummary } from './PlanSummary';
import { BillingForm } from './BillingForm';
import { TrialUsedDialog } from './TrialUsedDialog';
import { Loader2 } from 'lucide-react';

const BillingPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useUser();

  const [paymentSuccess, setPaymentSuccess] = useState(false);

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
    if (user) {
      setName(user.fullName || '');
      setEmail(user.primaryEmailAddress?.emailAddress || '');
    }
  }, [user]);

  // Fetch centralized pricing plans from tRPC
  const { data: plans, isPending: isPlansLoading } = useQuery(
    trpc.pricing.getPlans.queryOptions(),
  );

  // Fetch user storage details to check trial eligibility
  const { data: userData, isPending: isUserLoading } = useQuery({
    ...trpc.user.me.queryOptions(),
    enabled: !!user,
  });

  const rawPlan = searchParams.get('plan') || 'Pro plan';
  const billingCycle = (searchParams.get('cycle') || 'monthly') as
    | 'monthly'
    | 'yearly';
  const isYearly = billingCycle === 'yearly';

  const isTrial = rawPlan.toLowerCase() === 'trial';

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
    : plansList.find((p) => p.name.toLowerCase() === rawPlan.toLowerCase()) ||
      plansList.find((p) => p.isPro) ||
      plansList[0];

  const basePriceUSD = selectedPlan
    ? isYearly
      ? selectedPlan.yearlyPrice
      : selectedPlan.monthlyPrice
    : 0;

  // Currency logic: Mocking standard exchange rate: 1 USD = 98.9776 INR
  const exchangeRate = 98.9776;
  const isINR = currency === 'INR';
  const multiplier = isINR ? exchangeRate : 1;
  const currencySymbol = isINR ? '₹' : '$';

  const subtotal = basePriceUSD * multiplier;
  const taxPercent = 0; // Tax is always 0
  const taxAmount = subtotal * (taxPercent / 100);
  const totalWithTax = subtotal + taxAmount;

  // Calculate prices
  const discountPercent = appliedCoupon ? appliedCoupon.discountPercent : 0;
  const discountAmount = (totalWithTax * discountPercent) / 100;
  const totalPrice = Math.max(0, totalWithTax - discountAmount);

  // Toggle billing cycle state
  const handleToggleCycle = () => {
    const nextCycle = billingCycle === 'monthly' ? 'yearly' : 'monthly';
    const newParams = new URLSearchParams(searchParams);
    newParams.set('cycle', nextCycle);
    setSearchParams(newParams, { replace: true });
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
        navigate('/dashboard');
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
      navigate('/sign-in');
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

    const limitMb = selectedPlan.storageMb;
    upgradeStorage.mutate({ limitMb });
  };

  const isCheckoutLoading = upgradeStorage.isPending;

  if (isPlansLoading || (user && isUserLoading)) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col justify-center items-center text-zinc-400">
        <Loader2 className="size-8 animate-spin text-indigo-500 mb-2" />
        <p className="text-sm font-semibold">Loading checkout details...</p>
      </div>
    );
  }

  const hasUsedTrial = userData?.storage?.hasUsedTrial ?? false;
  const isEligibleForTrial = !hasUsedTrial;

  if (!selectedPlan) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col justify-center items-center text-zinc-400">
        <p className="text-sm font-semibold">
          Failed to resolve pricing details.
        </p>
      </div>
    );
  }

  return (
    <ScrollSmoother>
      <div className="min-h-screen bg-zinc-950 text-foreground flex flex-col justify-between">
        <div className="grid grid-cols-1 lg:grid-cols-2 min-h-screen w-full">
          <PlanSummary
            planKey={selectedPlan.name}
            storage={selectedPlan.storage}
            subtotal={subtotal}
            taxAmount={taxAmount}
            discountAmount={discountAmount}
            totalPrice={totalPrice}
            currency={currency}
            setCurrency={setCurrency}
            currencySymbol={currencySymbol}
            isYearly={isYearly}
            appliedCoupon={appliedCoupon}
            handleToggleCycle={handleToggleCycle}
            onBack={() => navigate('/pricing')}
          />
          <BillingForm
            email={email}
            setEmail={setEmail}
            name={name}
            setName={setName}
            country={country}
            setCountry={setCountry}
            couponInput={couponInput}
            setCouponInput={setCouponInput}
            appliedCoupon={appliedCoupon}
            handleApplyCoupon={handleApplyCoupon}
            handleRemoveCoupon={handleRemoveCoupon}
            isValidating={isValidating}
            isCheckoutLoading={isCheckoutLoading}
            paymentSuccess={paymentSuccess}
            totalPrice={totalPrice}
            currency={currency}
            handleCheckout={handleCheckout}
          />
        </div>

        {/* Trial Eligibility Used Modal */}
        <TrialUsedDialog
          isOpen={isTrial && !!user && !isEligibleForTrial}
          onClose={() => navigate('/pricing')}
        />
      </div>
    </ScrollSmoother>
  );
};

export default BillingPage;
