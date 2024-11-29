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