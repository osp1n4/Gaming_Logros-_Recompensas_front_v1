import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import DashboardLayout from '../components/layout/DashboardLayout';
import StatsOverview from '../components/achievements/StatsOverview';
import OverallProgress from '../components/achievements/OverallProgress';
import Toolbar from '../components/achievements/Toolbar';
import AchievementGrid from '../components/achievements/AchievementGrid';
import AchievementModal from '../components/achievements/AchievementModal';
import { AchievementDetailModal } from '../components/features/achievements/AchievementDetailModal';
import { getPlayerAchievements } from '../services/achievement.service';
import { useAuthStore } from '../store/auth';
import { AchievementFilterType, AchievementWithProgress } from '../types/achievement.types';

export default function Achievements() {
  const user = useAuthStore((s) => s.user);
  const playerId = user?.id;

  const [filter, setFilter] = useState<AchievementFilterType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAchievement, setSelectedAchievement] = useState<AchievementWithProgress | null>(null);

  const { data: achievements, isLoading } = useQuery({
    queryKey: ['achievements', playerId],
    queryFn: () => getPlayerAchievements(playerId!),
    enabled: !!playerId,
  });

  const filteredAchievements = useMemo(() => {
    let result = achievements || [];

    // Filtrar por tipo
    if (filter === 'unlocked') {
      result = result.filter((a) => a.isUnlocked);
    } else if (filter === 'locked') {
      result = result.filter((a) => !a.isUnlocked && a.progress === 0);
    } else if (filter === 'timed') {
      result = result.filter((a) => a.isTimed && !a.isUnlocked);
    }

    // Buscar por nombre o descripción
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (a) =>
          a.name.toLowerCase().includes(query) ||
          a.description.toLowerCase().includes(query)
      );
    }

    return result;
  }, [achievements, filter, searchQuery]);

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 mb-2">
          Logros
        </h1>
        <p className="text-gray-400">
          Rastrea tu progreso y desbloquea recompensas
        </p>
      </div>

      {/* Stats Overview */}
      <StatsOverview achievements={achievements} />

      {/* Overall Progress */}
      <OverallProgress achievements={achievements} />

      {/* Toolbar */}
      <Toolbar
        filter={filter}
        onFilterChange={setFilter}
        onSearch={setSearchQuery}
      />

      {/* Achievement Grid */}
      <AchievementGrid
        achievements={filteredAchievements}
        isLoading={isLoading}
        onCardClick={setSelectedAchievement}
      />

      {/* Modal Original */}
      <AchievementModal
        achievement={selectedAchievement}
        onClose={() => setSelectedAchievement(null)}
      />

      {/* Nuevo Modal Detallado */}
      <AchievementDetailModal
        achievement={selectedAchievement}
        isOpen={!!selectedAchievement}
        onClose={() => setSelectedAchievement(null)}
      />
    </DashboardLayout>
  );
}
