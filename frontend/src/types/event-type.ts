export interface EventType {
    id: number;
    name: string;
    description?: string;
    severity: 'info' | 'warning' | 'error' | 'critical';
    icon?: string;
    color?: string;
    created_at: Date;
    updated_at: Date;
}

export interface CreateEventTypeDTO {
    name: string;
    description?: string;
    severity: EventType['severity'];
    icon?: string;
    color?: string;
}

export interface UpdateEventTypeDTO extends Partial<CreateEventTypeDTO> {} 