import DashboardLayout from '../components/layout/DashboardLayout';
import { useAppNotifications } from '../hooks/useAppNotifications';

export default function Notifications() {
  const {
    success,
    info,
    error,
    notifyAchievementCompleted,
    notifyAchievementProgress,
    notifyDataSync
  } = useAppNotifications();

  const testNotifications = [
    {
      name: 'Notificación de Éxito',
      action: () => success('¡Operación completada exitosamente!', 'Éxito'),
      color: 'bg-green-600 hover:bg-green-700',
    },
    {
      name: 'Notificación de Info',
      action: () => info('Nueva información disponible', 'Información'),
      color: 'bg-blue-600 hover:bg-blue-700',
    },
    {
      name: 'Notificación de Error',
      action: () => error('Ha ocurrido un error', 'Error'),
      color: 'bg-red-600 hover:bg-red-700',
    },
    {
      name: 'Logro Completado',
      action: () => notifyAchievementCompleted('Has completado el logro "Primer Nivel"'),
      color: 'bg-purple-600 hover:bg-purple-700',
    },
    {
      name: 'Progreso de Logro',
      action: () => notifyAchievementProgress('Progreso: 7/10 victorias conseguidas'),
      color: 'bg-orange-600 hover:bg-orange-700',
    },
    {
      name: 'Sincronización de Datos',
      action: () => notifyDataSync('Datos sincronizados correctamente'),
      color: 'bg-teal-600 hover:bg-teal-700',
    },
  ];

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 mb-8">
          Sistema de Notificaciones
        </h1>

        {/* Demo Section */}
        <div className="bg-gray-800/50 rounded-xl border border-gray-700 p-6 mb-8">
          <h2 className="text-2xl font-semibold text-white mb-4">
            🧪 Demostración de Notificaciones
          </h2>
          <p className="text-gray-400 mb-6">
            Haz clic en cualquier botón para ver las notificaciones toast en acción:
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {testNotifications.map((notification) => (
              <button
                key={notification.name}
                onClick={notification.action}
                className={`${notification.color} text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 text-sm`}
              >
                {notification.name}
              </button>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
