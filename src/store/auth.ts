import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AuthResponse } from '../schemas/auth.schema';

interface AuthState {
  user: AuthResponse | null;
  isAuthenticated: boolean;
  setUser: (user: AuthResponse | null) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      setUser: (user) => set({ user, isAuthenticated: !!user }),
      logout: () => set({ user: null, isAuthenticated: false })
    }),
    {
      name: 'auth-storage'
    }
  )
);
