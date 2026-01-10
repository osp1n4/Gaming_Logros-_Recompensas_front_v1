import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { MetricType } from '../types/leaderboard.types';
import { getLeaderboard } from '../services/leaderboard.service';
import DashboardLayout from '../components/layout/DashboardLayout';
import { LeaderboardHeader } from '../components/leaderboard/LeaderboardHeader';
import { MetricTabs } from '../components/leaderboard/MetricTabs';
import { LeaderboardPodium } from '../components/leaderboard/LeaderboardPodium';
import { LeaderboardTable } from '../components/leaderboard/LeaderboardTable';
import { PersonalRankCard } from '../components/leaderboard/PersonalRankCard';

export default function Leaderboard() {
  const [metric, setMetric] = useState<MetricType>('monsters');

  const { data: leaderboardData, isLoading, error } = useQuery({
    queryKey: ['leaderboard', metric],
    queryFn: () => getLeaderboard(metric),
    refetchInterval: 30000, // Refrescar cada 30 segundos
    staleTime: 15000, // Los datos son frescos por 15 segundos
  });

  const topThree = leaderboardData?.players.slice(0, 3) || [];
  const otherPlayers = leaderboardData?.players.slice(3) || [];

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="max-w-7xl mx-auto">
          {/* Loading skeleton */}
          <div className="animate-pulse space-y-8">
            {/* Header skeleton */}
            <div className="text-center">
              <div className="h-16 bg-gray-800 rounded-xl mx-auto w-96 mb-4"></div>
              <div className="h-6 bg-gray-800 rounded-lg mx-auto w-80"></div>
            </div>
            
            {/* Tabs skeleton */}
            <div className="flex justify-center">
              <div className="flex bg-gray-800 rounded-xl p-2 w-96">
                <div className="h-12 bg-gray-700 rounded-lg flex-1 mr-2"></div>
                <div className="h-12 bg-gray-700 rounded-lg flex-1"></div>
              </div>
            </div>
            
            {/* Podium skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-64 bg-gray-800 rounded-2xl"></div>
              ))}
            </div>
            
            {/* Table skeleton */}
            <div className="h-96 bg-gray-800 rounded-2xl"></div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <span className="material-symbols-outlined text-red-500 text-6xl mb-4">
              error_outline
            </span>
            <h2 className="text-white text-2xl font-bold mb-2">
              Error al cargar el ranking
            </h2>
            <p className="text-gray-400 mb-4">
              No se pudo conectar con el servidor
            </p>
            <button 
              onClick={() => window.location.reload()} 
              className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
            >
              Reintentar
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        <LeaderboardHeader />
        
        <MetricTabs metric={metric} onMetricChange={setMetric} />
        
        {topThree.length >= 3 && (
          <LeaderboardPodium topThree={topThree} metric={metric} />
        )}
        
        {otherPlayers.length > 0 && (
          <LeaderboardTable 
            players={otherPlayers} 
            metric={metric} 
            startRank={4} 
          />
        )}
        
        {leaderboardData?.players.length === 0 && (
          <div className="text-center py-20">
            <span className="material-symbols-outlined text-gray-600 text-6xl mb-4">
              leaderboard
            </span>
            <h3 className="text-white text-2xl font-bold mb-2">
              No hay jugadores en el ranking
            </h3>
            <p className="text-gray-400">
              ¡Sé el primero en aparecer aquí completando logros!
            </p>
          </div>
        )}
        
        {leaderboardData && (
          <PersonalRankCard players={leaderboardData.players} metric={metric} />
        )}
      </div>
    </DashboardLayout>
  );
}
