import { useEffect } from 'react';

interface ToastProps {
  message: string;
  type?: 'success' | 'info' | 'warning' | 'error';
  duration?: number;
  onClose: () => void;
}

export default function Toast({ message, type = 'success', duration = 1500, onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const bgColor = {
    success: 'bg-green-600',
    info: 'bg-blue-600',
    warning: 'bg-yellow-600',
    error: 'bg-red-600',
  }[type];

  const icon = {
    success: '✅',
    info: 'ℹ️',
    warning: '⚠️',
    error: '❌',
  }[type];

  return (
    <div className="fixed top-4 right-4 z-50 animate-slide-in-right">
      <div className={`${bgColor} text-white px-6 py-4 rounded-lg shadow-2xl max-w-md flex items-start gap-3`}>
        <span className="text-2xl">{icon}</span>
        <div className="flex-1 whitespace-pre-line text-sm font-medium">
          {message}
        </div>
        <button
          onClick={onClose}
          className="text-white/80 hover:text-white transition-colors ml-2"
          aria-label="Cerrar"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
