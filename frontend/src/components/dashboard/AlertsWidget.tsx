import React from 'react';
import { Event } from '../../types/event';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';

interface AlertsWidgetProps {
    alerts: Event[];
    onAlertClick: (alert: Event) => void;
}

export const AlertsWidget: React.FC<AlertsWidgetProps> = ({ alerts, onAlertClick }) => {
    const getSeverityColor = (severity: string) => {
        switch (severity) {
            case 'critical':
                return 'text-red-600';
            case 'error':
                return 'text-orange-600';
            case 'warning':
                return 'text-yellow-600';
            default:
                return 'text-blue-600';
        }
    };

    return (
        <div className="bg-white rounded-lg shadow">
            <div className="p-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Alertas Recientes</h3>
            </div>
            <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
                {alerts.length === 0 ? (
                    <div className="p-4 text-center text-gray-500">
                        No hay alertas recientes
                    </div>
                ) : (
                    alerts.map((alert) => (
                        <div
                            key={alert.id}
                            className="p-4 hover:bg-gray-50 cursor-pointer"
                            onClick={() => onAlertClick(alert)}
                        >
                            <div className="flex items-start space-x-3">
                                <div className="flex-shrink-0">
                                    <ExclamationTriangleIcon
                                        className={`h-6 w-6 ${getSeverityColor(alert.event_type?.severity || 'info')}`}
                                    />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <div className="text-sm font-medium text-gray-900">
                                        {alert.event_type?.name}
                                    </div>
                                    <div className="mt-1 text-sm text-gray-500">
                                        <span>{alert.camera?.name}</span>
                                        {alert.description && (
                                            <p className="mt-1">{alert.description}</p>
                                        )}
                                    </div>
                                    <div className="mt-2 text-xs text-gray-500">
                                        {format(new Date(alert.occurred_at), 'PPpp', { locale: es })}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}; 