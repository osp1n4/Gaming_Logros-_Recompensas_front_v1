import { useAuthStore } from '../../store/auth';
import { usePlayerDashboard } from '../../hooks/usePlayerDashboard';
import StatCard from './StatCard';

export default function StatsGrid() {
  const user = useAuthStore((state) => state.user);
  const { player, achievements, balance } = usePlayerDashboard();

  const unlockedCount = achievements?.filter((a: any) => a.progress >= a.targetValue).length || 0;
  const totalAchievements = achievements?.length || 0;

  const stats = [
    {
      label: 'Monedas',
      value: player?.coins?.toLocaleString() || user?.coins?.toLocaleString() || '0',
      icon: 'payments',
      color: 'yellow' as const,
    },
    {
      label: 'Puntos de Experiencia',
      value: `${player?.xp?.toLocaleString() || user?.xp?.toLocaleString() || '0'} XP`,
      icon: 'bolt',
      color: 'primary' as const,
    },
    {
      label: 'Logros',
      value: `${unlockedCount} de ${totalAchievements}`,
      icon: 'emoji_events',
      color: 'pink' as const,
      badge: `${unlockedCount}/${totalAchievements}`,
    },
    {
      label: 'Nivel Actual',
      value: `Nivel ${player?.level || user?.level || 1}`,
      icon: 'military_tech',
      color: 'blue' as const,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat) => (
        <StatCard key={stat.label} {...stat} />
      ))}
    </div>
  );
}
