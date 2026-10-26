import React from 'react';
import { Volume2, Bell, User as UserIcon, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <header className="h-16 border-b border-slate-800 bg-slate-900/90 backdrop-blur px-6 flex items-center justify-between sticky top-0 z-40">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-brand-500/10 border border-brand-500/20 rounded-lg text-brand-500">
          <Volume2 className="w-5 h-5 text-sky-400" />
        </div>
        <div>
          <h1 className="text-base font-bold text-slate-100 leading-tight">
            Urban Soundscape Monitoring
          </h1>
          <p className="text-xs text-slate-400">
            Municipal Environmental Intelligence
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800/80 border border-slate-700 text-xs text-slate-300">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>Simulation Active</span>
        </div>

        {user ? (
          <div className="flex items-center gap-3 pl-2 border-l border-slate-800">
            <div className="text-right">
              <div className="text-xs font-semibold text-slate-200">{user.name}</div>
              <div className="text-[10px] text-sky-400 uppercase tracking-wider font-mono">{user.role}</div>
            </div>
            <button
              onClick={logout}
              title="Sign Out"
              className="p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : null}
      </div>
    </header>
  );
};
