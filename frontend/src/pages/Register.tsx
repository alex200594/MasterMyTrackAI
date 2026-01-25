import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../components/Button';
import { apiFetch } from '../lib/api';
import { setTokens } from '../lib/storage';

export default function Register() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    try {
      const data = await apiFetch<{ accessToken: string; refreshToken: string }>('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      setTokens(data.accessToken, data.refreshToken);
      navigate('/mastering');
    } catch (err) {
      setError('Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="px-6 py-16 max-w-md mx-auto">
      <h1 className="text-3xl font-bold">Create account</h1>
      <p className="text-slate-400 mt-2">Start mastering for free.</p>
      <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
        <input
          className="w-full rounded-lg bg-slate-900 border border-slate-800 px-4 py-2 text-white"
          placeholder="Email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          type="email"
          required
        />
        <input
          className="w-full rounded-lg bg-slate-900 border border-slate-800 px-4 py-2 text-white"
          placeholder="Password (min 8 chars)"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          type="password"
          required
          minLength={8}
        />
        {error && <p className="text-sm text-red-400">{error}</p>}
        <Button className="w-full" disabled={loading}>
          {loading ? 'Creating...' : 'Create account'}
        </Button>
      </form>
      <p className="text-sm text-slate-400 mt-4">
        Already have an account?{' '}
        <Link to="/login" className="text-brand-500">
          Login
        </Link>
      </p>
    </div>
  );
}
