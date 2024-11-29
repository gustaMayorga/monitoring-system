import React from 'react';
import { Event } from '../../types/event';
import { formatDate } from '../../utils/date';
import { Modal } from '../common/Modal';

interface Props {
    event: Event;
    isOpen: boolean;
    onClose: () => void;
}

export const EventDetails: React.FC<Props> = ({ event, isOpen, onClose }) => {
    const getSeverityClass = (severity?: string) => {
        switch (severity) {
            case 'critical':
                return 'text-red-700 bg-red-100';
            case 'error':
                return 'text-orange-700 bg-orange-100';
            case 'warning':
                return 'text-yellow-700 bg-yellow-100';
            default:
                return 'text-blue-700 bg-blue-100';
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={event.event_type?.name || 'Detalles del evento'}
        >
            <div className="space-y-6">
                <div className="flex justify-between items-start">
                    <div>
                        <h3 className="text-lg font-medium text-gray-900">
                            {event.event_type?.name || 'Evento sin tipo'}
                        </h3>
                        <p className="text-sm text-gray-500">
                            {formatDate(event.occurred_at)}
                        </p>
                    </div>
                </div>

                <div className="border-t border-b border-gray-200 py-4">
                    <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                        <div>
                            <dt className="text-sm font-medium text-gray-500">Cliente</dt>
                            <dd className="mt-1 text-sm text-gray-900">{event.client?.name || 'N/A'}</dd>
                        </div>
                        <div>
                            <dt className="text-sm font-medium text-gray-500">Cámara</dt>
                            <dd className="mt-1 text-sm text-gray-900">{event.camera?.name || 'N/A'}</dd>
                        </div>
                        <div>
                            <dt className="text-sm font-medium text-gray-500">Estado</dt>
                            <dd className="mt-1 text-sm text-gray-900">{event.status}</dd>
                        </div>
                        <div>
                            <dt className="text-sm font-medium text-gray-500">Severidad</dt>
                            <dd className="mt-1">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getSeverityClass(event.event_type?.severity)}`}>
                                    {event.event_type?.severity || 'info'}
                                </span>
                            </dd>
                        </div>
                    </dl>
                </div>

                <div>
                    <h4 className="text-sm font-medium text-gray-900">Descripción</h4>
                    <p className="mt-2 text-sm text-gray-500">{event.description}</p>
                </div>

                {event.notes && (
                    <div>
                        <h4 className="text-sm font-medium text-gray-900">Notas</h4>
                        <p className="mt-2 text-sm text-gray-500">{event.notes}</p>
                    </div>
                )}

                {event.attachments && event.attachments.length > 0 && (
                    <div>
                        <h4 className="text-sm font-medium text-gray-900">Archivos adjuntos</h4>
                        <div className="mt-2 grid grid-cols-2 gap-4 sm:grid-cols-3">
                            {event.attachments.map((attachment) => (
                                <div key={attachment.id} className="relative">
                                    {attachment.type === 'image' ? (
                                        <img
                                            src={attachment.thumbnail_url || attachment.url}
                                            alt={attachment.filename}
                                            className="w-full h-32 object-cover rounded"
                                        />
                                    ) : (
                                        <div className="w-full h-32 bg-gray-100 rounded flex items-center justify-center">
                                            <span className="text-gray-500">{attachment.type}</span>
                                        </div>
                                    )}
                                    <p className="mt-1 text-xs text-gray-500 truncate">{attachment.filename}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </Modal>
    );
}; 