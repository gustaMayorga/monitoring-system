import { Camera } from './camera';
import { Client } from './client';

export interface Event {
    id: number;
    event_type_id: number;
    camera_id?: number;
    client_id: number;
    description: string;
    occurred_at: Date;
    metadata?: Record<string, any>;
    notes?: string;
    status: EventStatus;
    created_at: Date;
    updated_at: Date;
    event_type?: EventType;
    camera?: Camera;
    client?: Client;
    attachments?: Attachment[];
}

export type EventStatus = 'pending' | 'processing' | 'resolved' | 'dismissed';

export interface EventType {
    id: number;
    name: string;
    description?: string;
    severity: 'info' | 'warning' | 'error' | 'critical';
    created_at: Date;
    updated_at: Date;
}

export interface EventQuery {
    clientId?: number;
    cameraId?: number;
    eventTypeId?: number;
    fromDate?: string;
    toDate?: string;
    severity?: string;
    status?: EventStatus;
    page?: number;
    limit?: number;
}

export interface Attachment {
    id: number;
    event_id: number;
    type: 'image' | 'video' | 'json';
    url: string;
    thumbnail_url?: string;
    filename: string;
    size: number;
    metadata?: Record<string, any>;
    created_at: Date;
    updated_at: Date;
} 