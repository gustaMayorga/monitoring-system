import React from 'react';
import { useForm } from 'react-hook-form';
import { Event } from '../../types/event';
import { formatDateISO } from '../../utils/date';

interface Props {
    event?: Event;
    onSubmit: (data: Partial<Event>) => Promise<void>;
    onCancel: () => void;
}

interface EventFormData extends Omit<Partial<Event>, 'occurred_at'> {
    occurred_at: string;
}

export const EventForm: React.FC<Props> = ({ event, onSubmit, onCancel }) => {
    const { register, handleSubmit, formState: { errors } } = useForm<EventFormData>({
        defaultValues: event ? {
            ...event,
            occurred_at: formatDateISO(event.occurred_at)
        } : {
            occurred_at: formatDateISO(new Date())
        }
    });

    const handleFormSubmit = (data: EventFormData) => {
        onSubmit({
            ...data,
            occurred_at: new Date(data.occurred_at)
        });
    };

    return (
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700">
                    Fecha y hora
                </label>
                <input
                    type="datetime-local"
                    {...register('occurred_at', { required: 'La fecha es requerida' })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
                {errors.occurred_at && (
                    <p className="mt-1 text-sm text-red-600">{errors.occurred_at.message}</p>
                )}
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700">
                    Descripción
                </label>
                <textarea
                    {...register('description', { required: 'La descripción es requerida' })}
                    rows={3}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
                {errors.description && (
                    <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
                )}
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
                    {event ? 'Actualizar' : 'Crear'}
                </button>
            </div>
        </form>
    );
}; 