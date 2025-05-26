import axios from 'axios';

const api = axios.create({
  baseURL: 'https://guias-maternos-api.onrender.com',
  headers: {
    'Content-Type': 'application/json',
  }
});

// Interceptor para adicionar token de autenticação
api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

export default api;
