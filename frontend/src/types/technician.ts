export type TicketStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled';

export interface TechnicianAssignment {
    id: number;
    ticket_id: number;
    technician_id: number;
    status: TicketStatus;
    scheduled_date: string;
} 