export type TicketStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled';
export type TicketPriority = 'low' | 'medium' | 'high' | 'urgent';
export type TechnicianSpecialty = 'CCTV' | 'Alarms' | 'Access Control' | 'Fire' | 'Integration';
export type TechnicianStatus = 'active' | 'inactive' | 'on_leave';

export interface ServiceTicket {
    id: number;
    client_id: number;
    technician_id?: number;
    title: string;
    description: string;
    status: TicketStatus;
    priority: TicketPriority;
    scheduled_date?: Date;
    completion_date?: Date;
    created_at: Date;
    updated_at: Date;
    comments?: TicketComment[];
    attachments?: TicketAttachment[];
}

export interface TechnicianAssignment {
    id: number;
    ticket_id: number;
    technician_id: number;
    status: TicketStatus;
    scheduled_date: string;
    completed_date?: string;
    notes?: string;
}

export interface Technician {
    id: number;
    name: string;
    email: string;
    phone: string;
    specialties: TechnicianSpecialty[];
    status: TechnicianStatus;
    current_location?: {
        lat: number;
        lng: number;
        last_update: Date;
    };
}

export interface TicketComment {
    id: number;
    ticket_id: number;
    user_id: number;
    comment: string;
    created_at: Date;
}

export interface TicketAttachment {
    id: number;
    ticket_id: number;
    file_name: string;
    file_url: string;
    file_type: string;
    created_at: Date;
} 