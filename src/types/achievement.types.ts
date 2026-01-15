export interface Achievement {
  id: string;
  name: string;
  description: string;
  xpReward: number;
  coinReward: number;
  category: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD' | 'LEGENDARY';
  icon: string;
  createdAt: string;
  updatedAt: string;
}

export interface PlayerAchievement {
  id: string;
  playerId: string;
  achievementId: string;
  isUnlocked: boolean;
  unlockedAt: string | null;
  progress: number;
  maxProgress: number;
  isTimed: boolean;
  expiresAt: string | null;
  createdAt: string;
  updatedAt: string;
  achievement?: Achievement;
}

export interface AchievementWithProgress extends Achievement {
  isUnlocked: boolean;
  progress: number;
  maxProgress: number;
  isTimed: boolean;
  expiresAt: string | null;
  unlockedAt: string | null;
}

export type AchievementFilterType = 'all' | 'unlocked' | 'locked' | 'timed';
