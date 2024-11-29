// src/services/auth.service.ts
export const authService = {
    login: async (email: string, password: string) => {
      const response = await api.post('/auth/login', { email, password });
      return response.data;
    },
  
    verifyToken: async () => {
      const response = await api.get('/auth/verify');
      return response.data;
    },
  
    logout: () => {
      localStorage.removeItem('token');
    }
  };