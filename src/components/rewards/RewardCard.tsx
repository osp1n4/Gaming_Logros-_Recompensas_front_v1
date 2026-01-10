import { RewardWithStatus } from '../../types/reward.types';

interface RewardCardProps {
  reward: RewardWithStatus;
}

/**
 * RewardCard Component
 * Displays individual reward information with status
 */
export default function RewardCard({ reward }: RewardCardProps) {
  const getRarityColor = (rewardType: string) => {
    switch (rewardType) {
      case 'coins':
        return {
          bg: 'bg-yellow-500/20',
          text: 'text-yellow-400',
          border: 'border-yellow-500/50',
        };
      case 'points':
        return {
          bg: 'bg-purple-500/20',
          text: 'text-purple-400',
          border: 'border-purple-500/50',
        };
      default:
        return {
          bg: 'bg-gray-500/20',
          text: 'text-gray-400',
          border: 'border-gray-500/50',
        };
    }
  };

  const colors = getRarityColor(reward.rewardType);

  return (
    <div 
      className={`bg-gray-800/50 border-2 ${colors.border} rounded-xl p-6 hover:shadow-lg transition-all ${
        reward.isClaimed ? 'opacity-60' : ''
      }`}
    >
      {/* Header */}
      <div className="flex items-start gap-4 mb-4">
        <div className={`${colors.bg} rounded-lg p-3 flex items-center justify-center`}>
          <span className={`material-symbols-outlined ${colors.text} text-3xl`}>
            {reward.icon || 'emoji_events'}
          </span>
        </div>
        <div className="flex-1">
          <h3 className="text-white font-bold text-lg">{reward.name || `${reward.rewardAmount} ${reward.rewardType}`}</h3>
          <p className="text-gray-400 text-xs">De: {reward.source || 'Logro'}</p>
        </div>
      </div>

      {/* Description */}
      {reward.description && (
        <p className="text-gray-400 text-sm mb-4">{reward.description}</p>
      )}

      {/* Status */}
      {reward.isClaimed ? (
        <div className="bg-green-500/20 border border-green-500/50 rounded-lg p-3 text-center">
          <span className="text-green-400 font-bold text-sm flex items-center justify-center gap-2">
            <span className="material-symbols-outlined text-lg">check_circle</span>
            Reclamada
          </span>
        </div>
      ) : (
        <div className="bg-purple-500/20 border border-purple-500/50 rounded-lg p-3 text-center">
          <span className="text-purple-400 font-bold text-sm flex items-center justify-center gap-2">
            <span className="material-symbols-outlined text-lg">schedule</span>
            Pendiente
          </span>
        </div>
      )}
    </div>
  );
}
