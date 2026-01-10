import { useAuthStore } from '../../store/auth';
import { usePlayerDashboard } from '../../hooks/usePlayerDashboard';
import StatCard from './StatCard';

export default function StatsGrid() {
  const user = useAuthStore((state) => state.user);
  const { player, achievements, balance } = usePlayerDashboard();

  const unlockedCount = achievements?.filter((a: any) => a.unlockedAt !== null).length || 0;
  const totalAchievements = achievements?.length || 0;

  // Usar datos del balance o player, con fallback a user del store
  const coins = balance?.totalCoins || player?.coins || user?.coins || 0;
  const xp = balance?.totalPoints || player?.xp || user?.xp || 0;
  const level = player?.level || user?.level || 1;

  const stats = [
    {
      label: 'Monedas',
      value: coins.toLocaleString(),
      icon: 'payments',
      color: 'yellow' as const,
    },
    {
      label: 'Puntos de Experiencia',
      value: `${xp.toLocaleString()} XP`,
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
      value: `Nivel ${level}`,
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
