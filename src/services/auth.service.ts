import api from '../lib/api';
import type { RegisterInput, LoginInput, AuthResponse, LoginResponse } from '../schemas/auth.schema';

export const authService = {
  // POST /players - Registro
  register: async (data: Omit<RegisterInput, 'confirmPassword'>): Promise<AuthResponse> => {
    const response = await api.put('/players', data);
    return response.data;
  },

  // POST /auth/login - Login
  login: async (data: LoginInput): Promise<LoginResponse> => {
    const response = await api.post('/auth/login', data);
    return response.data;
  },

  // POST /auth/logout - Logout
  logout: async (): Promise<void> => {
    await api.post('/auth/logout');
  },

  // GET /players/:id - Obtener perfil
  getProfile: async (id: string): Promise<AuthResponse> => {
    const response = await api.get(`/players/${id}`);
    return response.data;
  }
};
