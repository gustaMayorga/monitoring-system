// src/components/Notifications/NotificationPanel.tsx
import React, { useEffect } from 'react';
import { useNotifications } from '@/contexts/NotificationContext';
import {
  Bell,
  Check,
  AlertTriangle,
  Camera,
  Info
} from 'lucide-react';

const NotificationPanel = () => {
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
  } = useNotifications();

  useEffect(() => {
    // Solicitar permiso para notificaciones del sistema
    if (Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  const getIcon = (type: string) => {
    switch (type) {
      case 'alarm':
        return <AlertTriangle className="text-red-500" />;
      case 'camera':
        return <Camera className="text-blue-500" />;
      default:
        return <Info className="text-gray-500" />;
    }
  };

  return (
    <div className="fixed right-4 top-16 w-96 bg-white shadow-lg rounded-lg">
      <div className="p-4 border-b flex justify-between items-center">
        <div className="flex items-center">
          <Bell className="w-5 h-5 mr-2" />
          <h2 className="font-semibold">Notificaciones</h2>
          {unreadCount > 0 && (
            <span className="ml-2 px-2 py-1 bg-red-100 text-red-600 rounded-full text-xs">
              {unreadCount}
            </span>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            Marcar todas como leídas
          </button>
        )}
      </div>
      <div className="max-h-96 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            No hay notificaciones
          </div>
        ) : (
          notifications.map(notification => (
            <div
              key={notification.id}
              className={`p-4 border-b hover:bg-gray-50 ${
                !notification.read ? 'bg-blue-50' : ''
              }`}
            >
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  {getIcon(notification.type)}
                </div>
                <div className="ml-3 flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    {notification.title}
                  </p>
                  <p className="text-sm text-gray-500">
                    {notification.message}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(notification.timestamp).toLocaleString()}
                  </p>
                </div>
                {!notification.read && (
                  <button
                    onClick={() => markAsRead(notification.id)}
                    className="ml-2 text-blue-600 hover:text-blue-800"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default NotificationPanel;