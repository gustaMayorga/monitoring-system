import React, { useState } from 'react';
import { Camera } from '../../types/camera';
import { PTZCommand } from '../../types/camera';
import './CameraConfig.css';

interface CameraConfigProps {
    camera: Camera;
    onClose: () => void;
}

export const CameraConfig: React.FC<CameraConfigProps> = ({ camera, onClose }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');

    const handlePTZCommand = async (command: PTZCommand) => {
        setIsLoading(true);
        setError('');
        setMessage('');

        try {
            const response = await fetch(`/api/cameras/${camera.id}/ptz`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    command,
                    speed: 1,
                    channel: 1
                })
            });

            if (!response.ok) {
                throw new Error('Error al enviar comando PTZ');
            }

            setMessage('Comando enviado correctamente');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error desconocido');
        } finally {
            setIsLoading(false);
        }
    };

    const handleTestConnection = async () => {
        setIsLoading(true);
        setError('');
        setMessage('');

        try {
            const response = await fetch(`/api/cameras/${camera.id}/test`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (!response.ok) {
                throw new Error('Error al probar conexión');
            }

            setMessage('Conexión exitosa');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error de conexión');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="camera-config">
            <div className="config-content">
                <h2>Configuración - {camera.name}</h2>

                <div className="config-section">
                    <h3>Control PTZ</h3>
                    <div className="ptz-controls">
                        <button
                            onClick={() => handlePTZCommand('up')}
                            disabled={isLoading}
                        >
                            ↑
                        </button>
                        <button
                            onClick={() => handlePTZCommand('down')}
                            disabled={isLoading}
                        >
                            ↓
                        </button>
                        <button
                            onClick={() => handlePTZCommand('left')}
                            disabled={isLoading}
                        >
                            ←
                        </button>
                        <button
                            onClick={() => handlePTZCommand('right')}
                            disabled={isLoading}
                        >
                            →
                        </button>
                        <button
                            onClick={() => handlePTZCommand('stop')}
                            disabled={isLoading}
                        >
                            ■
                        </button>
                    </div>
                </div>

                <div className="config-section">
                    <h3>Diagnóstico</h3>
                    <button
                        onClick={handleTestConnection}
                        disabled={isLoading}
                        className="test-button"
                    >
                        Probar Conexión
                    </button>
                </div>

                {error && <div className="error-message">{error}</div>}
                {message && <div className="success-message">{message}</div>}

                <div className="config-actions">
                    <button onClick={onClose} disabled={isLoading}>
                        Cerrar
                    </button>
                </div>
            </div>
        </div>
    );
}; 