interface Reward {
  id: string;
  name: string;
  type: string;
  amount: number;
  source: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  icon: string;
  timestamp: string;
}

const rarityConfig = {
  common: {
    label: 'Común',
    color: 'text-gray-400',
    bg: 'bg-gray-500/10',
    border: 'border-gray-500/30',
  },
  rare: {
    label: 'Raro',
    color: 'text-blue-400',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/30',
  },
  epic: {
    label: 'Épico',
    color: 'text-purple-400',
    bg: 'bg-purple-500/10',
    border: 'border-purple-500/30',
  },
  legendary: {
    label: 'Legendario',
    color: 'text-yellow-400',
    bg: 'bg-yellow-500/10',
    border: 'border-yellow-500/30',
  },
};

export default function LatestRewards() {
  // Mock data - esto vendrá del backend
  const rewards: Reward[] = [
    {
      id: '1',
      name: 'Cofre de Bienvenida',
      type: 'Gold',
      amount: 1000,
      source: 'Registro',
      rarity: 'common',
      icon: 'workspace_premium',
      timestamp: new Date().toISOString(),
    },
    {
      id: '2',
      name: 'Bonus de Primer Logro',
      type: 'XP',
      amount: 500,
      source: 'Achievement: Primer Paso',
      rarity: 'rare',
      icon: 'bolt',
      timestamp: new Date().toISOString(),
    },
    {
      id: '3',
      name: 'Gema Épica',
      type: 'Premium Currency',
      amount: 5,
      source: 'Daily Login',
      rarity: 'epic',
      icon: 'diamond',
      timestamp: new Date().toISOString(),
    },
  ];

  return (
    <div className="bg-gray-800/50 backdrop-blur-xl rounded-xl border border-purple-500/20 p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-white">Últimas Recompensas</h2>
        <button className="text-purple-400 hover:text-purple-300 text-sm font-medium transition">
          Ver Todas →
        </button>
      </div>

      <div className="space-y-3">
        {rewards.map((reward) => {
          const config = rarityConfig[reward.rarity];

          return (
            <div
              key={reward.id}
              className={`flex items-center gap-4 p-4 rounded-lg bg-gray-900/50 border ${config.border} hover:border-opacity-50 transition`}
            >
              {/* Icon */}
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${config.bg}`}>
                <span className={`material-symbols-outlined text-2xl ${config.color}`}>
                  {reward.icon}
                </span>
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-white font-semibold text-sm">{reward.name}</h3>
                  <span className={`px-2 py-0.5 rounded-full ${config.bg} ${config.color} text-xs font-bold`}>
                    {config.label}
                  </span>
                </div>
                <p className="text-gray-400 text-xs truncate">
                  {reward.source}
                </p>
              </div>

              {/* Amount */}
              <div className="text-right">
                <p className={`font-bold ${config.color}`}>
                  +{reward.amount.toLocaleString()}
                </p>
                <p className="text-gray-500 text-xs">{reward.type}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
