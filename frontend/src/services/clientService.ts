import axios from 'axios';
import { Client } from '../types';

const API_BASE_URL = 'http://localhost:8000/api';

// Crear una instancia de axios con configuración base
const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    }
});

export const clientService = {
    async getAll(): Promise<Client[]> {
        try {
            const response = await api.get('/clients');
            console.log('Response data:', response.data);
            return response.data;
        } catch (error) {
            console.error('Error in getAll:', error);
            throw error;
        }
    },

    async create(client: Omit<Client, 'id'>): Promise<Client> {
        try {
            const response = await api.post('/clients', client);
            console.log('Create response:', response.data);
            return response.data;
        } catch (error) {
            console.error('Error in create:', error);
            throw error;
        }
    },

    async update(id: number, client: Partial<Client>): Promise<Client> {
        const response = await api.put(`/clients/${id}`, client);
        return response.data;
    },

    async delete(id: number): Promise<void> {
        await api.delete(`/clients/${id}`);
    }
};

export default clientService;