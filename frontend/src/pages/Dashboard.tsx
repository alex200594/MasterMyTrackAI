import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '../components/Button';
import { apiFetch, apiFetchBlob } from '../lib/api';

interface MasterItem {
  id: string;
  status: string;
  style: string;
  createdAt: string;
  duration: number;
  filename: string;
  urls: { original: string; master: string | null; download: string | null };
}

export default function Dashboard() {
  const queryClient = useQueryClient();
  const { data } = useQuery<{ data: MasterItem[] }>({
    queryKey: ['masters'],
    queryFn: () => apiFetch('/api/masters')
  });
  const { data: billing } = useQuery<{ isPremium: boolean; currentPeriodEnd: string | null }>({
    queryKey: ['billing'],
    queryFn: () => apiFetch('/api/billing/status')
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiFetch(`/api/masters/${id}`, { method: 'DELETE' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['masters'] })
  });

  const handleDownload = async (master: MasterItem) => {
    if (!master.urls.download) return;
    const blob = await apiFetchBlob(master.urls.download);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${master.filename.replace(/\.[^/.]+$/, '')}-MASTER-${master.style.replace(/\s+/g, '-')}.wav`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="px-6 py-12 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold">Dashboard</h1>
      <p className="text-slate-400 mt-2">Your mastering history and downloads.</p>
      <div className="mt-4 text-sm text-slate-300">
        Subscription: {billing?.isPremium ? 'Premium active' : 'Free'}
        {billing?.currentPeriodEnd && (
          <span className="text-slate-500"> • Renews {new Date(billing.currentPeriodEnd).toLocaleDateString()}</span>
        )}
      </div>

      <div className="mt-6 space-y-4">
        {data?.data.map((master) => (
          <div key={master.id} className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="font-semibold text-white">{master.filename}</h2>
                <p className="text-sm text-slate-400">
                  {new Date(master.createdAt).toLocaleString()} • {master.style} • {master.status}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="secondary"
                  onClick={() => handleDownload(master)}
                  disabled={!master.urls.download}
                >
                  Download
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => deleteMutation.mutate(master.id)}
                  disabled={deleteMutation.isPending}
                >
                  Delete
                </Button>
              </div>
            </div>
          </div>
        ))}
        {data?.data.length === 0 && (
          <p className="text-slate-400">No masters yet. Create one in the Mastering page.</p>
        )}
      </div>
    </div>
  );
}
