import { RewardTabType } from '../../types/reward.types';

interface TabNavigationProps {
  activeTab: RewardTabType;
  onTabChange: (tab: RewardTabType) => void;
  assignedCount?: number;
  claimedCount?: number;
}

export default function TabNavigation({ 
  activeTab, 
  onTabChange,
  assignedCount = 0,
  claimedCount = 0
}: TabNavigationProps) {
  const tabs = [
    {
      id: 'assigned' as RewardTabType,
      label: 'Recompensas Asignadas',
      icon: 'inbox',
      count: assignedCount,
      description: 'Recompensas listas para reclamar',
    },
    {
      id: 'claimed' as RewardTabType,
      label: 'Recompensas Reclamadas',
      icon: 'check_circle',
      count: claimedCount,
      description: 'Tu historial de recompensas',
    },
    {
      id: 'balance' as RewardTabType,
      label: 'Mi Balance',
      icon: 'account_balance_wallet',
      description: 'Resumen de ganancias totales',
    },
  ];

  return (
    <div className="mb-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`p-6 rounded-xl border-2 transition-all text-left ${
              activeTab === tab.id
                ? 'bg-purple-500/20 border-purple-500 shadow-lg shadow-purple-500/20'
                : 'bg-gray-800/50 border-gray-700 hover:border-gray-600'
            }`}
          >
            <div className="flex items-start justify-between mb-3">
              <span 
                className={`material-symbols-outlined text-3xl ${
                  activeTab === tab.id ? 'text-purple-400' : 'text-gray-400'
                }`}
              >
                {tab.icon}
              </span>
              {tab.count !== undefined && tab.count > 0 && (
                <span className="bg-purple-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                  {tab.count}
                </span>
              )}
            </div>
            <h3 
              className={`font-bold text-lg mb-1 ${
                activeTab === tab.id ? 'text-white' : 'text-gray-300'
              }`}
            >
              {tab.label}
            </h3>
            <p className="text-gray-400 text-sm">{tab.description}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
