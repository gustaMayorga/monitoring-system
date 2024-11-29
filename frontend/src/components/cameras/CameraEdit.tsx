import React, { useState, useEffect } from 'react';
import { Camera, CameraType } from '../../types/camera';
import './CameraEdit.css';

interface CameraEditProps {
    camera?: Camera;
    onSave: (camera: Partial<Camera>) => Promise<void>;
    onCancel: () => void;
}

export const CameraEdit: React.FC<CameraEditProps> = ({ camera, onSave, onCancel }) => {
    const [formData, setFormData] = useState({
        name: camera?.name || '',
        type: camera?.type || 'hikvision',
        stream_url: camera?.stream_url || '',
        config: {
            ip: camera?.config.ip || '',
            port: camera?.config.port || 80,
            username: camera?.config.username || '',
            password: camera?.config.password || ''
        }
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            await onSave(formData);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error al guardar la cámara');
        } finally {
            setIsLoading(false);
        }
    };

    const cameraTypes: CameraType[] = ['hikvision', 'dahua', 'axis', 'generic'];

    return (
        <div className="camera-edit">
            <form onSubmit={handleSubmit}>
                <h2>{camera ? 'Editar Cámara' : 'Nueva Cámara'}</h2>

                <div className="form-group">
                    <label htmlFor="name">Nombre</label>
                    <input
                        id="name"
                        type="text"
                        value={formData.name}
                        onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="type">Tipo</label>
                    <select
                        id="type"
                        value={formData.type}
                        onChange={e => setFormData(prev => ({ ...prev, type: e.target.value as CameraType }))}
                    >
                        {cameraTypes.map(type => (
                            <option key={type} value={type}>{type}</option>
                        ))}
                    </select>
                </div>

                <div className="form-group">
                    <label htmlFor="stream_url">URL del Stream</label>
                    <input
                        id="stream_url"
                        type="text"
                        value={formData.stream_url}
                        onChange={e => setFormData(prev => ({ ...prev, stream_url: e.target.value }))}
                        required
                    />
                </div>

                <fieldset className="config-section">
                    <legend>Configuración</legend>
                    
                    <div className="form-group">
                        <label htmlFor="ip">Dirección IP</label>
                        <input
                            id="ip"
                            type="text"
                            value={formData.config.ip}
                            onChange={e => setFormData(prev => ({
                                ...prev,
                                config: { ...prev.config, ip: e.target.value }
                            }))}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="port">Puerto</label>
                        <input
                            id="port"
                            type="number"
                            value={formData.config.port}
                            onChange={e => setFormData(prev => ({
                                ...prev,
                                config: { ...prev.config, port: Number(e.target.value) }
                            }))}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="username">Usuario</label>
                        <input
                            id="username"
                            type="text"
                            value={formData.config.username}
                            onChange={e => setFormData(prev => ({
                                ...prev,
                                config: { ...prev.config, username: e.target.value }
                            }))}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Contraseña</label>
                        <input
                            id="password"
                            type="password"
                            value={formData.config.password}
                            onChange={e => setFormData(prev => ({
                                ...prev,
                                config: { ...prev.config, password: e.target.value }
                            }))}
                            required
                        />
                    </div>
                </fieldset>

                {error && <div className="error-message">{error}</div>}

                <div className="form-actions">
                    <button type="submit" disabled={isLoading}>
                        {isLoading ? 'Guardando...' : 'Guardar'}
                    </button>
                    <button type="button" onClick={onCancel} disabled={isLoading}>
                        Cancelar
                    </button>
                </div>
            </form>
        </div>
    );
}; 