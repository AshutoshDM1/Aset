import { create } from 'zustand';

interface BillingStore {
  isPricingOpen: boolean;
  isBillingOpen: boolean;
  selectedPlanName: string;
  billingCycle: 'monthly' | 'yearly';

  openPricing: (cycle?: 'monthly' | 'yearly') => void;
  closePricing: () => void;
  openBilling: (planName: string, cycle?: 'monthly' | 'yearly') => void;
  closeBilling: () => void;
  setBillingCycle: (cycle: 'monthly' | 'yearly') => void;
}

export const useBillingStore = create<BillingStore>((set) => ({
  isPricingOpen: false,
  isBillingOpen: false,
  selectedPlanName: 'Pro plan',
  billingCycle: 'monthly',

  openPricing: (cycle = 'monthly') =>
    set({ isPricingOpen: true, isBillingOpen: false, billingCycle: cycle }),
  closePricing: () => set({ isPricingOpen: false }),
  openBilling: (planName, cycle = 'monthly') =>
    set({
      isBillingOpen: true,
      isPricingOpen: false,
      selectedPlanName: planName,
      billingCycle: cycle,
    }),
  closeBilling: () => set({ isBillingOpen: false }),
  setBillingCycle: (cycle) => set({ billingCycle: cycle }),
}));
