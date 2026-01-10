import { useState } from 'react';

interface EventCardProps {
  title: string;
  description: string;
  rewards?: { gold: number; xp: number };
  progress?: { current: number; max: number };
  action: string;
  color: 'red' | 'blue' | 'green' | 'purple';
  icon: string;
  disabled?: boolean;
  loading?: boolean;
  onAction: () => void;
}

const colorStyles = {
  red: {
    border: 'border-red-500/50',
    bg: 'bg-red-500/10',
    icon: 'text-red-400',
    button: 'bg-red-500 hover:bg-red-600',
  },
  blue: {
    border: 'border-blue-500/50',
    bg: 'bg-blue-500/10',
    icon: 'text-blue-400',
    button: 'bg-blue-500 hover:bg-blue-600',
  },
  green: {
    border: 'border-green-500/50',
    bg: 'bg-green-500/10',
    icon: 'text-green-400',
    button: 'bg-green-500 hover:bg-green-600',
  },
  purple: {
    border: 'border-purple-500/50',
    bg: 'bg-purple-500/10',
    icon: 'text-purple-400',
    button: 'bg-purple-500 hover:bg-purple-600',
  },
};

export default function EventCard({
  title,
  description,
  rewards,
  progress,
  action,
  color,
  icon,
  disabled,
  loading,
  onAction,
}: EventCardProps) {
  const [isExecuting, setIsExecuting] = useState(false);
  const styles = colorStyles[color];
  const isLoading = loading || isExecuting;

  const handleAction = async () => {
    if (disabled || isLoading) return;
    
    setIsExecuting(true);
    try {
      await onAction();
    } finally {
      setTimeout(() => setIsExecuting(false), 1000);
    }
  };

  return (
    <div className={`bg-gray-800/50 backdrop-blur-xl rounded-xl border-2 ${styles.border} p-6 flex flex-col gap-4 transition-all hover:-translate-y-1`}>
      {/* Header */}
      <div className="flex items-start gap-4">
        <div className={`w-14 h-14 rounded-lg ${styles.bg} flex items-center justify-center flex-shrink-0`}>
          <span className={`material-symbols-outlined ${styles.icon} text-3xl`}>
            {icon}
          </span>
        </div>
        <div className="flex-1">
          <h3 className="text-white font-bold text-lg mb-1">{title}</h3>
          <p className="text-gray-400 text-sm">{description}</p>
        </div>
      </div>

      {/* Rewards */}
      {rewards && (
        <div className="flex gap-4">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-yellow-500 text-sm">
              payments
            </span>
            <span className="text-yellow-500 font-bold text-sm">
              {rewards.gold.toLocaleString()} Gold
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-purple-400 text-sm">
              bolt
            </span>
            <span className="text-purple-400 font-bold text-sm">
              {rewards.xp.toLocaleString()} XP
            </span>
          </div>
        </div>
      )}

      {/* Progress Bar */}
      {progress && (
        <div>
          <div className="flex justify-between text-xs text-gray-400 mb-2">
            <span>Progreso</span>
            <span>{progress.current}/{progress.max} min</span>
          </div>
          <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
            <div
              className={`h-full ${styles.bg} ${styles.icon} transition-all duration-300`}
              style={{ width: `${(progress.current / progress.max) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Action Button */}
      <button
        onClick={handleAction}
        disabled={disabled || isLoading}
        className={`w-full py-3 rounded-lg font-bold text-white transition-all ${
          disabled
            ? 'bg-gray-600 cursor-not-allowed opacity-50'
            : `${styles.button} shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-wait`
        }`}
      >
        {isLoading ? (
          <span className="flex items-center justify-center gap-2">
            <span className="material-symbols-outlined animate-spin">refresh</span>
            Ejecutando...
          </span>
        ) : (
          action
        )}
      </button>
    </div>
  );
}
