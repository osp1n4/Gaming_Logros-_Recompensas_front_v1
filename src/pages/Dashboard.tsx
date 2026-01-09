import { useAuthStore } from '../store/auth';
import { useLogout } from '../hooks/useAuth';

export default function Dashboard() {
  const user = useAuthStore((state) => state.user);
  const logoutMutation = useLogout();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
              Dashboard
            </h1>
            <p className="text-gray-400 mt-2">
              Bienvenido, <span className="text-purple-300 font-semibold">{user?.username}</span>
            </p>
          </div>
          <button
            onClick={() => logoutMutation.mutate()}
            disabled={logoutMutation.isPending}
            className="px-6 py-2 bg-red-500 hover:bg-red-600 disabled:bg-gray-600 text-white rounded-lg transition"
          >
            {logoutMutation.isPending ? 'Cerrando...' : 'Cerrar Sesión'}
          </button>
        </div>

        {/* Content */}
        <div className="bg-gray-800 rounded-xl border border-purple-500/20 p-8">
          <h2 className="text-2xl font-bold text-white mb-4">Información del Usuario</h2>
          <div className="space-y-3 text-gray-300">
            <p><span className="font-semibold text-purple-400">ID:</span> {user?.id}</p>
            <p><span className="font-semibold text-purple-400">Username:</span> {user?.username}</p>
            <p><span className="font-semibold text-purple-400">Email:</span> {user?.email}</p>
            <p><span className="font-semibold text-purple-400">Registrado:</span> {new Date(user?.createdAt || '').toLocaleDateString()}</p>
          </div>
          
          <div className="mt-8 p-4 bg-purple-500/10 border border-purple-500/30 rounded-lg">
            <p className="text-sm text-gray-400">
              🎮 Esta es la pantalla del Dashboard (Fase 2). Los widgets, estadísticas y eventos se implementarán en la siguiente fase.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
