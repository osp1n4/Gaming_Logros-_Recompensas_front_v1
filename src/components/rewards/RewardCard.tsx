import { RewardWithStatus } from '../../types/reward.types';

interface RewardCardProps {
  reward: RewardWithStatus;
  onClaim?: () => void;
  isClaimingThis?: boolean;
  isClaimingAll?: boolean;
  showClaimButton?: boolean;
}

export default function RewardCard({ 
  reward, 
  onClaim, 
  isClaimingThis = false,
  isClaimingAll = false,
  showClaimButton = true 
}: RewardCardProps) {
  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'COMMON':
        return {
          bg: 'bg-gray-500/20',
          text: 'text-gray-400',
          border: 'border-gray-500/50',
          glow: 'shadow-gray-500/20',
        };
      case 'RARE':
        return {
          bg: 'bg-blue-500/20',
          text: 'text-blue-400',
          border: 'border-blue-500/50',
          glow: 'shadow-blue-500/20',
        };
      case 'EPIC':
        return {
          bg: 'bg-purple-500/20',
          text: 'text-purple-400',
          border: 'border-purple-500/50',
          glow: 'shadow-purple-500/20',
        };
      case 'LEGENDARY':
        return {
          bg: 'bg-yellow-500/20',
          text: 'text-yellow-400',
          border: 'border-yellow-500/50',
          glow: 'shadow-yellow-500/20',
        };
      default:
        return {
          bg: 'bg-gray-500/20',
          text: 'text-gray-400',
          border: 'border-gray-500/50',
          glow: 'shadow-gray-500/20',
        };
    }
  };

  const colors = getRarityColor(reward.rarity);
  const isLoading = isClaimingThis || isClaimingAll;

  return (
    <div 
      className={`bg-gray-800/50 border-2 ${colors.border} rounded-xl p-6 hover:${colors.glow} hover:shadow-lg transition-all ${
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
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className="text-white font-bold text-lg">{reward.name}</h3>
            <span className={`${colors.bg} ${colors.text} text-xs font-bold px-2 py-1 rounded uppercase`}>
              {reward.rarity}
            </span>
          </div>
          <p className="text-gray-400 text-xs">De: {reward.source}</p>
        </div>
      </div>

      {/* Description */}
      <p className="text-gray-400 text-sm mb-4 line-clamp-2">{reward.description}</p>

      {/* Values */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-gray-900/50 rounded-lg p-3 flex items-center gap-2">
          <span className="material-symbols-outlined text-yellow-400 text-xl">
            payments
          </span>
          <div>
            <p className="text-gray-400 text-xs">Monedas</p>
            <p className="text-white font-bold">{reward.coinValue}</p>
          </div>
        </div>
        <div className="bg-gray-900/50 rounded-lg p-3 flex items-center gap-2">
          <span className="material-symbols-outlined text-purple-400 text-xl">
            bolt
          </span>
          <div>
            <p className="text-gray-400 text-xs">XP</p>
            <p className="text-white font-bold">{reward.xpValue}</p>
          </div>
        </div>
      </div>

      {/* Status & Action */}
      {reward.isClaimed ? (
        <div className="bg-green-500/20 border border-green-500/50 rounded-lg p-3 text-center">
          <span className="text-green-400 font-bold text-sm flex items-center justify-center gap-2">
            <span className="material-symbols-outlined text-lg">check_circle</span>
            Reclamada
          </span>
        </div>
      ) : showClaimButton && onClaim ? (
        <button
          onClick={onClaim}
          disabled={isLoading}
          className={`w-full py-3 rounded-lg font-bold transition-all ${
            isLoading
              ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
              : `bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:shadow-lg ${colors.glow}`
          }`}
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="material-symbols-outlined animate-spin text-lg">refresh</span>
              Reclamando...
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              <span className="material-symbols-outlined text-lg">redeem</span>
              Reclamar Recompensa
            </span>
          )}
        </button>
      ) : (
        <div className="bg-purple-500/20 border border-purple-500/50 rounded-lg p-3 text-center">
          <span className="text-purple-400 font-bold text-sm">Lista para reclamar</span>
        </div>
      )}
    </div>
  );
}
