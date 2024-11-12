import { EventEmitter } from 'events';

export type NotificationPriority = 'low' | 'medium' | 'high' | 'critical';
export type NotificationType = 'alarm' | 'camera' | 'system' | 'user';

export interface Notification {
  id: string;
  type: NotificationType;
  priority: NotificationPriority;
  title: string;
  message: string;
  timestamp: Date;
  source: {
    id: string;
    name: string;
    type: string;
  };
  metadata?: Record<string, any>;
  read: boolean;
  acknowledged: boolean;
}

class NotificationService {
  private eventEmitter: EventEmitter;
  private notifications: Notification[] = [];
  private webSocket: WebSocket | null = null;
  private soundEnabled: boolean = true;
  private desktopEnabled: boolean = false;

  constructor() {
    this.eventEmitter = new EventEmitter();
    this.connectWebSocket();
    this.requestNotificationPermission();
  }

  private connectWebSocket() {
    this.webSocket = new WebSocket(`ws://localhost:8000/ws/notifications`);

    this.webSocket.onmessage = (event) => {
      const notification = JSON.parse(event.data);
      this.handleNewNotification(notification);
    };

    this.webSocket.onclose = () => {
      setTimeout(() => this.connectWebSocket(), 5000); // Reconexión automática
    };
  }

  private async requestNotificationPermission() {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      this.desktopEnabled = permission === 'granted';
    }
  }

  private handleNewNotification(notification: Notification) {
    this.notifications.unshift(notification);
    this.eventEmitter.emit('notification', notification);

    // Reproducir sonido según prioridad
    if (this.soundEnabled) {
      this.playNotificationSound(notification.priority);
    }

    // Mostrar notificación de escritorio
    if (this.desktopEnabled) {
      this.showDesktopNotification(notification);
    }
  }

  private playNotificationSound(priority: NotificationPriority) {
    const audio = new Audio();
    
    switch (priority) {
      case 'critical':
        audio.src = '/sounds/critical-alert.mp3';
        break;
      case 'high':
        audio.src = '/sounds/high-alert.mp3';
        break;
      case 'medium':
        audio.src = '/sounds/medium-alert.mp3';
        break;
      case 'low':
        audio.src = '/sounds/notification.mp3';
        break;
    }

    audio.play().catch(console.error);
  }

  private showDesktopNotification(notification: Notification) {
    if (!('Notification' in window) || !this.desktopEnabled) return;

    new Notification(notification.title, {
      body: notification.message,
      icon: '/icons/alert-icon.png',
      tag: notification.id,
    });
  }

  public getNotifications(
    filters?: {
      type?: NotificationType[];
      priority?: NotificationPriority[];
      read?: boolean;
      acknowledged?: boolean;
    }
  ): Notification[] {
    let filtered = [...this.notifications];

    if (filters) {
      if (filters.type) {
        filtered = filtered.filter(n => filters.type?.includes(n.type));
      }
      if (filters.priority) {
        filtered = filtered.filter(n => filters.priority?.includes(n.priority));
      }
      if (typeof filters.read === 'boolean') {
        filtered = filtered.filter(n => n.read === filters.read);
      }
      if (typeof filters.acknowledged === 'boolean') {
        filtered = filtered.filter(n => n.acknowledged === filters.acknowledged);
      }
    }

    return filtered;
  }

  public async acknowledgeNotification(id: string): Promise<void> {
    try {
      await fetch(`/api/notifications/${id}/acknowledge`, {
        method: 'POST',
      });

      const notification = this.notifications.find(n => n.id === id);
      if (notification) {
        notification.acknowledged = true;
        this.eventEmitter.emit('notificationUpdate', notification);
      }
    } catch (error) {
      console.error('Error acknowledging notification:', error);
      throw error;
    }
  }

  public async markAsRead(id: string): Promise<void> {
    try {
      await fetch(`/api/notifications/${id}/read`, {
        method: 'POST',
      });

      const notification = this.notifications.find(n => n.id === id);
      if (notification) {
        notification.read = true;
        this.eventEmitter.emit('notificationUpdate', notification);
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  }

  public onNotification(callback: (notification: Notification) => void): () => void {
    this.eventEmitter.on('notification', callback);
    return () => this.eventEmitter.off('notification', callback);
  }

  public onNotificationUpdate(callback: (notification: Notification) => void): () => void {
    this.eventEmitter.on('notificationUpdate', callback);
    return () => this.eventEmitter.off('notificationUpdate', callback);
  }

  public toggleSound(enabled: boolean): void {
    this.soundEnabled = enabled;
  }

  public async clearAllNotifications(): Promise<void> {
    try {
      await fetch('/api/notifications/clear', {
        method: 'POST',
      });
      this.notifications = [];
      this.eventEmitter.emit('notificationsClear');
    } catch (error) {
      console.error('Error clearing notifications:', error);
      throw error;
    }
  }
}

export default new NotificationService();