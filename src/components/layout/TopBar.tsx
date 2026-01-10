import { useState, useEffect, useRef } from 'react';
import { useAuthStore } from '../../store/auth';
import { useLogout } from '../../hooks/useAuth';

export default function TopBar() {
  const user = useAuthStore((state) => state.user);
  const logoutMutation = useLogout();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Cerrar menú cuando se hace clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };

    if (showUserMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showUserMenu]);

  return (
    <header className="h-16 bg-gray-900/50 backdrop-blur-xl border-b border-purple-500/20 flex items-center justify-between px-8 relative z-40">
      {/* App Title */}
      <div className="flex-1">
        <h1 className="text-xl font-bold text-white">Gaming Dashboard</h1>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-4 ml-8">
        {/* Premium Coins Balance */}
        <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-500/10 to-amber-500/10 border border-yellow-500/30 rounded-lg">
          <span className="material-symbols-outlined text-yellow-500">
            payments
          </span>
          <div className="flex flex-col">
            <span className="text-xs text-gray-400">Balance</span>
            <span className="text-white font-bold">{user?.coins?.toLocaleString() || '0'} <span className="text-yellow-500">Coins</span></span>
          </div>
        </div>

        {/* Notifications */}
        <button className="relative p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition">
          <span className="material-symbols-outlined">notifications</span>
          <span className="absolute top-1 right-1 w-2 h-2 bg-pink-500 rounded-full animate-pulse" />
        </button>

        {/* User Menu */}
        <div className="relative z-50" ref={menuRef}>
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-sm font-bold">
              {user?.username?.charAt(0).toUpperCase() || 'U'}
            </div>
            <span className="material-symbols-outlined text-sm">
              {showUserMenu ? 'expand_less' : 'expand_more'}
            </span>
          </button>

          {/* Dropdown Menu */}
          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-gray-900 border border-purple-500/30 rounded-lg shadow-xl shadow-black/50 overflow-hidden z-[100]">
              <div className="p-3 border-b border-purple-500/20">
                <p className="text-white font-medium text-sm">{user?.username}</p>
                <p className="text-gray-400 text-xs truncate">{user?.email}</p>
                <p className="text-purple-400 text-xs mt-1">ID: {user?.id || 'N/A'}</p>
              </div>
              <div className="p-2">
                <div className="my-1 border-t border-purple-500/20" />
                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    logoutMutation.mutate();
                  }}
                  disabled={logoutMutation.isPending}
                  className="w-full flex items-center gap-3 px-3 py-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-md transition disabled:opacity-50"
                >
                  <span className="material-symbols-outlined text-lg">logout</span>
                  <span className="text-sm">
                    {logoutMutation.isPending ? 'Cerrando...' : 'Cerrar Sesión'}
                  </span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
