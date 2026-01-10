import { usePlayerDashboard } from '../../hooks/usePlayerDashboard';
import { useNavigate } from 'react-router-dom';

export default function RecentAchievements() {
  const navigate = useNavigate();
  const { achievements, isLoading } = usePlayerDashboard();

  // Filtrar solo logros desbloqueados y tomar los últimos 3
  const unlockedAchievements = achievements?.filter((a: any) => a.unlockedAt !== null) || [];
  const recentUnlockedAchievements = unlockedAchievements.slice(0, 3);

  if (isLoading) {
    return (
      <div className="bg-gray-800/50 backdrop-blur-xl rounded-xl border border-purple-500/20 p-6">
        <h2 className="text-xl font-bold text-white mb-4">Logros Recientes</h2>
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
        <h2 className="text-xl font-bold text-white">Logros Recientes</h2>
        <button
          onClick={() => navigate('/achievements')}
          className="text-purple-400 hover:text-purple-300 text-sm font-medium transition"
        >
          Ver todos
        </button>
      </div>
      
      <div className="space-y-3">
        {recentUnlockedAchievements.length > 0 ? (
          recentUnlockedAchievements.map((achievement: any) => {
            const achievementData = achievement.achievement || achievement;
            const achievementName = achievementData.name || achievementData.code;
            const achievementDescription = achievementData.description || 'Logro completado';
            const requiredValue = achievementData.requiredValue || achievement.targetValue;
            
            return (
              <div key={achievement.id} className="flex items-center gap-4 p-3 bg-white/5 rounded-lg transition-colors hover:bg-white/10">
                <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center flex-shrink-0">
                  <span className="material-symbols-outlined text-green-400">
                    emoji_events
                  </span>
                </div>
                <div className="flex-1">
                  <h3 className="text-white font-medium text-sm">{achievementName}</h3>
                  <p className="text-gray-400 text-xs">{achievementDescription}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-green-400 font-medium">
                      {requiredValue}/{requiredValue}
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-8">
            <span className="material-symbols-outlined text-gray-500 text-4xl mb-2">emoji_events</span>
            <p className="text-gray-400">No hay logros desbloqueados aún</p>
          </div>
        )}
      </div>
    </div>
  );
}
