// Tipos para el leaderboard alineados con la entidad Player del backend
export interface LeaderboardPlayer {
  id: string;
  username: string;
  email: string;
  monstersKilled: number;
  timePlayed: number; // en minutos
  createdAt: string;
  isActive: boolean;
}

export type MetricType = 'monsters' | 'time';

export interface LeaderboardData {
  players: LeaderboardPlayer[];
  currentUserRank?: {
    rank: number;
    player: LeaderboardPlayer;
  };
}

export interface MetricOption {
  id: MetricType;
  label: string;
  icon: string;
}

// Helper interfaces para el podio y ranking
export interface PodiumPosition {
  rank: number;
  medal: 'gold' | 'silver' | 'bronze';
  player: LeaderboardPlayer;
}

export interface PlayerRank {
  rank: number;
  player: LeaderboardPlayer;
}