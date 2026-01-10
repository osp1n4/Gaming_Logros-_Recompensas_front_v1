import { useNotificationStore } from '../store/notification.store';

export const useAppNotifications = () => {
  const addNotification = useNotificationStore((s) => s.addNotification);

  // Función para mostrar notificación de éxito
  const notifySuccess = (title: string, message: string, icon?: string) => {
    addNotification({
      type: 'success',
      title,
      message,
      icon: icon || 'emoji_events',
    });
  };

  // Función para mostrar notificación de info
  const notifyInfo = (title: string, message: string, icon?: string) => {
    addNotification({
      type: 'info',
      title,
      message,
      icon: icon || 'info',
    });
  };

  // Función para mostrar notificación de error
  const notifyError = (title: string, message: string, icon?: string) => {
    addNotification({
      type: 'error',
      title,
      message,
      icon: icon || 'error',
    });
  };

  // Funciones específicas para eventos del juego
  const notifyAchievementProgress = (achievementName: string, progress: number) => {
    notifyInfo(
      'Achievement Progress',
      `${achievementName}: ${progress}% complete`,
      'psychology'
    );
  };

  const notifyAchievementCompleted = (achievementName: string) => {
    notifySuccess(
      'Achievement Unlocked!',
      `Congratulations! You completed: ${achievementName}`,
      'emoji_events'
    );
  };

  const notifyDataSync = () => {
    notifyInfo(
      'Data Synchronized',
      'Your progress has been saved successfully',
      'cloud_sync'
    );
  };

  return {
    notifySuccess,
    notifyInfo,
    notifyError,
    notifyAchievementProgress,
    notifyAchievementCompleted,
    notifyDataSync,
  };
};