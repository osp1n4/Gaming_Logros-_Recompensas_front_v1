import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

api.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (res) => res,
  (err) => {
    // Manejo de errores y redirección para sesiones no autenticadas
    const status = err?.response?.status;
    const pathname = window.location.pathname;
    
    // Solo redirigir a login si no estamos ya ahí y hay error 401
    if (status === 401 && pathname !== '/login') {
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default api;
