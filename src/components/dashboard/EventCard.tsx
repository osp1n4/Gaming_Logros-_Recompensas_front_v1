import { useState } from 'react';
import { useAuthStore } from '../../store/auth';

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
  nextAchievement?: {
    name: string;
    current: number;
    required: number;
    progress: number;
  } | null;
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
  nextAchievement,
}: EventCardProps) {
  const [isExecuting, setIsExecuting] = useState(false);
  const [isAttacking, setIsAttacking] = useState(false);
  const user = useAuthStore((state) => state.user);
  const styles = colorStyles[color];
  const isLoading = loading || isExecuting;

  // Determinar el monstruo según los monstruos matados
  const getMonsterEmoji = () => {
    const monstersKilled = user?.monstersKilled || 0;
    if (monstersKilled < 5) return '👾'; // Monstruo básico
    if (monstersKilled < 10) return '🧟'; // Zombie
    if (monstersKilled < 15) return '🐉'; // Dragón pequeño
    if (monstersKilled < 20) return '👹'; // Demonio
    return '🐲'; // Dragón épico
  };

  const handleAction = async () => {
    if (disabled || isLoading) return;
    
    // Activar animación de ataque solo para "Matar Monstruo"
    if (title === 'Matar Monstruo') {
      setIsAttacking(true);
      setTimeout(() => setIsAttacking(false), 800);
    }
    
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

      {/* Animación de batalla solo para "Matar Monstruo" */}
      {title === 'Matar Monstruo' && (
        <div className={`battle-container flex items-center justify-center gap-8 py-4 px-6 bg-gray-900/50 rounded-lg relative overflow-hidden ${isAttacking ? 'battle-active' : ''}`}>
          <div className={`battle-hero text-4xl ${isAttacking ? 'attacking' : ''}`}>
            🗡️
          </div>
          <div className={`text-yellow-400 text-2xl ${isAttacking ? 'impact-flash' : ''}`}>⚔️</div>
          <div className={`battle-monster text-4xl ${isAttacking ? 'hit' : ''}`}>
            {getMonsterEmoji()}
          </div>
        </div>
      )}

      {/* Barra de progreso del siguiente logro */}
      {nextAchievement && (
        <div className="bg-gray-900/30 rounded-lg p-4 border border-gray-700/50">
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-300 text-sm font-medium">
              🏆 Siguiente Logro: {nextAchievement.name.replace(/_/g, ' ')}
            </span>
            <span className="text-gray-400 text-xs">
              {nextAchievement.current}/{nextAchievement.required}
            </span>
          </div>
          <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ease-out ${
                nextAchievement.progress >= 100
                  ? 'bg-gradient-to-r from-green-500 to-green-400'
                  : 'bg-gradient-to-r from-orange-500 to-yellow-400'
              }`}
              style={{ width: `${Math.min(nextAchievement.progress, 100)}%` }}
            />
          </div>
          <div className="mt-1 text-right">
            <span className="text-xs text-gray-500">
              {Math.round(nextAchievement.progress)}% completado
            </span>
          </div>
        </div>
      )}

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
