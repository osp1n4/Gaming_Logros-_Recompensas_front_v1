import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 10000
});

api.interceptors.request.use((config) => {
  // Incluir credenciales si usamos cookies httpOnly
  config.withCredentials = true;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    // Manejo de errores y redirección para sesiones no autenticadas
    const status = err?.response?.status;
    if (status === 401) {
      // Redirigir a /login si no autenticado
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default api;
