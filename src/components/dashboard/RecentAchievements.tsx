import { usePlayerDashboard } from '../../hooks/usePlayerDashboard';
import { useNavigate } from 'react-router-dom';

export default function RecentAchievements() {
  const navigate = useNavigate();
  const { achievements, isLoading } = usePlayerDashboard();

  // Mostrar solo los primeros 3 achievements para el dashboard
  const recentAchievements = achievements?.slice(0, 3) || [];

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
        {recentAchievements.length > 0 ? (
          recentAchievements.map((achievement: any) => {
            const progressPercent = achievement.targetValue > 0 
              ? Math.round((achievement.progress / achievement.targetValue) * 100)
              : 0;
            const isCompleted = achievement.progress >= achievement.targetValue;
            
            return (
              <div key={achievement.id} className="flex items-center gap-4 p-3 bg-white/5 rounded-lg transition-colors hover:bg-white/10">
                <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                  <span className="material-symbols-outlined text-purple-400">
                    {isCompleted ? 'emoji_events' : 'trophy'}
                  </span>
                </div>
                <div className="flex-1">
                  <h3 className="text-white font-medium text-sm">{achievement.name}</h3>
                  <p className="text-gray-400 text-xs mb-1">{achievement.description}</p>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${
                          isCompleted ? 'bg-green-500' : 'bg-purple-500'
                        }`}
                        style={{ width: `${Math.min(progressPercent, 100)}%` }}
                      />
                    </div>
                    <span className={`text-xs font-medium ${
                      isCompleted ? 'text-green-400' : 'text-purple-400'
                    }`}>
                      {achievement.progress}/{achievement.targetValue}
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-8">
            <span className="material-symbols-outlined text-gray-500 text-4xl mb-2">emoji_events</span>
            <p className="text-gray-400">No hay logros disponibles</p>
          </div>
        )}
      </div>
    </div>
  );
}
