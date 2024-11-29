import { Event, EventStatus } from '../event';

export interface CreateEventDTO {
    event_type_id: number;
    camera_id?: number;
    client_id: number;
    description: string;
    occurred_at: Date;
    metadata?: Record<string, any>;
    notes?: string;
    attachments?: {
        type: 'image' | 'video' | 'audio' | 'document';
        url: string;
        thumbnail_url?: string;
        filename: string;
        size: number;
        metadata?: Record<string, any>;
    }[];
}

export interface UpdateEventDTO {
    event_type_id?: number;
    camera_id?: number;
    client_id?: number;
    description?: string;
    status?: EventStatus;
    metadata?: Record<string, any>;
    notes?: string;
}

export interface EventRepositoryOptions {
    clientId?: number;
    cameraId?: number;
    eventTypeId?: number;
    startDate?: Date;
    endDate?: Date;
    severity?: string;
    limit?: number;
    offset?: number;
} 