export interface Permission {
    id: number;
    name: string;
    description?: string;
    resource: string;
    action: string;
    created_at: Date;
    updated_at: Date;
} 