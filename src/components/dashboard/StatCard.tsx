import { useEffect, useState } from 'react';

interface StatCardProps {
  label: string;
  value: string;
  icon: string;
  color: 'yellow' | 'primary' | 'pink' | 'blue';
  change?: string;
  badge?: string;
  isLoading?: boolean;
}

const colorStyles = {
  yellow: {
    border: 'border-yellow-500/50',
    glow: 'shadow-lg shadow-yellow-500/20',
    icon: 'text-yellow-500',
    bg: 'bg-yellow-500/10',
  },
  primary: {
    border: 'border-purple-500/50',
    glow: 'shadow-lg shadow-purple-500/20',
    icon: 'text-purple-400',
    bg: 'bg-purple-500/10',
  },
  pink: {
    border: 'border-pink-500/50',
    glow: 'shadow-lg shadow-pink-500/20',
    icon: 'text-pink-400',
    bg: 'bg-pink-500/10',
  },
  blue: {
    border: 'border-blue-500/50',
    glow: 'shadow-lg shadow-blue-500/20',
    icon: 'text-blue-400',
    bg: 'bg-blue-500/10',
  },
};

export default function StatCard({ label, value, icon, color, change, badge, isLoading }: StatCardProps) {
  const styles = colorStyles[color];
  const [isUpdating, setIsUpdating] = useState(false);
  const [previousValue, setPreviousValue] = useState(value);

  // Detectar cuando el valor cambia y activar animación
  useEffect(() => {
    if (value !== previousValue && !isLoading) {
      setIsUpdating(true);
      const timer = setTimeout(() => {
        setIsUpdating(false);
        setPreviousValue(value);
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [value, previousValue, isLoading]);

  if (isLoading) {
    return (
      <div className="bg-gray-800/50 backdrop-blur-xl rounded-xl border border-purple-500/20 p-6 animate-pulse">
        <div className="h-8 bg-gray-700 rounded mb-4 w-3/4" />
        <div className="h-10 bg-gray-700 rounded w-1/2" />
      </div>
    );
  }

  return (
    <div className={`bg-gray-800/50 backdrop-blur-xl rounded-xl border-2 ${styles.border} ${styles.glow} p-6 transition-all hover:-translate-y-1 hover:${styles.glow} overflow-hidden ${isUpdating ? 'stat-card-update' : ''}`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className={`w-12 h-12 rounded-lg ${styles.bg} flex items-center justify-center`}>
          <span className={`material-symbols-outlined ${styles.icon} text-2xl`}>
            {icon}
          </span>
        </div>
        {badge && (
          <span className={`px-3 py-1 rounded-full ${styles.bg} ${styles.icon} text-xs font-bold`}>
            {badge}
          </span>
        )}
      </div>

      {/* Content */}
      <div>
        <p className="text-gray-400 text-sm font-medium mb-1">{label}</p>
        <p className={`text-white text-xl lg:text-2xl xl:text-3xl font-black leading-tight break-words ${isUpdating ? 'stat-value-update' : ''}`}>{value}</p>
        {change && (
          <p className={`text-sm mt-2 ${change.startsWith('+') ? 'text-green-400' : 'text-red-400'}`}>
            {change}
          </p>
        )}
      </div>
    </div>
  );
}
