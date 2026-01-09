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
    // Log básico y posibilidad de manejar 401 para redireccionar a login
    const status = err?.response?.status;
    if (status === 401) {
      // TODO: Redirigir a /login si no autenticado
    }
    return Promise.reject(err);
  }
);

export default api;
