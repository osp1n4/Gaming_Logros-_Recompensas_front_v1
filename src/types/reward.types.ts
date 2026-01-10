// Tipos basados en el backend real
export interface Reward {
  id: string;
  playerId: string;
  achievementId: string;
  rewardType: 'coins' | 'points' | 'badge' | 'item';
  rewardAmount: number;
  awardedAt: string;
  isClaimed: boolean;
}

// Alias para mantener compatibilidad con componentes
export interface RewardWithStatus extends Reward {
  playerRewardId: string; // Mapea a 'id' del backend
  // Campos calculados para UI
  name?: string;
  description?: string;
  rarity?: 'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY';
  coinValue?: number;
  xpValue?: number;
  icon?: string;
  source?: string;
  assignedAt?: string;
  claimedAt?: string | null;
  expiresAt?: string | null;
}

export interface PlayerBalance {
  playerId: string;
  totalCoins: number;
  totalPoints: number;
  lastUpdated: string;
}

export type RewardTabType = 'assigned' | 'claimed' | 'balance';
