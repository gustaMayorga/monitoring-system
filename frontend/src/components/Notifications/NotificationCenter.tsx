import React, { useEffect, useState } from 'react';
import { useWebSocket } from '../../hooks/useWebSocket';
import { Event } from '../../types/event';

interface Notification {
    id: string;
    type: 'success' | 'error' | 'warning' | 'info';
    message: string;
    timestamp: Date;
    read: boolean;
}

export const NotificationCenter: React.FC = () => {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);

    const handleNewEvent = (event: Event) => {
        const notification: Notification = {
            id: `${event.id}-${Date.now()}`,
            type: getNotificationType(event),
            message: getNotificationMessage(event),
            timestamp: new Date(),
            read: false
        };

        setNotifications(prev => [notification, ...prev].slice(0, 50));
        setUnreadCount(prev => prev + 1);
    };

    const { subscribe } = useWebSocket({
        onEvent: handleNewEvent,
        autoReconnect: true
    });

    useEffect(() => {
        subscribe('all_events');
    }, [subscribe]);

    const getNotificationType = (event: Event): Notification['type'] => {
        if (event.event_type?.severity === 'critical') return 'error';
        if (event.event_type?.severity === 'warning') return 'warning';
        if (event.status === 'resolved') return 'success';
        return 'info';
    };

    const getNotificationMessage = (event: Event): string => {
        if (event.event_type?.severity === 'critical') {
            return `¡Alerta crítica! ${event.description}`;
        }
        return event.description;
    };

    const markAllAsRead = () => {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        setUnreadCount(0);
    };

    const deleteNotification = (id: string) => {
        setNotifications(prev => {
            const notification = prev.find(n => n.id === id);
            if (notification && !notification.read) {
                setUnreadCount(count => count - 1);
            }
            return prev.filter(n => n.id !== id);
        });
    };

    return (
        <div className="relative">
            {/* Botón de notificaciones */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 -mt-1 -mr-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs text-white">
                        {unreadCount}
                    </span>
                )}
            </button>

            {/* Panel de notificaciones */}
            {isOpen && (
                <div className="absolute right-0 mt-2 w-96 rounded-lg bg-white shadow-lg ring-1 ring-black ring-opacity-5">
                    <div className="p-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-medium">Notificaciones</h3>
                            <button
                                onClick={markAllAsRead}
                                className="text-sm text-blue-600 hover:text-blue-800"
                            >
                                Marcar todo como leído
                            </button>
                        </div>
                        <div className="mt-4 max-h-96 overflow-y-auto">
                            {notifications.length === 0 ? (
                                <p className="text-center text-gray-500">No hay notificaciones</p>
                            ) : (
                                <ul className="space-y-4">
                                    {notifications.map(notification => (
                                        <li
                                            key={notification.id}
                                            className={`flex items-start rounded-lg p-3 ${
                                                notification.read ? 'bg-gray-50' : 'bg-blue-50'
                                            }`}
                                        >
                                            <div className="flex-1">
                                                <p className="text-sm font-medium text-gray-900">
                                                    {notification.message}
                                                </p>
                                                <p className="mt-1 text-xs text-gray-500">
                                                    {new Date(notification.timestamp).toLocaleString()}
                                                </p>
                                            </div>
                                            <button
                                                onClick={() => deleteNotification(notification.id)}
                                                className="ml-4 text-gray-400 hover:text-gray-500"
                                            >
                                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}; 