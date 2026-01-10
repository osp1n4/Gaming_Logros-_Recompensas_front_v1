import { useQuery } from '@tanstack/react-query';
import { getClaimedRewards } from '../../services/reward.service';
import { useAuthStore } from '../../store/auth';
import RewardCard from './RewardCard';

export default function ClaimedRewards() {
  const user = useAuthStore((s) => s.user);
  const playerId = user?.player?.id;

  const { data: rewards, isLoading } = useQuery({
    queryKey: ['rewards', 'claimed', playerId],
    queryFn: () => getClaimedRewards(playerId!),
    enabled: !!playerId,
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 animate-pulse">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-16 h-16 bg-gray-700 rounded-lg" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-700 rounded w-3/4" />
                <div className="h-3 bg-gray-700 rounded w-1/2" />
              </div>
            </div>
            <div className="h-3 bg-gray-700 rounded w-full mb-2" />
            <div className="h-3 bg-gray-700 rounded w-5/6" />
          </div>
        ))}
      </div>
    );
  }

  if (!rewards || rewards.length === 0) {
    return (
      <div className="text-center py-20">
        <span className="material-symbols-outlined text-gray-600 text-6xl mb-4">
          history
        </span>
        <h3 className="text-white text-xl font-bold mb-2">Aún no hay Recompensas Reclamadas</h3>
        <p className="text-gray-400">
          Tus recompensas reclamadas aparecerán aquí
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-white text-2xl font-bold">Recompensas Reclamadas</h2>
        <p className="text-gray-400 text-sm">
          Has reclamado {rewards.length} recompensa{rewards.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Grid de rewards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {rewards.map((reward) => (
          <RewardCard
            key={reward.playerRewardId}
            reward={reward}
            showClaimButton={false}
          />
        ))}
      </div>
    </div>
  );
}
