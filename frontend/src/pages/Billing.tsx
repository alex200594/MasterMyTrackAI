import { useQuery } from '@tanstack/react-query';
import { Button } from '../components/Button';
import { apiFetch } from '../lib/api';

interface BillingStatus {
  isPremium: boolean;
  currentPeriodEnd: string | null;
}

export default function Billing() {
  const { data, refetch } = useQuery<BillingStatus>({
    queryKey: ['billing'],
    queryFn: () => apiFetch('/api/billing/status')
  });

  const handleCheckout = async () => {
    const response = await apiFetch<{ url: string }>('/api/billing/create-checkout-session', {
      method: 'POST'
    });
    window.location.href = response.url;
  };

  return (
    <div className="px-6 py-16 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold">Billing</h1>
      <p className="text-slate-400 mt-2">Manage your premium subscription.</p>
      <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-400">Status</p>
            <p className="text-xl font-semibold text-white">
              {data?.isPremium ? 'Premium active' : 'Free plan'}
            </p>
            {data?.currentPeriodEnd && (
              <p className="text-sm text-slate-400 mt-1">
                Renews on {new Date(data.currentPeriodEnd).toLocaleDateString()}
              </p>
            )}
          </div>
          <Button onClick={handleCheckout}>{data?.isPremium ? 'Manage' : 'Upgrade to Premium'}</Button>
        </div>
        <Button variant="ghost" className="mt-4" onClick={() => refetch()}>
          Refresh status
        </Button>
      </div>
    </div>
  );
}
