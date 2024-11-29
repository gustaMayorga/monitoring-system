// src/contexts/NotificationContext.tsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import { wsService } from '@/services/websocket';
import { useAuth } from './AuthContext';

interface Notification {
  id: string;
  type: 'alarm' | 'camera' | 'system';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearNotifications: () => void;
}

const NotificationContext = createContext<NotificationContextType | null>(null);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      const token = localStorage.getItem('token');
      if (token) {
        wsService.connect(token);

        wsService.on('notification', (notification) => {
          setNotifications(prev => [notification, ...prev]);
          // Mostrar notificación del sistema si está permitido
          if (Notification.permission === 'granted') {
            new Notification(notification.title, {
              body: notification.message,
            });
          }
        });

        wsService.on('disconnected', () => {
          console.log('Desconectado del servidor de notificaciones');
        });
      }
    }

    return () => {
      wsService.disconnect();
    };
  }, [user]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n =>
        n.id === id ? { ...n, read: true } : n
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(n => ({ ...n, read: true }))
    );
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  return (
    <NotificationContext.Provider value={{
      notifications,
      unreadCount,
      markAsRead,
      markAllAsRead,
      clearNotifications,
    }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications debe ser usado dentro de un NotificationProvider');
  }
  return context;
};