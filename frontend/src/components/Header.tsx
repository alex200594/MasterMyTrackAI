import { Link, NavLink } from 'react-router-dom';
import { Button } from './Button';
import { getAccessToken, clearTokens } from '../lib/storage';

export function Header() {
  const isAuthed = Boolean(getAccessToken());

  return (
    <header className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/80 backdrop-blur">
      <Link to="/" className="text-xl font-semibold text-white">
        MasterMyTrack.ai
      </Link>
      <nav className="flex items-center gap-6 text-sm text-slate-200">
        <NavLink to="/mastering" className="hover:text-white">
          Mastering
        </NavLink>
        <NavLink to="/pricing" className="hover:text-white">
          Pricing
        </NavLink>
        <NavLink to="/dashboard" className="hover:text-white">
          Dashboard
        </NavLink>
      </nav>
      <div className="flex items-center gap-3">
        {isAuthed ? (
          <Button
            variant="ghost"
            onClick={() => {
              clearTokens();
              window.location.href = '/';
            }}
          >
            Logout
          </Button>
        ) : (
          <>
            <Link to="/login" className="text-sm text-slate-200 hover:text-white">
              Login
            </Link>
            <Link to="/register">
              <Button>Get Started</Button>
            </Link>
          </>
        )}
      </div>
    </header>
  );
}
