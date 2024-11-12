export const API_URL = 'http://localhost:8000/api';

export const apiService = {
  async request(endpoint: string, options: RequestInit = {}) {
    const url = `${API_URL}${endpoint}`;
    
    const defaultHeaders = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };

    try {
      console.log('Request:', { url, method: options.method || 'GET' });
      
      const response = await fetch(url, {
        ...options,
        headers: {
          ...defaultHeaders,
          ...options.headers,
        },
        credentials: 'include',  // Importante para CORS
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || 'Error en la solicitud');
      }

      // Para DELETE retornamos null si es 204
      if (response.status === 204) {
        return null;
      }

      return await response.json();
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  },

  clients: {
    async create(data: any) {
      return await apiService.request('/clients/', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },

    async update(id: string, data: any) {
      return await apiService.request(`/clients/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    },

    async delete(id: string) {
      return await apiService.request(`/clients/${id}`, {
        method: 'DELETE',
      });
    },

    async getAll() {
      return await apiService.request('/clients/');
    },

    async getById(id: string) {
      return await apiService.request(`/clients/${id}`);
    },
  },
};