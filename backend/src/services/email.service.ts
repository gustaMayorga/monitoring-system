import nodemailer from 'nodemailer';
import { Notification } from '../types/notification';
import { EmailConfig } from '../types/config';
import { UserRepository } from '../repositories/user.repository';

export class EmailService {
    private transporter: nodemailer.Transporter;

    constructor(
        private config: EmailConfig,
        private userRepository: UserRepository
    ) {
        this.transporter = nodemailer.createTransport({
            host: config.host,
            port: config.port,
            secure: config.secure,
            auth: {
                user: config.auth.user,
                pass: config.auth.pass
            }
        });
    }

    async sendNotificationEmail(userId: number, notification: Notification): Promise<void> {
        const user = await this.userRepository.findById(userId);
        if (!user?.email) return;

        await this.transporter.sendMail({
            from: this.config.from,
            to: user.email,
            subject: `Notificación: ${notification.type.toUpperCase()}`,
            html: this.getNotificationTemplate(notification)
        });
    }

    private getNotificationTemplate(notification: Notification): string {
        return `
            <div style="font-family: Arial, sans-serif; padding: 20px;">
                <h2 style="color: ${this.getNotificationColor(notification.type)};">
                    ${notification.type.toUpperCase()}
                </h2>
                <p>${notification.message}</p>
                <p style="color: #666;">
                    ${notification.timestamp.toLocaleString()}
                </p>
            </div>
        `;
    }

    private getNotificationColor(type: Notification['type']): string {
        switch (type) {
            case 'error':
                return '#dc3545';
            case 'warning':
                return '#ffc107';
            case 'success':
                return '#28a745';
            default:
                return '#17a2b8';
        }
    }
} 