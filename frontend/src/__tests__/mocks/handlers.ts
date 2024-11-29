import { rest } from 'msw';
import { RestContext, RestRequest } from 'msw';
import { ServiceTicket, TicketStatus, TechnicianAssignment } from '../../types/ticket';
import { Camera } from '../../types/camera';
import { AlarmPanel } from '../../types/alarm';

export const handlers = [
    // Auth endpoints
    rest.post('/api/auth/login', async (req: RestRequest, res, ctx: RestContext) => {
        return res([
            ctx.json({
                token: 'test-token',
                user: {
                    id: 1,
                    username: 'test',
                    role: 'admin',
                    permissions: ['read:all', 'write:all']
                }
            })
        ]);
    }),

    // Camera endpoints
    rest.get('/api/cameras', async (req, res, ctx) => {
        return res([
            ctx.json({ 
                data: [{
                    id: 1,
                    name: 'Camera 1',
                    stream_url: 'rtsp://test/1',
                    status: 'online',
                    type: 'hikvision',
                    config: {
                        ip: '192.168.1.100',
                        port: 80,
                        username: 'admin',
                        password: 'admin123'
                    }
                }]
            })
        ]);
    }),

    // Ticket endpoints
    rest.get('/api/technical-services', async (req, res, ctx) => {
        return res([
            ctx.json({
                data: [{
                    id: 1,
                    client_id: 1,
                    title: 'Test Ticket',
                    description: 'Test Description',
                    status: 'pending' as TicketStatus,
                    priority: 'high',
                    created_at: new Date(),
                    updated_at: new Date()
                }]
            })
        ]);
    }),

    // Technician assignments
    rest.get('/api/technicians/:id/assignments', async (req, res, ctx) => {
        return res([
            ctx.json({
                data: [{
                    id: 1,
                    ticket_id: 1,
                    technician_id: Number(req.params.id),
                    status: 'pending' as TicketStatus,
                    scheduled_date: new Date().toISOString()
                }]
            })
        ]);
    }),

    // Dashboard endpoints
    rest.get('/api/system/status', async (req, res, ctx) => {
        return res([
            ctx.json({
                totalCameras: 10,
                onlineCameras: 8,
                offlineCameras: 2,
                lastUpdate: new Date().toISOString()
            })
        ]);
    }),

    rest.get('/api/events/recent', async (req, res, ctx) => {
        return res([
            ctx.json({
                events: [
                    {
                        id: 1,
                        type: 'CAMERA_OFFLINE',
                        description: 'Cámara 3 se desconectó',
                        timestamp: new Date().toISOString()
                    },
                    {
                        id: 2,
                        type: 'MOTION_DETECTED',
                        description: 'Movimiento detectado en Cámara 1',
                        timestamp: new Date().toISOString()
                    }
                ]
            })
        ]);
    })
]; 