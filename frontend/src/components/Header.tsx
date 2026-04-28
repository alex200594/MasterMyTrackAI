import { Link, NavLink, useLocation } from 'react-router-dom';
import { Button } from './Button';
import { getAccessToken, clearTokens } from '../lib/storage';

export function Header() {
  const isAuthed = Boolean(getAccessToken());
  const { pathname } = useLocation();

  if (pathname === '/') {
    return (
      <header className="sticky top-0 z-40 border-b border-black/10 bg-[#ececec]/90 backdrop-blur px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <a href="#top" className="text-lg font-black tracking-tight">
            MARTIN DELBECQ
          </a>
          <nav className="hidden md:flex items-center gap-6 text-sm font-semibold">
            <a href="#apropos" className="hover:opacity-65 transition">À propos</a>
            <a href="#projets" className="hover:opacity-65 transition">Projets</a>
            <a href="#contact" className="hover:opacity-65 transition">Contact</a>
          </nav>
          <a href="mailto:martindelbecq41@gmail.com" className="text-sm font-semibold border border-black rounded-full px-4 py-1.5 hover:bg-black hover:text-white transition">
            Me contacter
          </a>
        </div>
      </header>
    );
  }

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
