import { create } from 'zustand';

interface AuthState {
  token: string | null;
  userId: string | null;
  setToken: (t: string | null) => void;
  setUserId: (id: string | null) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  userId: null,
  setToken: (t) => set({ token: t }),
  setUserId: (id) => set({ userId: id }),
  logout: () => set({ token: null, userId: null })
}));
