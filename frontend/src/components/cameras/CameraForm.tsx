import React from 'react';
import { useForm } from 'react-hook-form';
import { Camera, CameraFormData, CameraType } from '../../types/camera';

interface Props {
    camera?: Camera;
    onSubmit: (data: CameraFormData) => Promise<void>;
    onCancel: () => void;
}

export const CameraForm: React.FC<Props> = ({ camera, onSubmit, onCancel }) => {
    const { register, handleSubmit, formState: { errors } } = useForm<CameraFormData>({
        defaultValues: camera ? {
            name: camera.name,
            location: camera.location,
            vendor: camera.vendor,
            ip_address: camera.ip_address,
            port: camera.port,
            username: camera.config.username,
            password: camera.config.password,
            type: camera.type,
            client_id: camera.client_id
        } : undefined
    });

    const cameraTypes: CameraType[] = ['hikvision', 'dahua', 'axis', 'other'];

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
                <label htmlFor="client_id" className="block text-sm font-medium text-gray-700">
                    Cliente
                </label>
                <select
                    id="client_id"
                    {...register('client_id', { required: 'El cliente es requerido' })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                    <option value="">Seleccionar cliente</option>
                    {/* ... */}
                </select>
                {errors.client_id && (
                    <p className="mt-1 text-sm text-red-600">{errors.client_id.message}</p>
                )}
            </div>

            <div>
                <label htmlFor="location" className="block text-sm font-medium text-gray-700">
                    Ubicación
                </label>
                <input
                    type="text"
                    id="location"
                    {...register('location', { required: 'La ubicación es requerida' })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
                {errors.location && (
                    <p className="mt-1 text-sm text-red-600">{errors.location.message}</p>
                )}
            </div>

            <div>
                <label htmlFor="ip_address" className="block text-sm font-medium text-gray-700">
                    Dirección IP
                </label>
                <input
                    type="text"
                    id="ip_address"
                    {...register('ip_address', {
                        required: 'La dirección IP es requerida',
                        pattern: {
                            value: /^(\d{1,3}\.){3}\d{1,3}$/,
                            message: 'Formato de IP inválido'
                        }
                    })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    placeholder="192.168.1.100"
                />
                {errors.ip_address && (
                    <p className="mt-1 text-sm text-red-600">{errors.ip_address.message}</p>
                )}
            </div>

            <div>
                <label htmlFor="port" className="block text-sm font-medium text-gray-700">
                    Puerto
                </label>
                <input
                    type="number"
                    id="port"
                    {...register('port', {
                        required: 'El puerto es requerido',
                        min: { value: 1, message: 'El puerto debe ser mayor a 0' },
                        max: { value: 65535, message: 'El puerto debe ser menor a 65536' }
                    })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    placeholder="554"
                />
                {errors.port && (
                    <p className="mt-1 text-sm text-red-600">{errors.port.message}</p>
                )}
            </div>

            <div>
                <label htmlFor="type" className="block text-sm font-medium text-gray-700">
                    Tipo de cámara
                </label>
                <select
                    id="type"
                    {...register('type', { required: 'El tipo es requerido' })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                    <option value="">Seleccionar tipo</option>
                    {cameraTypes.map(type => (
                        <option key={type} value={type}>{type}</option>
                    ))}
                </select>
                {errors.type && (
                    <p className="mt-1 text-sm text-red-600">{errors.type.message}</p>
                )}
            </div>

            <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                    Usuario
                </label>
                <input
                    type="text"
                    id="username"
                    {...register('username')}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
            </div>

            <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                    Contraseña
                </label>
                <input
                    type="password"
                    id="password"
                    {...register('password')}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
            </div>

            <div>
                <label htmlFor="stream_url" className="block text-sm font-medium text-gray-700">
                    URL del Stream
                </label>
                <input
                    type="text"
                    id="stream_url"
                    {...register('stream_url', { required: 'La URL del stream es requerida' })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    placeholder="rtsp://camera.example.com/stream1"
                />
                {errors.stream_url && (
                    <p className="mt-1 text-sm text-red-600">{errors.stream_url.message}</p>
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
                    {camera ? 'Actualizar' : 'Crear'}
                </button>
            </div>
        </form>
    );
}; 