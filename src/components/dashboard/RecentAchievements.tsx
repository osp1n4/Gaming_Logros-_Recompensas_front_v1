interface Achievement {
  id: string;
  name: string;
  description: string;
  progress: number;
  maxProgress: number;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

const rarityColors = {
  common: 'text-gray-400',
  rare: 'text-blue-400',
  epic: 'text-purple-400',
  legendary: 'text-yellow-400',
};

export default function RecentAchievements() {
  // Mock data - esto vendrá del backend
  const achievements: Achievement[] = [
    {
      id: '1',
      name: 'Primer Paso',
      description: 'Completar tu primer logro',
      progress: 1,
      maxProgress: 1,
      icon: 'footprint',
      rarity: 'common',
    },
    {
      id: '2',
      name: 'Cazador Novato',
      description: 'Eliminar 10 enemigos',
      progress: 7,
      maxProgress: 10,
      icon: 'swords',
      rarity: 'rare',
    },
    {
      id: '3',
      name: 'Explorador',
      description: 'Visitar 5 zonas diferentes',
      progress: 3,
      maxProgress: 5,
      icon: 'explore',
      rarity: 'rare',
    },
  ];

  return (
    <div className="bg-gray-800/50 backdrop-blur-xl rounded-xl border border-purple-500/20 p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-white">Logros Recientes</h2>
        <button className="text-purple-400 hover:text-purple-300 text-sm font-medium transition">
          Ver Todos →
        </button>
      </div>

      <div className="space-y-4">
        {achievements.map((achievement) => {
          const progressPercentage = (achievement.progress / achievement.maxProgress) * 100;
          const isComplete = achievement.progress >= achievement.maxProgress;

          return (
            <div
              key={achievement.id}
              className="flex items-center gap-4 p-4 rounded-lg bg-gray-900/50 border border-purple-500/10 hover:border-purple-500/30 transition"
            >
              {/* Icon */}
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                isComplete ? 'bg-yellow-500/20' : 'bg-purple-500/10'
              }`}>
                <span className={`material-symbols-outlined text-2xl ${
                  isComplete ? 'text-yellow-500' : 'text-purple-400'
                }`}>
                  {achievement.icon}
                </span>
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-white font-semibold text-sm">{achievement.name}</h3>
                  {isComplete && (
                    <span className="material-symbols-outlined text-yellow-500 text-sm">
                      check_circle
                    </span>
                  )}
                </div>
                <p className="text-gray-400 text-xs mb-2 truncate">{achievement.description}</p>
                
                {/* Progress Bar */}
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${isComplete ? 'bg-yellow-500' : 'bg-purple-500'} transition-all duration-300`}
                      style={{ width: `${progressPercentage}%` }}
                    />
                  </div>
                  <span className={`text-xs font-bold ${rarityColors[achievement.rarity]}`}>
                    {achievement.progress}/{achievement.maxProgress}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
