import React, { useEffect, useState } from 'react';
import { Bell, Check, CheckCircle2, X, Volume2, VolumeX } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import notificationService, { 
  Notification, 
  NotificationPriority 
} from '@/services/notificationService';


const PRIORITY_CONFIG: Record<NotificationPriority, {
  color: string;
  icon: React.ReactNode;
}> = {
  critical: {
    color: 'bg-red-100 text-red-800 border-red-200',
    icon: <Bell className="h-4 w-4 text-red-600" />,
  },
  high: {
    color: 'bg-orange-100 text-orange-800 border-orange-200',
    icon: <Bell className="h-4 w-4 text-orange-600" />,
  },
  medium: {
    color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    icon: <Bell className="h-4 w-4 text-yellow-600" />,
  },
  low: {
    color: 'bg-green-100 text-green-800 border-green-200',
    icon: <Bell className="h-4 w-4 text-green-600" />,
  },
};

export default function NotificationPanel() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    // Cargar notificaciones iniciales
    const currentNotifications = notificationService.getNotifications();
    setNotifications(currentNotifications);
    updateUnreadCount(currentNotifications);

    // Suscribirse a nuevas notificaciones
    const unsubscribe = notificationService.onNotification((notification) => {
      setNotifications(prev => [notification, ...prev]);
      updateUnreadCount([notification, ...notifications]);
    });

    return unsubscribe;
  }, []);

  const updateUnreadCount = (notifs: Notification[]) => {
    setUnreadCount(notifs.filter(n => !n.read).length);
  };

  const handleAcknowledge = async (id: string) => {
    try {
      await notificationService.acknowledgeNotification(id);
      setNotifications(prev =>
        prev.map(n =>
          n.id === id ? { ...n, acknowledged: true } : n
        )
      );
    } catch (error) {
      console.error('Error acknowledging notification:', error);
    }
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications(prev =>
        prev.map(n =>
          n.id === id ? { ...n, read: true } : n
        )
      );
      updateUnreadCount(notifications);
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleClearAll = async () => {
    try {
      await notificationService.clearAllNotifications();
      setNotifications([]);
      setUnreadCount(0);
    } catch (error) {
      console.error('Error clearing notifications:', error);
    }
  };

  const toggleSound = () => {
    setSoundEnabled(!soundEnabled);
    notificationService.toggleSound(!soundEnabled);
  };

  const getFilteredNotifications = () => {
    switch (activeTab) {
      case 'unread':
        return notifications.filter(n => !n.read);
      case 'acknowledged':
        return notifications.filter(n => n.acknowledged);
      case 'pending':
        return notifications.filter(n => !n.acknowledged);
      default:
        return notifications;
    }
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              className="absolute -top-1 -right-1 px-1 min-w-[1.25rem] h-5"
              variant="destructive"
            >
              {unreadCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-[400px] sm:w-[540px]">
        <SheetHeader className="flex flex-row items-center justify-between">
          <SheetTitle>Notificaciones</SheetTitle>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleSound}
            >
              {soundEnabled ? (
                <Volume2 className="h-4 w-4" />
              ) : (
                <VolumeX className="h-4 w-4" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearAll}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </SheetHeader>

        <Tabs
          defaultValue="all"
          className="mt-4"
          onValueChange={setActiveTab}
        >
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all">Todas</TabsTrigger>
            <TabsTrigger value="unread">Sin leer</TabsTrigger>
            <TabsTrigger value="pending">Pendientes</TabsTrigger>
            <TabsTrigger value="acknowledged">Atendidas</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-4 space-y-4">
            {getFilteredNotifications().map((notification) => (
              <div
                key={notification.id}
                className={`${
                  PRIORITY_CONFIG[notification.priority].color
                } p-4 rounded-lg border relative ${
                  !notification.read ? 'font-medium' : ''
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    {PRIORITY_CONFIG[notification.priority].icon}
                    <div>
                      <h4 className="font-medium">{notification.title}</h4>
                      <p className="text-sm mt-1">{notification.message}</p>
                      <div className="flex items-center space-x-2 mt-2 text-xs text-gray-500">
                        <span>{notification.source.name}</span>
                        <span>•</span>
                        <span>
                          {new Date(notification.timestamp).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start space-x-2">
                    {!notification.acknowledged && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleAcknowledge(notification.id)}
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                    )}
                    {!notification.read && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleMarkAsRead(notification.id)}
                      >
                        <CheckCircle2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {getFilteredNotifications().length === 0 && (
              <div className="text-center text-gray-500 py-8">
                No hay notificaciones
              </div>
            )}
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}