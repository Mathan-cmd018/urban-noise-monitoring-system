import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Radio, 
  MapPin, 
  Flame, 
  AlertTriangle, 
  BarChart3, 
  Scale, 
  Users 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Sidebar: React.FC = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'Admin';
  const isAuthority = user?.role === 'Authority' || isAdmin;

  const links = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, show: true },
    { to: '/stations', label: 'Monitoring Stations', icon: Radio, show: true },
    { to: '/map', label: 'Acoustic Map', icon: MapPin, show: true },
    { to: '/hotspots', label: 'Hotspot Analysis', icon: Flame, show: isAuthority },
    { to: '/complaints', label: 'Complaints', icon: AlertTriangle, show: true },
    { to: '/analytics', label: 'Analytics & Trends', icon: BarChart3, show: isAuthority },
    { to: '/regulations', label: 'Compliance Limits', icon: Scale, show: isAdmin },
    { to: '/users', label: 'User Directory', icon: Users, show: isAdmin },
  ];

  return (
    <aside className="w-64 border-r border-slate-800 bg-slate-900/60 flex flex-col p-4">
      <nav className="space-y-1">
        {links
          .filter((link) => link.show)
          .map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-sky-500/15 text-sky-400 border border-sky-500/30'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`
                }
              >
                <Icon className="w-4 h-4" />
                <span>{link.label}</span>
              </NavLink>
            );
          })}
      </nav>
    </aside>
  );
};
