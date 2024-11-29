import { useState } from 'react';

interface User {
    id: number;
    username: string;
    role: string;
    permissions: string[];
}

interface AuthResponse {
    token: string;
    user: User;
}

export const useAuth = () => {
    const [user, setUser] = useState<User | null>(null);

    const login = async (username: string, password: string) => {
        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password }),
            });

            if (!response.ok) {
                throw new Error('Credenciales inválidas');
            }

            const data: AuthResponse = await response.json();
            setUser(data.user);
            localStorage.setItem('token', data.token);
            
            return data;
        } catch (error) {
            throw new Error('Credenciales inválidas');
        }
    };

    return { user, login };
}; 