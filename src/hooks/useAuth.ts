import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/auth.service';
import { useAuthStore } from '../store/auth';
import type { LoginInput, RegisterInput } from '../schemas/auth.schema';

export function useLogin() {
  const navigate = useNavigate();
  const setUser = useAuthStore((state) => state.setUser);

  return useMutation({
    mutationFn: (data: LoginInput) => authService.login(data),
    onSuccess: (response) => {
      setUser(response.player);
      navigate('/dashboard');
    }
  });
}

export function useRegister() {
  const navigate = useNavigate();
  const setUser = useAuthStore((state) => state.setUser);

  return useMutation({
    mutationFn: (data: Omit<RegisterInput, 'confirmPassword'>) => 
      authService.register(data),
    onSuccess: (player) => {
      setUser(player);
      navigate('/dashboard');
    }
  });
}

export function useLogout() {
  const navigate = useNavigate();
  const logout = useAuthStore((state) => state.logout);

  return useMutation({
    mutationFn: () => authService.logout(),
    onSuccess: () => {
      logout();
      navigate('/login');
    },
    onError: () => {
      // Incluso si falla el logout en backend, limpiamos localmente
      logout();
      navigate('/login');
    }
  });
}
