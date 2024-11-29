import axios from 'axios';
import { ServiceTicket, TicketStatus, TicketPriority, TechnicianAssignment } from '../types/ticket';

export class TicketService {
    private baseUrl: string;

    constructor(baseUrl = '/api') {
        this.baseUrl = baseUrl;
    }

    async getTickets(filters?: {
        status?: TicketStatus;
        priority?: TicketPriority;
        technician_id?: number;
        client_id?: number;
    }): Promise<ServiceTicket[]> {
        const response = await axios.get(`${this.baseUrl}/technical-services`, {
            params: filters
        });
        return response.data.data;
    }

    async getTicket(id: number): Promise<ServiceTicket> {
        const response = await axios.get(`${this.baseUrl}/technical-services/${id}`);
        return response.data.data;
    }

    async createTicket(ticket: Omit<ServiceTicket, 'id'>): Promise<ServiceTicket> {
        const response = await axios.post(`${this.baseUrl}/technical-services`, ticket);
        return response.data.data;
    }

    async updateTicket(id: number, ticket: Partial<ServiceTicket>): Promise<ServiceTicket> {
        const response = await axios.put(`${this.baseUrl}/technical-services/${id}`, ticket);
        return response.data.data;
    }

    async deleteTicket(id: number): Promise<void> {
        await axios.delete(`${this.baseUrl}/technical-services/${id}`);
    }

    async assignTechnician(ticketId: number, technicianId: number): Promise<void> {
        await axios.post(`${this.baseUrl}/technical-services/${ticketId}/assign`, {
            technician_id: technicianId
        });
    }

    async addComment(ticketId: number, comment: string): Promise<void> {
        await axios.post(`${this.baseUrl}/technical-services/${ticketId}/comments`, {
            comment
        });
    }

    async updateStatus(ticketId: number, status: TicketStatus): Promise<void> {
        await axios.post(`${this.baseUrl}/technical-services/${ticketId}/status`, {
            status
        });
    }

    async getTechnicianAssignments(technicianId: number): Promise<TechnicianAssignment[]> {
        const response = await axios.get(`${this.baseUrl}/technicians/${technicianId}/assignments`);
        return response.data.data;
    }

    async assignTicket(ticketId: number, technicianId: number, scheduledDate: Date): Promise<void> {
        await axios.post(`${this.baseUrl}/technical-services/${ticketId}/assign`, {
            technician_id: technicianId,
            scheduled_date: scheduledDate.toISOString()
        });
    }

    async updateAssignmentStatus(assignmentId: number, status: TicketStatus): Promise<void> {
        await axios.put(`${this.baseUrl}/assignments/${assignmentId}/status`, { status });
    }
} 