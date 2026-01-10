import { z } from 'zod';

// Schema para registro (username + email)
export const registerSchema = z.object({
  username: z
    .string()
    .min(3, 'El nombre de usuario debe tener al menos 3 caracteres')
    .max(20, 'El nombre de usuario no puede tener más de 20 caracteres')
    .regex(/^[a-zA-Z0-9_]+$/, 'Solo letras, números y guiones bajos'),
  email: z
    .string()
    .email('Correo electrónico inválido')
    .min(1, 'El correo electrónico es requerido')
});

// Schema para login (solo username)
export const loginSchema = z.object({
  username: z
    .string()
    .min(3, 'El nombre de usuario debe tener al menos 3 caracteres')
    .max(20, 'El nombre de usuario no puede tener más de 20 caracteres')
    .regex(/^[a-zA-Z0-9_]+$/, 'Solo letras, números y guiones bajos')
});

// Tipos inferidos
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;

// Response types del backend
export interface AuthResponse {
  id: string;
  username: string;
  email: string;
  createdAt: string;
}

export interface LoginResponse {
  player: AuthResponse;
  message: string;
}
