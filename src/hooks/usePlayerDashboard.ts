import { useQuery } from '@tanstack/react-query';
import { getPlayerAchievements } from '../services/achievement.service';
import { useAuthStore } from '../store/auth';

/**
 * Hook personalizado para obtener datos agregados del dashboard del jugador
 */
export const usePlayerDashboard = () => {
  const user = useAuthStore((s) => s.user);
  const playerId = user?.player?.id;

  const achievementsQuery = useQuery({
    queryKey: ['achievements', playerId],
    queryFn: () => getPlayerAchievements(playerId!),
    enabled: !!playerId,
    staleTime: 5 * 60 * 1000, // 5 minutos
  });

  return {
    player: useAuthStore.getState().user?.player || null,
    achievements: achievementsQuery.data,
    isLoading: achievementsQuery.isLoading,
    error: achievementsQuery.error,
  };
};
