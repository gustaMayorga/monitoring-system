import React from 'react';
import { useForm } from 'react-hook-form';
import { EventType, CreateEventTypeDTO } from '../../types/event-type';

interface Props {
    eventType?: EventType;
    onSubmit: (data: CreateEventTypeDTO) => Promise<void>;
    onCancel: () => void;
}

export const EventTypeForm: React.FC<Props> = ({ eventType, onSubmit, onCancel }) => {
    const { register, handleSubmit, formState: { errors } } = useForm<CreateEventTypeDTO>({
        defaultValues: eventType
    });

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700">
                    Nombre
                </label>
                <input
                    type="text"
                    {...register('name', { required: 'El nombre es requerido' })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
                {errors.name && (
                    <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                )}
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700">
                    Severidad
                </label>
                <select
                    {...register('severity', { required: 'La severidad es requerida' })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                    <option value="info">Info</option>
                    <option value="warning">Warning</option>
                    <option value="error">Error</option>
                    <option value="critical">Critical</option>
                </select>
                {errors.severity && (
                    <p className="mt-1 text-sm text-red-600">{errors.severity.message}</p>
                )}
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700">
                    Descripción
                </label>
                <textarea
                    {...register('description')}
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
                    {eventType ? 'Actualizar' : 'Crear'}
                </button>
            </div>
        </form>
    );
}; 