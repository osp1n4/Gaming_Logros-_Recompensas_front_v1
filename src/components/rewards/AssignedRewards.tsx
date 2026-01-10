import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAssignedRewards, claimReward, claimAllRewards } from '../../services/reward.service';
import { useAuthStore } from '../../store/auth';
import { RewardWithStatus } from '../../types/reward.types';
import RewardCard from './RewardCard';

export default function AssignedRewards() {
  const user = useAuthStore((s) => s.user);
  const playerId = user?.player?.id;
  const queryClient = useQueryClient();

  const { data: rewards, isLoading } = useQuery({
    queryKey: ['rewards', 'assigned', playerId],
    queryFn: () => getAssignedRewards(playerId!),
    enabled: !!playerId,
  });

  const claimMutation = useMutation({
    mutationFn: (playerRewardId: string) => claimReward(playerRewardId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rewards'] });
      queryClient.invalidateQueries({ queryKey: ['player'] });
      // TODO: Mostrar toast de éxito
      console.log('Reward claimed successfully!');
    },
    onError: (error) => {
      console.error('Error claiming reward:', error);
      // TODO: Mostrar toast de error
    },
  });

  const claimAllMutation = useMutation({
    mutationFn: () => claimAllRewards(playerId!),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['rewards'] });
      queryClient.invalidateQueries({ queryKey: ['player'] });
      console.log(`${data.claimed} rewards claimed!`);
    },
    onError: (error) => {
      console.error('Error claiming all rewards:', error);
    },
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
          inbox
        </span>
        <h3 className="text-white text-xl font-bold mb-2">No hay Recompensas Asignadas</h3>
        <p className="text-gray-400">
          Completa logros y eventos para ganar recompensas
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Header con botón Claim All */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-white text-2xl font-bold">Recompensas Asignadas</h2>
          <p className="text-gray-400 text-sm">
            Tienes {rewards.length} recompensa{rewards.length !== 1 ? 's' : ''} lista{rewards.length !== 1 ? 's' : ''} para reclamar
          </p>
        </div>
        {rewards.length > 1 && (
          <button
            onClick={() => claimAllMutation.mutate()}
            disabled={claimAllMutation.isPending}
            className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold rounded-lg hover:shadow-lg hover:shadow-purple-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {claimAllMutation.isPending ? (
              <span className="flex items-center gap-2">
                <span className="material-symbols-outlined animate-spin">refresh</span>
                Reclamando...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <span className="material-symbols-outlined">redeem</span>
                Reclamar Todas ({rewards.length})
              </span>
            )}
          </button>
        )}
      </div>

      {/* Grid de rewards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {rewards.map((reward) => (
          <RewardCard
            key={reward.playerRewardId}
            reward={reward}
            onClaim={() => claimMutation.mutate(reward.playerRewardId)}
            isClaimingThis={claimMutation.isPending}
            isClaimingAll={claimAllMutation.isPending}
          />
        ))}
      </div>
    </div>
  );
}
