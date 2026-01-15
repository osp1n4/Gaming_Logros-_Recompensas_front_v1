import { AchievementWithProgress } from '../../types/achievement.types';
import AchievementCard from './AchievementCard';

interface AchievementGridProps {
  achievements: AchievementWithProgress[];
  isLoading: boolean;
  onCardClick?: (achievement: AchievementWithProgress) => void;
}

function SkeletonAchievementCard() {
  return (
    <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-5 animate-pulse">
      <div className="flex justify-between items-start mb-4">
        <div className="size-14 bg-gray-700 rounded-lg" />
        <div className="w-16 h-6 bg-gray-700 rounded" />
      </div>
      <div className="space-y-2">
        <div className="h-6 bg-gray-700 rounded w-3/4" />
        <div className="h-4 bg-gray-700 rounded w-full" />
        <div className="h-4 bg-gray-700 rounded w-5/6" />
      </div>
      <div className="mt-6 flex justify-between">
        <div className="h-4 bg-gray-700 rounded w-20" />
        <div className="h-4 bg-gray-700 rounded w-20" />
      </div>
    </div>
  );
}

export default function AchievementGrid({ 
  achievements, 
  isLoading,
  onCardClick 
}: AchievementGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {[...Array(8)].map((_, i) => (
          <SkeletonAchievementCard key={i} />
        ))}
      </div>
    );
  }

  if (achievements.length === 0) {
    return (
      <div className="text-center py-20">
        <span className="material-symbols-outlined text-gray-600 text-6xl mb-4">
          search_off
        </span>
        <p className="text-gray-400 text-lg">No se encontraron logros</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {achievements.map((achievement) => (
        <AchievementCard
          key={achievement.id}
          achievement={achievement}
          onClick={() => onCardClick?.(achievement)}
        />
      ))}
    </div>
  );
}
