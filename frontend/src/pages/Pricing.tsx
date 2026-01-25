import { Link } from 'react-router-dom';
import { Button } from '../components/Button';

export default function Pricing() {
  return (
    <div className="px-6 py-16 max-w-5xl mx-auto">
      <h1 className="text-4xl font-bold text-white">Pricing</h1>
      <p className="text-slate-400 mt-3">Choose a plan that fits your mastering workflow.</p>
      <div className="grid gap-6 mt-10 md:grid-cols-2">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
          <h2 className="text-xl font-semibold">Free</h2>
          <p className="text-3xl font-bold mt-2">€0</p>
          <ul className="mt-4 space-y-2 text-sm text-slate-300">
            <li>3 mastering styles</li>
            <li>Upload up to 100MB</li>
            <li>History dashboard</li>
          </ul>
          <Link to="/register" className="mt-6 inline-block">
            <Button variant="secondary">Start Free</Button>
          </Link>
        </div>
        <div className="rounded-2xl border border-brand-500/60 bg-brand-500/10 p-6">
          <h2 className="text-xl font-semibold">Premium</h2>
          <p className="text-3xl font-bold mt-2">€4<span className="text-base text-slate-300">/mois</span></p>
          <ul className="mt-4 space-y-2 text-sm text-slate-200">
            <li>All premium styles</li>
            <li>Advanced loudness targets</li>
            <li>Priority mastering queue</li>
          </ul>
          <Link to="/billing" className="mt-6 inline-block">
            <Button>Passer Premium</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
