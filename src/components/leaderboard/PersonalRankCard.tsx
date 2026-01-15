import { useAuthStore } from '../../store/auth';
import { getCurrentUserRank } from '../../services/leaderboard.service';
import { LeaderboardPlayer, MetricType } from '../../types/leaderboard.types';

interface PersonalRankCardProps {
  players: LeaderboardPlayer[];
  metric: MetricType;
}

export const PersonalRankCard = ({ players, metric }: PersonalRankCardProps) => {
  const { user } = useAuthStore();
  
  if (!user) return null;

  const userRank = getCurrentUserRank(players, user.email);
  
  if (!userRank) {
    return (
      <div className="bg-gradient-to-r from-purple-900/50 to-pink-900/50 rounded-2xl p-6 border border-purple-700/50">
        <div className="text-center">
          <span className="material-symbols-outlined text-purple-400 text-5xl mb-3">
            trending_flat
          </span>
          <h3 className="text-white text-xl font-bold mb-2">
            ¡Comienza tu aventura!
          </h3>
          <p className="text-purple-200">
            Aún no apareces en el ranking. ¡Comienza a eliminar monstruos para subir posiciones!
          </p>
        </div>
      </div>
    );
  }

  const { player, position } = userRank;
  const isTopTen = position <= 10;
  const isTop3 = position <= 3;

  return (
    <div className={`relative overflow-hidden rounded-2xl p-6 border ${
      isTop3 
        ? 'bg-gradient-to-r from-yellow-900/50 to-amber-900/50 border-yellow-600/50' 
        : isTopTen 
          ? 'bg-gradient-to-r from-purple-900/50 to-indigo-900/50 border-purple-600/50'
          : 'bg-gradient-to-r from-gray-900/50 to-slate-900/50 border-gray-600/50'
    }`}>
      {/* Efecto de brillo para top 3 */}
      {isTop3 && (
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-yellow-400/20 to-transparent animate-pulse" />
      )}
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-white text-xl font-bold flex items-center gap-2">
            <span className="material-symbols-outlined">person_pin</span>
            Tu Posición
          </h3>
          
          {isTop3 && (
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-yellow-400 animate-bounce">
                star
              </span>
              <span className="text-yellow-400 font-bold text-sm">TOP 3</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-4 mb-4">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
            isTop3 
              ? 'bg-gradient-to-br from-yellow-500 to-amber-600' 
              : isTopTen 
                ? 'bg-gradient-to-br from-purple-600 to-indigo-600'
                : 'bg-gradient-to-br from-gray-600 to-slate-600'
          }`}>
            <span className="material-symbols-outlined text-white text-xl">
              person
            </span>
          </div>
          
          <div>
            <h4 className="text-white text-lg font-bold">{player.username}</h4>
            <p className="text-gray-400 text-sm">{player.email}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-black/30 rounded-xl p-4 text-center">
            <span className={`material-symbols-outlined mb-2 text-3xl ${
              isTop3 ? 'text-yellow-400' : isTopTen ? 'text-purple-400' : 'text-gray-400'
            }`}>
              leaderboard
            </span>
            <p className="text-gray-400 text-sm">Posición</p>
            <p className={`font-bold text-2xl ${
              isTop3 ? 'text-yellow-400' : isTopTen ? 'text-purple-400' : 'text-white'
            }`}>
              #{position}
            </p>
          </div>
          
          <div className="bg-black/30 rounded-xl p-4 text-center">
            <span className={`material-symbols-outlined mb-2 text-3xl ${
              metric === 'monsters' ? 'text-red-400' : 'text-blue-400'
            }`}>
              {metric === 'monsters' ? 'psychology' : 'schedule'}
            </span>
            <p className="text-gray-400 text-sm">
              {metric === 'monsters' ? 'Monstruos' : 'Tiempo Jugado'}
            </p>
            <p className="font-bold text-2xl text-white">
              {metric === 'monsters' 
                ? player.monstersKilled.toLocaleString('es-ES')
                : Math.floor(player.timePlayed / 60).toLocaleString('es-ES')
              }
            </p>
          </div>
        </div>

        <div className="mt-4 text-center">
          <p className="text-gray-400 text-sm">
            {isTop3 
              ? '¡Felicitaciones por estar en el top 3! 🎉'
              : isTopTen 
                ? '¡Excelente trabajo! Estás en el top 10 🏆'
                : `${position > 100 ? 'Sigue mejorando' : 'Buen trabajo'}, puedes escalar más posiciones`
            }
          </p>
        </div>
      </div>
    </div>
  );
};