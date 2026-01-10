import { Notification, useNotificationStore } from '../../../store/notification.store';

interface ToastProps {
  notification: Notification;
}

export const ToastNotification = ({ notification }: ToastProps) => {
  const removeNotification = useNotificationStore((s) => s.removeNotification);

  const typeConfig = {
    success: {
      borderColor: 'border-green-500/30',
      bgColor: 'bg-green-500/10',
      textColor: 'text-green-400',
      shadow: 'shadow-green-500/20',
      defaultIcon: 'check_circle',
      accentIcon: 'celebration',
    },
    info: {
      borderColor: 'border-blue-500/30',
      bgColor: 'bg-blue-500/10',
      textColor: 'text-blue-400',
      shadow: 'shadow-blue-500/20',
      defaultIcon: 'info',
      accentIcon: 'lightbulb',
    },
    error: {
      borderColor: 'border-red-500/30',
      bgColor: 'bg-red-500/10',
      textColor: 'text-red-400',
      shadow: 'shadow-red-500/20',
      defaultIcon: 'error',
      accentIcon: 'warning',
    },
  };

  const config = typeConfig[notification.type];

  return (
    <div 
      className={`flex items-center gap-4 bg-gray-800 border ${config.borderColor} rounded-xl p-4 shadow-lg backdrop-blur-sm animate-in slide-in-from-right-4 duration-300`}
      role="alert"
      aria-live="polite"
    >
      {/* Main Icon */}
      <div className={`${config.textColor} ${config.bgColor} rounded-lg w-12 h-12 flex items-center justify-center flex-shrink-0`}>
        <span className="material-symbols-outlined">
          {notification.icon || config.defaultIcon}
        </span>
      </div>

      {/* Content */}
      <div className="flex-1">
        <p className="text-white text-sm font-bold">{notification.title}</p>
        <p className="text-gray-400 text-xs">{notification.message}</p>
      </div>

      {/* Accent Icon */}
      <div className={`flex-shrink-0 ${config.textColor}`}>
        <span className="material-symbols-outlined">{config.accentIcon}</span>
      </div>

      {/* Close Button */}
      <button
        onClick={() => removeNotification(notification.id)}
        className="flex-shrink-0 text-gray-500 hover:text-white ml-2 transition-colors"
        aria-label="Close notification"
      >
        <span className="material-symbols-outlined text-sm">close</span>
      </button>
    </div>
  );
};