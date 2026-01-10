import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { ReactNode } from 'react';
import { useLogin, useRegister, useLogout } from './useAuth';
import { authService } from '../services/auth.service';
import { useAuthStore } from '../store/auth';

vi.mock('../services/auth.service', () => ({
  authService: {
    login: vi.fn(),
    register: vi.fn(),
    logout: vi.fn()
  }
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    BrowserRouter: (actual as any).BrowserRouter
  };
});

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false }
  }
});

const wrapper = ({ children }: { children: ReactNode }) => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      {children}
    </BrowserRouter>
  </QueryClientProvider>
);

describe('useLogin', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    queryClient.clear();
    useAuthStore.getState().logout();
  });

  it('logs in user successfully', async () => {
    const mockResponse = {
      player: {
        id: '1',
        username: 'testuser',
        email: 'test@example.com',
        createdAt: new Date().toISOString()
      },
      message: 'Login successful'
    };

    (authService.login as any).mockResolvedValue(mockResponse);

    const { result } = renderHook(() => useLogin(), { wrapper });

    result.current.mutate({
      username: 'testuser'
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(authService.login).toHaveBeenCalledWith({
      username: 'testuser'
    });

    expect(useAuthStore.getState().user?.username).toBe('testuser');
    expect(useAuthStore.getState().isAuthenticated).toBe(true);
    expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
  });

  it('handles login error', async () => {
    (authService.login as any).mockRejectedValue(new Error('Invalid credentials'));

    const { result } = renderHook(() => useLogin(), { wrapper });

    result.current.mutate({
      username: 'testuser'
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(useAuthStore.getState().isAuthenticated).toBe(false);
  });
});

describe('useRegister', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    queryClient.clear();
    useAuthStore.getState().logout();
  });

  it('registers user successfully', async () => {
    const mockResponse = {
      id: '1',
      username: 'newuser',
      email: 'newuser@gaming.local',
      createdAt: new Date().toISOString()
    };

    (authService.register as any).mockResolvedValue(mockResponse);

    const { result } = renderHook(() => useRegister(), { wrapper });

    result.current.mutate({
      username: 'newuser',
      email: 'newuser@example.com'
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(authService.register).toHaveBeenCalledWith({
      username: 'newuser',
      email: 'newuser@example.com'
    });

    expect(useAuthStore.getState().user?.username).toBe('newuser');
    expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
  });
});

describe('useLogout', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    queryClient.clear();
    
    // Set initial authenticated state
    useAuthStore.getState().setUser({
      id: '1',
      username: 'testuser',
      email: 'test@example.com',
      createdAt: new Date().toISOString()
    });
  });

  it('logs out user successfully', async () => {
    (authService.logout as any).mockResolvedValue(undefined);

    const { result } = renderHook(() => useLogout(), { wrapper });

    result.current.mutate();

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(authService.logout).toHaveBeenCalled();
    expect(useAuthStore.getState().user).toBeNull();
    expect(useAuthStore.getState().isAuthenticated).toBe(false);
    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });

  it('logs out locally even if backend fails', async () => {
    (authService.logout as any).mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() => useLogout(), { wrapper });

    result.current.mutate();

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    // Should still clear local state and redirect
    expect(useAuthStore.getState().user).toBeNull();
    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });
});
