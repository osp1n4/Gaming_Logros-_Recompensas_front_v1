import api from '../lib/api';
import { LeaderboardPlayer, MetricType, LeaderboardData } from '../types/leaderboard.types';

/**
 * Servicio para obtener datos del leaderboard
 * Usa el endpoint existente GET /players y ordena localmente
 */
export const getLeaderboard = async (metric: MetricType): Promise<LeaderboardData> => {
  try {
    // Usar endpoint existente del backend
    const response = await api.get<LeaderboardPlayer[]>('/players');
    const allPlayers = response.data;
    
    // Filtrar solo jugadores activos
    const activePlayers = allPlayers.filter(player => player.isActive);
    
    // Ordenar localmente según la métrica seleccionada
    const sortedPlayers = activePlayers.sort((a, b) => {
      if (metric === 'monsters') {
        return b.monstersKilled - a.monstersKilled;
      } else {
        return b.timePlayed - a.timePlayed;
      }
    });

    return {
      players: sortedPlayers,
    };
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    throw new Error('No se pudo cargar el ranking');
  }
};

/**
 * Obtiene el ranking de un usuario específico por email
 */
export const getCurrentUserRank = (
  players: LeaderboardPlayer[], 
  userEmail: string
): { position: number; player: LeaderboardPlayer } | null => {
  const playerIndex = players.findIndex(player => player.email === userEmail);
  
  if (playerIndex === -1) {
    return null;
  }
  
  const player = players[playerIndex];
  const position = playerIndex + 1;
  
  return { position, player };
};

/**
 * Formatea el valor de una métrica para mostrar
 */
export const formatMetricValue = (player: LeaderboardPlayer, metric: MetricType): string => {
  if (metric === 'monsters') {
    return player.monstersKilled.toLocaleString('es-ES');
  } else {
    return player.timePlayed.toLocaleString('es-ES');
  }
};

/**
 * Obtiene el label de una métrica
 */
export const getMetricLabel = (metric: MetricType): string => {
  return metric === 'monsters' ? 'Monstruos Eliminados' : 'Tiempo Jugado (min)';
};

/**
 * Obtiene el valor numérico de una métrica para un jugador
 */
export const getMetricValue = (player: LeaderboardPlayer, metric: MetricType): number => {
  return metric === 'monsters' ? player.monstersKilled : player.timePlayed;
};