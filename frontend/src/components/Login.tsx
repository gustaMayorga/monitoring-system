import React from 'react';
import { useForm } from 'react-hook-form';
import { LoginCredentials } from '../types/auth';

interface Props {
    onLogin: (token: string) => void;
}

export const Login: React.FC<Props> = ({ onLogin }) => {
    const { register, handleSubmit, formState: { errors }, setError } = useForm<LoginCredentials>();

    const onSubmit = async (data: LoginCredentials) => {
        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                throw new Error('Credenciales inválidas');
            }

            const { token } = await response.json();
            onLogin(token);
        } catch (error) {
            setError('root', {
                message: 'Error al iniciar sesión. Por favor, intente nuevamente.'
            });
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                    Usuario
                </label>
                <input
                    id="username"
                    type="text"
                    {...register('username', { required: 'El usuario es requerido' })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
                {errors.username && (
                    <p className="mt-1 text-sm text-red-600">{errors.username.message}</p>
                )}
            </div>

            <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                    Contraseña
                </label>
                <input
                    id="password"
                    type="password"
                    {...register('password', { required: 'La contraseña es requerida' })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
                {errors.password && (
                    <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
                )}
            </div>

            {errors.root && (
                <p className="text-sm text-red-600">{errors.root.message}</p>
            )}

            <button
                type="submit"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
                Iniciar sesión
            </button>
        </form>
    );
}; 