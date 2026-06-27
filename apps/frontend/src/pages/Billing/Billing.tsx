import { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router';
import { useBillingStore } from '@/store/billingStore';
import { Loader2 } from 'lucide-react';

const BillingPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const openBilling = useBillingStore((state) => state.openBilling);

  useEffect(() => {
    const plan = searchParams.get('plan') || 'Pro plan';
    const cycle = (searchParams.get('cycle') || 'monthly') as
      | 'monthly'
      | 'yearly';

    // Launch billing dialog globally
    openBilling(plan, cycle);

    // Redirect user to the dashboard
    navigate('/dashboard/my-files', { replace: true });
  }, [searchParams, navigate, openBilling]);

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col justify-center items-center text-zinc-400">
      <Loader2 className="size-8 animate-spin text-indigo-500 mb-2" />
      <p className="text-xs font-semibold">Redirecting to checkout...</p>
    </div>
  );
};

export default BillingPage;
