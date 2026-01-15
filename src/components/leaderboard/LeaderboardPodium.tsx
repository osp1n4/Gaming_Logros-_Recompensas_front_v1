import { LeaderboardPlayer, MetricType } from '../../types/leaderboard.types';
import { getMetricValue, getMetricLabel } from '../../services/leaderboard.service';

interface PodiumProps {
  topThree: LeaderboardPlayer[];
  metric: MetricType;
}

export const LeaderboardPodium = ({ topThree, metric }: PodiumProps) => {
  if (!topThree || topThree.length < 3) {
    return (
      <div className="text-center py-12">
        <span className="material-symbols-outlined text-gray-600 text-4xl mb-4">
          emoji_events
        </span>
        <p className="text-gray-400">
          Necesitamos al menos 3 jugadores para mostrar el podio
        </p>
      </div>
    );
  }

  // Orden visual: 2do, 1ro, 3ro
  const orderedPodium = [topThree[1], topThree[0], topThree[2]];
  const positions = [2, 1, 3];
  const medals = ['silver', 'gold', 'bronze'] as const;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end mb-12">
      {orderedPodium.map((player, index) => {
        if (!player) return <div key={index}></div>;
        
        const position = positions[index];
        const medal = medals[index];
        const isFirst = position === 1;

        return (
          <div key={player.id} className={`text-center ${isFirst ? 'order-2' : index === 0 ? 'order-1' : 'order-3'}`}>
            {/* Corona para el 1er lugar */}
            {isFirst && (
              <div className="mb-4">
                <span className="material-symbols-outlined text-yellow-400 text-5xl animate-pulse">
                  workspace_premium
                </span>
              </div>
            )}

            {/* Avatar */}
            <div className="relative mb-4">
              <div className={`${isFirst ? 'w-24 h-24' : 'w-20 h-20'} mx-auto rounded-full border-4 ${
                medal === 'gold' ? 'border-yellow-400' : medal === 'silver' ? 'border-gray-400' : 'border-orange-600'
              } bg-gradient-to-br from-gray-600 to-gray-800 flex items-center justify-center`}>
                <span className="material-symbols-outlined text-white text-3xl">
                  person
                </span>
              </div>
              
              {/* Badge de posición */}
              <div className={`absolute -bottom-2 left-1/2 transform -translate-x-1/2 ${
                medal === 'gold' ? 'bg-yellow-500' : medal === 'silver' ? 'bg-gray-400' : 'bg-orange-600'
              } text-white font-black px-3 py-1 rounded-full text-sm`}>
                #{position}
              </div>
            </div>

            {/* Card de información */}
            <div className={`bg-gray-800 rounded-xl p-6 border-2 ${
              medal === 'gold' ? 'border-yellow-400' : medal === 'silver' ? 'border-gray-400' : 'border-orange-600'
            } transition-transform hover:scale-105`}>
              <h3 className={`font-bold ${isFirst ? 'text-xl' : 'text-lg'} text-white mb-2`}>
                {player.username}
              </h3>
              <p className={`${
                medal === 'gold' ? 'text-yellow-400' : medal === 'silver' ? 'text-gray-300' : 'text-orange-400'
              } font-bold ${isFirst ? 'text-lg' : 'text-base'} mb-2`}>
                {getMetricValue(player, metric).toLocaleString('es-ES')}
              </p>
              <p className="text-gray-500 text-sm">
                {metric === 'monsters' ? 'Monstruos' : 'Minutos'}
              </p>
              
              {/* Badge adicional para el ganador */}
              {isFirst && (
                <div className="mt-3 inline-flex items-center gap-1 bg-yellow-500/20 text-yellow-400 px-3 py-1 rounded-full text-xs font-bold">
                  <span className="material-symbols-outlined text-sm">star</span>
                  CAMPEÓN
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};