import { create } from 'zustand';

export interface Notification {
  id: string;
  type: 'success' | 'info' | 'error';
  title: string;
  message: string;
  icon?: string;
  timestamp: number;
}

interface NotificationState {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp'>) => void;
  removeNotification: (id: string) => void;
  clearAll: () => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: [],
  
  addNotification: (notification) => {
    const id = `notif-${Date.now()}-${Math.random()}`;
    const newNotif = {
      ...notification,
      id,
      timestamp: Date.now(),
    };
    
    set((state) => ({
      notifications: [...state.notifications, newNotif],
    }));
    
    // Auto-remove después de 5 segundos
    setTimeout(() => {
      set((state) => ({
        notifications: state.notifications.filter(n => n.id !== id),
      }));
    }, 5000);
  },
  
  removeNotification: (id) => 
    set((state) => ({
      notifications: state.notifications.filter(n => n.id !== id),
    })),
  
  clearAll: () => set({ notifications: [] }),
}));