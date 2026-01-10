import DashboardLayout from '../components/layout/DashboardLayout';
import { useAuthStore } from '../store/auth';

export default function Dashboard() {
  const user = useAuthStore((state) => state.user);

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
          Panel Principal
        </h1>
        <p className="text-gray-400 mt-2">
          Bienvenido de nuevo, <span className="text-purple-300 font-semibold">{user?.username}</span>
        </p>
      </div>

      {/* Content */}
      <div className="bg-gray-800/50 backdrop-blur-xl rounded-xl border border-purple-500/20 p-8">
        <h2 className="text-2xl font-bold text-white mb-4">Información del Usuario</h2>
        <div className="space-y-3 text-gray-300">
          <p><span className="font-semibold text-purple-400">ID:</span> {user?.id}</p>
          <p><span className="font-semibold text-purple-400">Usuario:</span> {user?.username}</p>
          <p><span className="font-semibold text-purple-400">Correo:</span> {user?.email}</p>
          <p><span className="font-semibold text-purple-400">Registrado:</span> {new Date(user?.createdAt || '').toLocaleDateString('es-ES')}</p>
        </div>
        
        <div className="mt-8 p-4 bg-purple-500/10 border border-purple-500/30 rounded-lg">
          <p className="text-sm text-gray-400">
            🎮 Esta es la pantalla del Panel de Control con el nuevo layout. Los widgets, estadísticas y eventos se implementarán a continuación.
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
}
