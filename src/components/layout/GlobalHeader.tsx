import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/auth';
import { NavigationBadge } from './NavigationIndicators';

export const GlobalHeader = () => {
  const { player, logout } = useAuthStore();

  return (
    <header className="sticky top-0 z-50 bg-background-dark/80 backdrop-blur-md border-b border-primary/20">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        {/* Logo */}
        <Link to="/dashboard" className="flex items-center gap-3">
          <div className="size-10 bg-primary rounded-xl shadow-[0_0_15px_rgba(134,64,231,0.5)] flex items-center justify-center">
            <span className="material-symbols-outlined text-white fill-1">
              sports_esports
            </span>
          </div>
          <h1 className="text-xl font-bold text-white">Gaming Hub</h1>
        </Link>

        {/* Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          <NavLink to="/dashboard" icon="dashboard" label="Panel Principal" />
          <NavLink to="/achievements" icon="emoji_events" label="Logros" />
          <NavLink to="/rewards" icon="card_giftcard" label="Recompensas" />
          <NavLink to="/leaderboard" icon="leaderboard" label="Clasificación" />
          <NavLink to="/notifications" icon="notifications" label="Notificaciones" />
        </nav>

        {/* User Info & Logout */}
        {player && (
          <div className="flex items-center gap-4">
            {/* Player Stats */}
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold leading-none">{player.username}</p>
              <div className="flex items-center gap-2 text-xs">
                <span className="text-yellow-400 flex items-center gap-1">
                  <span className="material-symbols-outlined text-xs">payments</span>
                  {player.coins || 0}
                </span>
                <span className="text-blue-400 flex items-center gap-1">
                  <span className="material-symbols-outlined text-xs">bolt</span>
                  {player.xp || 0} XP
                </span>
              </div>
            </div>
            
            {/* Simple Logout */}
            <button
              onClick={logout}
              className="flex items-center gap-2 px-3 py-1.5 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
              title="Cerrar sesión"
            >
              <span className="material-symbols-outlined text-lg">logout</span>
              <span className="hidden lg:block">Salir</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

// Componente NavLink activo
interface NavLinkProps {
  to: string;
  icon: string;
  label: string;
  badge?: {
    count: number;
    type?: 'info' | 'success' | 'warning' | 'error';
  };
}

const NavLink = ({ to, icon, label, badge }: NavLinkProps) => {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <Link
      to={to}
      className={`relative px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
        isActive
          ? 'text-primary bg-primary/10 border border-primary/30'
          : 'text-slate-400 hover:text-white hover:bg-white/5'
      }`}
    >
      <span className="flex items-center gap-2">
        <span className="material-symbols-outlined text-sm">{icon}</span>
        {label}
      </span>
      {badge && <NavigationBadge {...badge} />}
    </Link>
  );
};