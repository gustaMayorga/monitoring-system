import { TicketService } from '../../services/ticketService';
import axios from 'axios';
import { ServiceTicket, TicketStatus, TicketPriority, TechnicianAssignment } from '../../types/ticket';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('TicketService', () => {
    let service: TicketService;

    const mockTicket: ServiceTicket = {
        id: 1,
        client_id: 1,
        title: 'Test Ticket',
        description: 'Test Description',
        status: 'pending',
        priority: 'high',
        created_at: new Date(),
        updated_at: new Date()
    };

    const mockAssignment: TechnicianAssignment = {
        id: 1,
        ticket_id: 1,
        technician_id: 1,
        status: 'pending',
        scheduled_date: new Date().toISOString()
    };

    beforeEach(() => {
        service = new TicketService();
        jest.clearAllMocks();
    });

    describe('getTechnicianAssignments', () => {
        it('should fetch technician assignments', async () => {
            mockedAxios.get.mockResolvedValueOnce({ data: { data: [mockAssignment] } });
            const assignments = await service.getTechnicianAssignments(1);
            expect(assignments).toEqual([mockAssignment]);
            expect(mockedAxios.get).toHaveBeenCalledWith('/api/technicians/1/assignments');
        });
    });

    describe('assignTicket', () => {
        it('should assign ticket to technician', async () => {
            const scheduledDate = new Date();
            mockedAxios.post.mockResolvedValueOnce({ data: { success: true } });
            
            await service.assignTicket(1, 1, scheduledDate);
            
            expect(mockedAxios.post).toHaveBeenCalledWith(
                '/api/technical-services/1/assign',
                {
                    technician_id: 1,
                    scheduled_date: scheduledDate.toISOString()
                }
            );
        });
    });

    describe('updateAssignmentStatus', () => {
        it('should update assignment status', async () => {
            mockedAxios.put.mockResolvedValueOnce({ data: { success: true } });
            
            await service.updateAssignmentStatus(1, 'in_progress');
            
            expect(mockedAxios.put).toHaveBeenCalledWith(
                '/api/assignments/1/status',
                { status: 'in_progress' }
            );
        });
    });
}); 