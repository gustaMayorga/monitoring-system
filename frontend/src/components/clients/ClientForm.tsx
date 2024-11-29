import React from 'react';
import { useForm } from 'react-hook-form';
import { Client, CreateClientDTO } from '../../types/client';

interface Props {
    client?: Client;
    onSubmit: (data: CreateClientDTO) => Promise<void>;
    onCancel: () => void;
}

export const ClientForm: React.FC<Props> = ({ client, onSubmit, onCancel }) => {
    const { register, handleSubmit, formState: { errors } } = useForm<CreateClientDTO>({
        defaultValues: client
    });

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                    Nombre
                </label>
                <input
                    type="text"
                    id="name"
                    {...register('name', { required: 'El nombre es requerido' })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
                {errors.name && (
                    <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                )}
            </div>

            <div>
                <label htmlFor="contact_person" className="block text-sm font-medium text-gray-700">
                    Persona de contacto
                </label>
                <input
                    type="text"
                    id="contact_person"
                    {...register('contact_person', { required: 'La persona de contacto es requerida' })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
                {errors.contact_person && (
                    <p className="mt-1 text-sm text-red-600">{errors.contact_person.message}</p>
                )}
            </div>

            <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email
                </label>
                <input
                    type="email"
                    id="email"
                    {...register('email', {
                        required: 'El email es requerido',
                        pattern: {
                            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                            message: 'Email inválido'
                        }
                    })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
                {errors.email && (
                    <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                )}
            </div>

            <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                    Teléfono
                </label>
                <input
                    type="tel"
                    id="phone"
                    {...register('phone', { required: 'El teléfono es requerido' })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
                {errors.phone && (
                    <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
                )}
            </div>

            <div>
                <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                    Dirección
                </label>
                <textarea
                    id="address"
                    {...register('address')}
                    rows={3}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
            </div>

            <div className="flex justify-end space-x-3">
                <button
                    type="button"
                    onClick={onCancel}
                    className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                    Cancelar
                </button>
                <button
                    type="submit"
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                >
                    {client ? 'Actualizar' : 'Crear'}
                </button>
            </div>
        </form>
    );
}; 