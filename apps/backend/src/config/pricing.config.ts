export interface PricingPlan {
  name: string;
  subtitle: string;
  storage: string;
  storageMb: number;
  monthlyPrice: number;
  yearlyPrice: number; // Total annual price in USD
  monthlyDiscountOriginal?: number;
  yearlyDiscountOriginal?: number;
  btnText: string;
  features: string[];
  isPro?: boolean;
  description: string;
}

export const PRICING_PLANS: PricingPlan[] = [
  {
    name: 'Starter plan',
    subtitle: 'For individuals & new creators',
    storage: '5 GB secure',
    storageMb: 5 * 1024,
    monthlyPrice: 0,
    yearlyPrice: 0,
    btnText: 'Start Free',
    description:
      'Starter plan is our standard free tier for safe personal storage.',
    features: [
      '5 GB secure cloud storage',
      'Basic file & folder sharing',
      'Max file upload size: 100 MB',
      'Standard collaboration tools',
      'Web-only dashboard access',
      'Community support',
    ],
  },
  {
    name: '15-day Free Trial',
    subtitle: 'Test drive Aset premium storage',
    storage: '20 GB high-speed',
    storageMb: 20 * 1024,
    monthlyPrice: 0,
    yearlyPrice: 0,
    btnText: 'Start Trial',
    description: 'Enjoy 20 GB of secure high-speed storage for 15 days.',
    features: [
      '20 GB secure cloud storage',
      'Basic file & folder sharing',
      'Max file upload size: 2 GB',
      'Standard collaboration tools',
      'Community support',
    ],
  },
  {
    name: 'Pro plan',
    subtitle: 'For freelancers & small teams',
    storage: '500 GB high-speed',
    storageMb: 500 * 1024,
    monthlyPrice: 5,
    yearlyPrice: 50,
    monthlyDiscountOriginal: 10,
    yearlyDiscountOriginal: 58,
    btnText: 'Get Started',
    description:
      'Pro plan unlocks advanced collaboration tools, private cloud vaults, and faster upload speeds.',
    features: [
      '500 GB high-speed storage',
      'Everything in Starter +',
      'Max file upload size: 2 GB',
      'Password-protected shared links',
      'Advanced team collaboration',
      'Priority email & chat support',
    ],
    isPro: true,
  },
  {
    name: 'Business plan',
    subtitle: 'For growing teams & agencies',
    storage: '1 TB premium',
    storageMb: 1024 * 1024,
    monthlyPrice: 20,
    yearlyPrice: 16 * 12, // $192 total
    monthlyDiscountOriginal: 25,
    yearlyDiscountOriginal: 240, // Original yearly total at monthly rate: 20 * 12 = 240
    btnText: 'Contact Us',
    description:
      'Business plan unlocks uncapped upload speeds, dedicated priority support, and infinite nested shares.',
    features: [
      '1 TB premium cloud storage',
      'Everything in Pro +',
      'Unlimited file upload size',
      'Granular access control & roles',
      'Shared team workspaces',
      'Dedicated 24/7 priority support',
    ],
  },
];
