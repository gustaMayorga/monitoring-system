import { EventEmitter } from 'events';

export type NotificationType = 'info' | 'warning' | 'error' | 'success';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  source?: {
    type: string;
    id: string;
    name: string;
  };
}

class NotificationService {
  private notifications: Notification[] = [];
  private emitter = new EventEmitter();

  constructor() {
    // Inicializar WebSocket connection
   // this.initWebSocket();
  }

  private initWebSocket() {
    const ws = new WebSocket(`ws://localhost:8000/ws/notifications`);
    
    ws.onmessage = (event) => {
      const notification = JSON.parse(event.data);
      this.addNotification(notification);
    };

    ws.onclose = () => {
      // Reconectar después de un tiempo
      setTimeout(() => this.initWebSocket(), 5000);
    };
  }

  public getNotifications(): Notification[] {
    return this.notifications;
  }

  public getUnreadCount(): number {
    return this.notifications.filter(n => !n.read).length;
  }

  public addNotification(notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) {
    const newNotification: Notification = {
      ...notification,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date(),
      read: false
    };

    this.notifications.unshift(newNotification);
    this.emitter.emit('notification', newNotification);
  }

  public markAsRead(id: string) {
    const notification = this.notifications.find(n => n.id === id);
    if (notification) {
      notification.read = true;
      this.emitter.emit('update', notification);
    }
  }

  public clearAll() {
    this.notifications = [];
    this.emitter.emit('clear');
  }

  public onNotification(callback: (notification: Notification) => void) {
    this.emitter.on('notification', callback);
    return () => this.emitter.off('notification', callback);
  }

  public onUpdate(callback: (notification: Notification) => void) {
    this.emitter.on('update', callback);
    return () => this.emitter.off('update', callback);
  }

  public onClear(callback: () => void) {
    this.emitter.on('clear', callback);
    return () => this.emitter.off('clear', callback);
  }
}

export default new NotificationService();