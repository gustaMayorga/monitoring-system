export interface Notification {
    id: string;
    type: 'info' | 'warning' | 'error' | 'success';
    message: string;
    timestamp: Date;
    read: boolean;
    metadata?: Record<string, any>;
}

export interface NotificationPreferences {
    enabled: boolean;
    types: Notification['type'][];
    sound: boolean;
    desktop: boolean;
    email: boolean;
} 