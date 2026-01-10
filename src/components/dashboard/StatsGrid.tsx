import { useAuthStore } from '../../store/auth';
import StatCard from './StatCard';

export default function StatsGrid() {
  const user = useAuthStore((state) => state.user);

  const stats = [
    {
      label: 'Monedas',
      value: user?.coins?.toLocaleString() || '0',
      icon: 'payments',
      color: 'yellow' as const,
      change: '+12%',
    },
    {
      label: 'Puntos de Experiencia',
      value: `${user?.xp?.toLocaleString() || '0'} XP`,
      icon: 'bolt',
      color: 'primary' as const,
      change: '+22%',
    },
    {
      label: 'Logros',
      value: 'Principiante',
      icon: 'emoji_events',
      color: 'pink' as const,
      badge: '3/100',
    },
    {
      label: 'Nivel Actual',
      value: `Nivel ${user?.level || 1}`,
      icon: 'military_tech',
      color: 'blue' as const,
      badge: `Rango ${user?.level || 1}`,
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
