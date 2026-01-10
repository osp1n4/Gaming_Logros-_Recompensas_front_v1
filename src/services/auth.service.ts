import api from '../lib/api';
import type { RegisterInput, LoginInput, AuthResponse, LoginResponse } from '../schemas/auth.schema';

export const authService = {
  // PUT /players - Registro
  register: async (data: RegisterInput): Promise<AuthResponse> => {
    const response = await api.put('/players', data);
    return response.data;
  },

  // POST /auth/login - Login (usa username como email)
  login: async (data: LoginInput): Promise<LoginResponse> => {
    try {
      // Buscar al jugador por username usando GET /players
      const playersResponse = await api.get('/players');
      const players = Array.isArray(playersResponse.data) 
        ? playersResponse.data 
        : [];
      
      // Buscar el jugador con el username proporcionado (case-insensitive)
      const player = players.find((p: any) => 
        p.username?.toLowerCase() === data.username?.toLowerCase()
      );
      
      if (!player) {
        throw { 
          response: { 
            data: { 
              message: 'Usuario no encontrado. Por favor regístrate primero.' 
            } 
          } 
        };
      }
      
      // Retornar el jugador encontrado como si fuera un login exitoso
      return {
        player: player,
        message: 'Login exitoso'
      };
    } catch (error: any) {
      // Si el error ya tiene formato específico, re-lanzarlo
      if (error.response) {
        throw error;
      }
      // Si es otro tipo de error, envolverlo
      throw {
        response: {
          data: {
            message: error.message || 'Error al iniciar sesión'
          }
        }
      };
    }
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
