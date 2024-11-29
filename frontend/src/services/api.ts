import axios from 'axios';

// Crear una constante para la URL base
const BASE_URL = 'http://localhost:8000';

const api = axios.create({
    baseURL: `${BASE_URL}/api`,
    headers: {
        'Content-Type': 'application/json',
    }
});

// Agregar interceptores para debug
api.interceptors.request.use(
    (config) => {
        console.log('Request:', config);
        return config;
    },
    (error) => {
        console.error('Request Error:', error);
        return Promise.reject(error);
    }
);

api.interceptors.response.use(
    (response) => {
        console.log('Response:', response);
        return response;
    },
    (error) => {
        console.error('Response Error:', error);
        return Promise.reject(error);
    }
);

export const clientService = {
    getAll: async () => {
        try {
            const response = await api.get('/clients');
            return response.data;
        } catch (error) {
            console.error('Error fetching clients:', error);
            throw error;
        }
    },

    create: async (client: { name: string; email: string }) => {
        try {
            const response = await api.post('/clients', client);
            return response.data;
        } catch (error) {
            console.error('Error creating client:', error);
            throw error;
        }
    },

    delete: async (id: number) => {
        try {
            await api.delete(`/clients/${id}`);
        } catch (error) {
            console.error('Error deleting client:', error);
            throw error;
        }
    }
};

export default api;