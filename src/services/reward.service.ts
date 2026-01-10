import api from '../lib/api';
import { Reward, PlayerReward, RewardWithStatus, PlayerBalance } from '../types/reward.types';

const REWARD_BASE = import.meta.env.VITE_REWARD_SERVICE_URL || 'http://localhost:3003';

/**
 * Obtiene todas las recompensas disponibles
 */
export const getAllRewards = async (): Promise<Reward[]> => {
  const res = await api.get(`${REWARD_BASE}/rewards`);
  return res.data;
};

/**
 * Obtiene las recompensas de un jugador
 */
export const getPlayerRewards = async (playerId: string): Promise<RewardWithStatus[]> => {
  const res = await api.get(`${REWARD_BASE}/rewards/players/${playerId}`);
  return res.data;
};

/**
 * Obtiene las recompensas asignadas (no reclamadas) de un jugador
 */
export const getAssignedRewards = async (playerId: string): Promise<RewardWithStatus[]> => {
  const res = await api.get(`${REWARD_BASE}/rewards/players/${playerId}/assigned`);
  return res.data;
};

/**
 * Obtiene las recompensas reclamadas de un jugador
 */
export const getClaimedRewards = async (playerId: string): Promise<RewardWithStatus[]> => {
  const res = await api.get(`${REWARD_BASE}/rewards/players/${playerId}/claimed`);
  return res.data;
};

/**
 * Obtiene el balance total del jugador
 */
export const getPlayerBalance = async (playerId: string): Promise<PlayerBalance> => {
  const res = await api.get(`${REWARD_BASE}/rewards/balance/${playerId}`);
  return res.data;
};

/**
 * Reclama una recompensa específica
 */
export const claimReward = async (playerRewardId: string): Promise<PlayerReward> => {
  const res = await api.post(`${REWARD_BASE}/rewards/${playerRewardId}/claim`);
  return res.data;
};

/**
 * Reclama todas las recompensas asignadas de un jugador
 */
export const claimAllRewards = async (playerId: string): Promise<{ claimed: number }> => {
  const res = await api.post(`${REWARD_BASE}/rewards/players/${playerId}/claim-all`);
  return res.data;
};
