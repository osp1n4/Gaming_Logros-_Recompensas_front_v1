import api from '../lib/api';
import { Achievement, PlayerAchievement, AchievementWithProgress } from '../types/achievement.types';

const ACHIEVEMENT_BASE = import.meta.env.VITE_ACHIEVEMENT_SERVICE_URL || 'http://localhost:3002';

/**
 * Obtiene todos los achievements disponibles
 */
export const getAllAchievements = async (): Promise<Achievement[]> => {
  const res = await api.get(`${ACHIEVEMENT_BASE}/api/achievements`);
  return res.data;
};

/**
 * Obtiene los achievements de un jugador con su progreso
 */
export const getPlayerAchievements = async (playerId: string): Promise<AchievementWithProgress[]> => {
  const res = await api.get(`${ACHIEVEMENT_BASE}/api/achievements/players/${playerId}`);
  return res.data;
};

/**
 * Obtiene el progreso específico de un achievement
 */
export const getAchievementProgress = async (
  playerId: string,
  achievementId: string
): Promise<PlayerAchievement> => {
  const res = await api.get(
    `${ACHIEVEMENT_BASE}/api/achievements/players/${playerId}/${achievementId}/progress`
  );
  return res.data;
};

/**
 * Obtiene un achievement específico por ID
 */
export const getAchievementById = async (achievementId: string): Promise<Achievement> => {
  const res = await api.get(`${ACHIEVEMENT_BASE}/achievements/${achievementId}`);
  return res.data;
};

/**
 * Marca un achievement como objetivo activo (si existe este endpoint)
 */
export const trackAchievement = async (achievementId: string): Promise<void> => {
  await api.post(`${ACHIEVEMENT_BASE}/achievements/${achievementId}/track`);
};
