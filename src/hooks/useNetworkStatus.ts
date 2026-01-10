import { useState, useEffect } from 'react';
import { useAppNotifications } from './useAppNotifications';

export const useNetworkStatus = () => {
  const { notifySuccess, notifyError } = useAppNotifications();
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      notifySuccess('Back Online', 'Connection restored successfully', 'wifi');
    };

    const handleOffline = () => {
      setIsOnline(false);
      notifyError('Connection Lost', 'Working offline. Changes will sync when reconnected', 'wifi_off');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [notifySuccess, notifyError]);

  return { isOnline };
};