import { AlarmService } from '../../services/alarmService';
import axios from 'axios';
import { AlarmPanel } from '../../types/alarm';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('AlarmService', () => {
    let service: AlarmService;
    const mockPanel: AlarmPanel = {
        id: 1,
        name: 'Test Panel',
        ip: '192.168.1.100',
        port: 7000,
        username: 'admin',
        password: 'admin123',
        protocol: 'contact-id',
        status: 'online'
    };

    beforeEach(() => {
        service = new AlarmService();
        jest.clearAllMocks();
    });

    describe('getPanels', () => {
        it('should fetch all panels', async () => {
            mockedAxios.get.mockResolvedValueOnce({ data: { data: [mockPanel] } });
            const panels = await service.getPanels();
            expect(panels).toEqual([mockPanel]);
            expect(mockedAxios.get).toHaveBeenCalledWith('/api/alarm-panels');
        });

        it('should handle errors', async () => {
            const error = new Error('Network error');
            mockedAxios.get.mockRejectedValueOnce(error);
            await expect(service.getPanels()).rejects.toThrow('Network error');
        });
    });

    describe('panel operations', () => {
        it('should arm panel', async () => {
            const partitions = [1];
            mockedAxios.post.mockResolvedValueOnce({ data: { success: true } });
            await service.armPanel(1, partitions);
            expect(mockedAxios.post).toHaveBeenCalledWith('/api/alarm-panels/1/arm', { partitions });
        });

        it('should disarm panel', async () => {
            const partitions = [1];
            mockedAxios.post.mockResolvedValueOnce({ data: { success: true } });
            await service.disarmPanel(1, partitions);
            expect(mockedAxios.post).toHaveBeenCalledWith('/api/alarm-panels/1/disarm', { partitions });
        });

        it('should fetch events', async () => {
            const startDate = new Date('2024-01-01');
            const endDate = new Date('2024-01-02');
            const mockEvents = [
                { 
                    id: 1, 
                    panel_id: 1,
                    event_code: 'E130',
                    event_type: 'burglar',
                    zone: 1,
                    timestamp: startDate.toISOString()
                }
            ];

            mockedAxios.get.mockResolvedValueOnce({ data: { data: mockEvents } });
            const events = await service.getEvents(1, startDate, endDate);

            expect(events).toEqual(mockEvents);
            expect(mockedAxios.get).toHaveBeenCalledWith(
                '/api/alarm-panels/1/events',
                {
                    params: {
                        start_date: startDate.toISOString(),
                        end_date: endDate.toISOString()
                    }
                }
            );
        });
    });

    describe('CRUD operations', () => {
        it('should create panel', async () => {
            const newPanel = { ...mockPanel };
            delete newPanel.id;
            mockedAxios.post.mockResolvedValueOnce({ data: { data: mockPanel } });
            
            const result = await service.createPanel(newPanel);
            expect(result).toEqual(mockPanel);
            expect(mockedAxios.post).toHaveBeenCalledWith('/api/alarm-panels', newPanel);
        });

        it('should update panel', async () => {
            const updates = { name: 'Updated Panel' };
            mockedAxios.put.mockResolvedValueOnce({ 
                data: { data: { ...mockPanel, ...updates } }
            });
            
            const result = await service.updatePanel(1, updates);
            expect(result.name).toBe('Updated Panel');
            expect(mockedAxios.put).toHaveBeenCalledWith('/api/alarm-panels/1', updates);
        });

        it('should delete panel', async () => {
            mockedAxios.delete.mockResolvedValueOnce({ data: { success: true } });
            await service.deletePanel(1);
            expect(mockedAxios.delete).toHaveBeenCalledWith('/api/alarm-panels/1');
        });
    });
}); 