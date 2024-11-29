import axiosInstance from '../utils/axios';

interface LoginCredentials {
    username: string;
    password: string;
}

interface LoginResponse {
    token: string;
    user: {
        id: number;
        username: string;
        role: string;
        permissions: string[];
    };
}

export const authService = {
    async login(credentials: LoginCredentials): Promise<LoginResponse> {
        const response = await axiosInstance.post('/auth/login', credentials);
        return response.data;
    },

    async logout(): Promise<void> {
        await axiosInstance.post('/auth/logout');
    },

    async refreshToken(): Promise<LoginResponse> {
        const response = await axiosInstance.post('/auth/refresh');
        return response.data;
    }
}; 