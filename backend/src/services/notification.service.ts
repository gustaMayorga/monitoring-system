import { EventEmitter } from 'events';
import { Event } from '../types/event';
import { Notification, NotificationPreferences } from '../types/notification';
import { UserRepository } from '../repositories/user.repository';
import { EmailService } from './email.service';

export class NotificationService extends EventEmitter {
    private notifications: Map<number, Notification[]> = new Map();

    constructor(
        private userRepository: UserRepository,
        private emailService: EmailService
    ) {
        super();
    }

    async notifyEvent(event: Event): Promise<void> {
        // Crear notificación
        const notification: Notification = {
            id: `${Date.now()}-${event.id}`,
            type: this.getNotificationType(event),
            message: this.getNotificationMessage(event),
            timestamp: new Date(),
            read: false,
            metadata: {
                eventId: event.id,
                eventType: event.event_type?.name,
                cameraId: event.camera_id
            }
        };

        // Obtener usuarios que deben ser notificados
        const users = await this.userRepository.findByClientId(event.client_id);

        for (const user of users) {
            // Verificar preferencias del usuario
            const preferences = await this.getUserPreferences(user.id);
            
            if (this.shouldNotifyUser(notification, preferences)) {
                await this.sendNotification(user.id, notification, preferences);
            }
        }
    }

    private getNotificationType(event: Event): Notification['type'] {
        switch (event.event_type?.severity) {
            case 'critical':
                return 'error';
            case 'warning':
                return 'warning';
            case 'info':
                return 'info';
            default:
                return 'info';
        }
    }

    private getNotificationMessage(event: Event): string {
        return `${event.event_type?.name}: ${event.description}`;
    }

    private async getUserPreferences(userId: number): Promise<NotificationPreferences> {
        // Implementar obtención de preferencias del usuario
        return {
            enabled: true,
            types: ['info', 'warning', 'error', 'success'],
            sound: true,
            desktop: true,
            email: true
        };
    }

    private shouldNotifyUser(
        notification: Notification,
        preferences: NotificationPreferences
    ): boolean {
        return preferences.enabled && preferences.types.includes(notification.type);
    }

    private async sendNotification(
        userId: number,
        notification: Notification,
        preferences: NotificationPreferences
    ): Promise<void> {
        // Almacenar notificación
        if (!this.notifications.has(userId)) {
            this.notifications.set(userId, []);
        }
        this.notifications.get(userId)?.push(notification);

        // Emitir evento para WebSocket
        this.emit('notification', { userId, notification });

        // Enviar email si está habilitado
        if (preferences.email) {
            await this.emailService.sendNotificationEmail(userId, notification);
        }
    }
} 