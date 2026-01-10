import { render, screen, act, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { NotificationCenter } from '../NotificationCenter';
import { useNotificationStore } from '../../../../store/notification.store';

describe('NotificationCenter', () => {
  beforeEach(() => {
    // Limpiar el store antes de cada test
    useNotificationStore.getState().clearAll();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  test('muestra notificación y auto-desaparece en 5 segundos', async () => {
    render(<NotificationCenter />);
    
    act(() => {
      useNotificationStore.getState().addNotification({
        type: 'success',
        title: 'Test Success',
        message: 'This is a test notification',
      });
    });
    
    expect(screen.getByText('Test Success')).toBeInTheDocument();
    expect(screen.getByText('This is a test notification')).toBeInTheDocument();
    
    // Verificar que la notificación existe en el store
    expect(useNotificationStore.getState().notifications).toHaveLength(1);
    
    // Simular el paso del tiempo
    act(() => {
      vi.advanceTimersByTime(5000);
    });
    
    // Verificar que fue removida del store
    expect(useNotificationStore.getState().notifications).toHaveLength(0);
  });

  test('muestra múltiples notificaciones', () => {
    render(<NotificationCenter />);
    
    act(() => {
      useNotificationStore.getState().addNotification({
        type: 'success',
        title: 'Success 1',
        message: 'First notification',
      });
      
      useNotificationStore.getState().addNotification({
        type: 'error',
        title: 'Error 1',
        message: 'Second notification',
      });
    });
    
    expect(screen.getByText('Success 1')).toBeInTheDocument();
    expect(screen.getByText('Error 1')).toBeInTheDocument();
  });

  test('permite cerrar notificación manualmente', () => {
    render(<NotificationCenter />);
    
    act(() => {
      useNotificationStore.getState().addNotification({
        type: 'info',
        title: 'Info Test',
        message: 'Closable notification',
      });
    });
    
    expect(screen.getByText('Info Test')).toBeInTheDocument();
    
    const closeButton = screen.getByLabelText('Close notification');
    act(() => {
      closeButton.click();
    });
    
    expect(screen.queryByText('Info Test')).not.toBeInTheDocument();
  });

  test('muestra icono correcto según tipo', () => {
    render(<NotificationCenter />);
    
    act(() => {
      useNotificationStore.getState().addNotification({
        type: 'success',
        title: 'Success',
        message: 'Success message',
        icon: 'emoji_events',
      });
    });
    
    expect(screen.getByText('emoji_events')).toBeInTheDocument();
  });
});