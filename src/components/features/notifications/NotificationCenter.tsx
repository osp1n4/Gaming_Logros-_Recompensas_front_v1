import { useNotificationStore } from '../../../store/notification.store';
import { ToastNotification } from './ToastNotification';

export const NotificationCenter = () => {
  const notifications = useNotificationStore((s) => s.notifications);

  return (
    <div className="fixed top-20 right-6 z-50 space-y-4 w-96 max-w-[90vw]">
      {notifications.map((notif) => (
        <ToastNotification key={notif.id} notification={notif} />
      ))}
    </div>
  );
};