// src/api/apiService.ts
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para añadir el token a las peticiones
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const dashboardApi = {
  getDashboardStats: async () => {
    const response = await api.get('/api/dashboard/stats');
    return response.data;
  },
  
  getActiveCameras: async () => {
    const response = await api.get('/api/cameras/active');
    return response.data;
  },
  
  getActiveAlarms: async () => {
    const response = await api.get('/api/alarms/active');
    return response.data;
  },
  
  getRecentAlerts: async () => {
    const response = await api.get('/api/alerts/recent');
    return response.data;
  }
};

export const authApi = {
  login: async (email: string, password: string) => {
    const response = await api.post('/api/auth/login', { email, password });
    return response.data;
  },
  
  logout: async () => {
    const response = await api.post('/api/auth/logout');
    return response.data;
  }
};

export default api;