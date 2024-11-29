import { rest } from 'msw';

export const handlers = [
    rest.post('/api/auth/login', (_req, res, ctx) => {
        console.log('Mock: Login request received');
        return res([
            ctx.status(200),
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

    rest.get('/api/dashboard/stats', (_req, res, ctx) => {
        console.log('Mock: Dashboard stats request received');
        return res([
            ctx.status(200),
            ctx.json({
                active_alarms: 5,
                total_cameras: 10,
                online_cameras: 8,
                offline_cameras: 2,
                title: 'Dashboard',
                message: 'Panel de Control',
                sections: {
                    monitoring: 'Monitoreo',
                    cameras: 'Cámaras'
                }
            })
        ]);
    }),

    rest.get('/api/cameras', (_req, res, ctx) => {
        console.log('Mock: Cameras request received');
        return res([
            ctx.status(200),
            ctx.json({
                data: [{
                    id: 1,
                    name: 'Test Camera',
                    stream_url: 'rtsp://test',
                    status: 'online',
                    type: 'hikvision'
                }],
                title: 'Cámaras'
            })
        ]);
    })
];

export const errorHandlers = {
    loginError: rest.post('/api/auth/login', (_req, res, ctx) => {
        return res([
            ctx.status(401),
            ctx.json({ message: 'Invalid credentials' })
        ]);
    })
}; 