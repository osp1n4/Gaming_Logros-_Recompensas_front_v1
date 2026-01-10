import { useQuery } from '@tanstack/react-query';
import { getPlayerBalance } from '../../services/reward.service';
import { useAuthStore } from '../../store/auth';

export default function MyBalance() {
  const user = useAuthStore((s) => s.user);
  const playerId = user?.player?.id;

  const { data: balance, isLoading } = useQuery({
    queryKey: ['balance', playerId],
    queryFn: () => getPlayerBalance(playerId!),
    enabled: !!playerId,
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-8 animate-pulse">
          <div className="h-8 bg-gray-700 rounded w-1/3 mb-4" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="space-y-3">
                <div className="h-12 bg-gray-700 rounded" />
                <div className="h-6 bg-gray-700 rounded w-2/3" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!balance) {
    return (
      <div className="text-center py-20">
        <span className="material-symbols-outlined text-gray-600 text-6xl mb-4">
          error_outline
        </span>
        <h3 className="text-white text-xl font-bold mb-2">Balance No Disponible</h3>
        <p className="text-gray-400">No se pudo cargar la información del balance</p>
      </div>
    );
  }

  const stats = [
    {
      label: 'Monedas Totales',
      value: balance.totalCoins.toLocaleString(),
      icon: 'payments',
      color: 'yellow',
      bgColor: 'bg-yellow-500/20',
      textColor: 'text-yellow-400',
      borderColor: 'border-yellow-500/50',
    },
    {
      label: 'XP Total',
      value: balance.totalXP.toLocaleString(),
      icon: 'bolt',
      color: 'purple',
      bgColor: 'bg-purple-500/20',
      textColor: 'text-purple-400',
      borderColor: 'border-purple-500/50',
    },
    {
      label: 'Nivel Actual',
      value: balance.level.toString(),
      icon: 'military_tech',
      color: 'blue',
      bgColor: 'bg-blue-500/20',
      textColor: 'text-blue-400',
      borderColor: 'border-blue-500/50',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-white text-2xl font-bold">Mi Balance</h2>
        <p className="text-gray-400 text-sm">
          Resumen de tus ganancias totales y progreso
        </p>
      </div>

      {/* Balance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className={`bg-gray-800/50 border-2 ${stat.borderColor} rounded-xl p-6 hover:shadow-lg transition-all`}
          >
            <div className={`${stat.bgColor} rounded-lg p-3 w-fit mb-4`}>
              <span className={`material-symbols-outlined ${stat.textColor} text-4xl`}>
                {stat.icon}
              </span>
            </div>
            <p className="text-gray-400 text-sm mb-2">{stat.label}</p>
            <p className={`${stat.textColor} text-4xl font-black`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Summary Section */}
      <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
        <h3 className="text-white text-xl font-bold mb-4">Resumen de Recompensas</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center justify-between p-4 bg-gray-900/50 rounded-lg">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-green-400">
                check_circle
              </span>
              <span className="text-gray-400">Recompensas Reclamadas</span>
            </div>
            <span className="text-white font-bold text-lg">
              {balance.claimedRewardsCount}
            </span>
          </div>
          <div className="flex items-center justify-between p-4 bg-gray-900/50 rounded-lg">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-purple-400">
                inbox
              </span>
              <span className="text-gray-400">Recompensas Pendientes</span>
            </div>
            <span className="text-white font-bold text-lg">
              {balance.assignedRewardsCount}
            </span>
          </div>
        </div>
      </div>

      {/* Progress Indicator */}
      <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-xl p-6">
        <div className="flex items-center gap-4">
          <span className="material-symbols-outlined text-purple-400 text-5xl">
            trending_up
          </span>
          <div className="flex-1">
            <h4 className="text-white font-bold text-lg mb-1">¡Sigue Ganando!</h4>
            <p className="text-gray-400 text-sm">
              Completa logros y eventos para aumentar tus recompensas
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
