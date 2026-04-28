import { useLocation } from 'react-router-dom';

export function Footer() {
  const { pathname } = useLocation();

  if (pathname === '/') {
    return (
      <footer className="px-6 pb-8 text-sm text-zinc-600 bg-[#ececec]">
        <div className="max-w-7xl mx-auto flex flex-col gap-1 md:flex-row md:items-center md:justify-between border-t border-black/10 pt-6">
          <span>© 2026 Martin Delbecq</span>
          <span>Portfolio créatif — illustration, animation et 3D</span>
        </div>
      </footer>
    );
  }

  return (
    <footer className="border-t border-slate-800 px-6 py-6 text-sm text-slate-400">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <span>© 2024 MasterMyTrack.ai</span>
        <span>Mastering AI for creators • Secure uploads • Premium streaming loudness</span>
      </div>
    </footer>
  );
}
