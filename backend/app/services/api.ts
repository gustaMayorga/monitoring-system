// src/services/api.ts
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000',
});

// Interceptor para agregar el token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor para manejar errores
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: async (email: string, password: string) => {
    const response = await api.post('/auth/token', {
      username: email,
      password: password
    });
    return response.data;
  },
  
  verifyToken: async () => {
    const response = await api.get('/auth/verify');
    return response.data;
  }
};

export const devicesAPI = {
  getDevices: async () => {
    const response = await api.get('/devices');
    return response.data;
  },
  
  createDevice: async (deviceData: any) => {
    const response = await api.post('/devices', deviceData);
    return response.data;
  },
  
  updateDevice: async (id: string, deviceData: any) => {
    const response = await api.put(`/devices/${id}`, deviceData);
    return response.data;
  }
};