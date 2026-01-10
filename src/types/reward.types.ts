export interface Reward {
  id: string;
  name: string;
  description: string;
  rarity: 'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY';
  coinValue: number;
  xpValue: number;
  icon?: string;
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PlayerReward {
  id: string;
  playerId: string;
  rewardId: string;
  isClaimed: boolean;
  claimedAt: string | null;
  assignedAt: string;
  expiresAt: string | null;
  source: string; // 'ACHIEVEMENT', 'EVENT', 'PURCHASE', etc.
  createdAt: string;
  updatedAt: string;
  reward?: Reward;
}

export interface RewardWithStatus extends Reward {
  isClaimed: boolean;
  claimedAt: string | null;
  assignedAt: string;
  expiresAt: string | null;
  source: string;
  playerRewardId: string;
}

export interface PlayerBalance {
  playerId: string;
  totalCoins: number;
  totalXP: number;
  level: number;
  claimedRewardsCount: number;
  assignedRewardsCount: number;
}

export type RewardTabType = 'assigned' | 'claimed' | 'balance';
