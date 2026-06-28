export interface PricingPlan {
  id: string;
  name: string;
  subtitle: string;
  storage: string;
  storageMb: number;
  monthlyPrice: number;
  yearlyPrice: number; // Total annual price in USD
  monthlyDiscountOriginal?: number;
  yearlyDiscountOriginal?: number;
  maxFileUploadSize: number;
  btnText: string;
  features: string[];
  isPro?: boolean;
  description: string;
}

export const PRICING_PLANS: PricingPlan[] = [
  {
    id: '31150500-345f-448d-8404-74206f1e9c73',
    name: 'Starter plan',
    subtitle: 'For individuals & new creators',
    storage: '1 GB secure',
    storageMb: 1 * 1024,
    monthlyPrice: 0,
    yearlyPrice: 0,
    btnText: 'Start Free',
    maxFileUploadSize: 200,
    description:
      'Starter plan is our standard free tier for safe personal storage.',
    features: [
      '1 GB secure cloud storage',
      'Basic file & folder sharing',
      'Max file upload size: 200 MB',
      'Community support',
    ],
  },
  {
    id: '687427d3-b43d-44f8-8361-4035ed1c1a4b',
    name: '15-day Free Trial',
    subtitle: 'Test drive Aset premium storage',
    storage: '20 GB high-speed',
    storageMb: 20 * 1024,
    monthlyPrice: 0,
    maxFileUploadSize: 2048,
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
    id: '52fbdb35-dc80-41ce-bf80-d6ee3779a82a',
    name: 'Pro plan',
    subtitle: 'For freelancers & small teams',
    storage: '500 GB high-speed',
    storageMb: 500 * 1024,
    monthlyPrice: 5,
    yearlyPrice: 50,
    maxFileUploadSize: 2048,
    monthlyDiscountOriginal: 10,
    yearlyDiscountOriginal: 58,
    btnText: 'Get Started',
    description:
      'Pro plan unlocks advanced collaboration tools, private cloud vaults, and faster upload speeds.',
    features: [
      '500 GB high-speed storage',
      'Everything in Starter +',
      'Max file upload size: 2 GB',
      'Multi-audio track & subtitle extraction',
      'Advanced team collaboration',
      'Priority email & chat support',
    ],
    isPro: true,
  },
  {
    id: 'ac966cc4-cb5a-49bf-bdfb-c3890a553136',
    name: 'Business plan',
    subtitle: 'For growing teams & agencies',
    storage: '1 TB premium',
    storageMb: 1024 * 1024,
    monthlyPrice: 20,
    maxFileUploadSize: 10024,
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
