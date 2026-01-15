import { usePlayerDashboard } from '../../hooks/usePlayerDashboard';
import { useNavigate } from 'react-router-dom';

export default function LatestRewards() {
  const navigate = useNavigate();
  const { rewards, isLoading } = usePlayerDashboard();

  // Mostrar solo las últimas 3 recompensas para el dashboard
  const latestRewards = rewards?.slice(0, 3) || [];

  if (isLoading) {
    return (
      <div className="bg-gray-800/50 backdrop-blur-xl rounded-xl border border-purple-500/20 p-6">
        <h2 className="text-xl font-bold text-white mb-4">Últimas Recompensas</h2>
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-12 bg-gray-700 rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800/50 backdrop-blur-xl rounded-xl border border-purple-500/20 p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-white">Últimas Recompensas</h2>
        <button
          onClick={() => navigate('/rewards')}
          className="text-purple-400 hover:text-purple-300 text-sm font-medium transition"
        >
          Ver todas
        </button>
      </div>
      
      <div className="space-y-3">
        {latestRewards.length > 0 ? (
          latestRewards.map((reward: any) => {
            const isCoins = reward.rewardType === 'coins';
            const isPoints = reward.rewardType === 'points';
            
            return (
              <div key={reward.id} className="flex items-center gap-4 p-3 bg-white/5 rounded-lg transition-colors hover:bg-white/10">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  isCoins ? 'bg-yellow-500/20' : isPoints ? 'bg-purple-500/20' : 'bg-blue-500/20'
                }`}>
                  <span className={`material-symbols-outlined ${
                    isCoins ? 'text-yellow-400' : isPoints ? 'text-purple-400' : 'text-blue-400'
                  }`}>
                    {isCoins ? 'payments' : isPoints ? 'bolt' : 'card_giftcard'}
                  </span>
                </div>
                <div className="flex-1">
                  <h3 className="text-white font-medium text-sm">
                    {reward.rewardAmount} {reward.rewardType}
                  </h3>
                  <p className="text-gray-400 text-xs">
                    {reward.awardedAt ? new Date(reward.awardedAt).toLocaleDateString() : 'Fecha no disponible'}
                  </p>
                </div>
                <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                  reward.isClaimed ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
                }`}>
                  {reward.isClaimed ? 'Reclamado' : 'Pendiente'}
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-8">
            <span className="material-symbols-outlined text-gray-500 text-4xl mb-2">card_giftcard</span>
            <p className="text-gray-400">No hay recompensas disponibles</p>
          </div>
        )}
      </div>
    </div>
  );
}
