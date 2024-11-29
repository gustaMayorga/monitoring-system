import { rest } from 'msw';
import { API_URL } from '../config';

export const handlers = [
    // Auth
    rest.post(`${API_URL}/auth/login`, (req, res, ctx) => {
        return res(
            ctx.status(200),
            ctx.json({
                token: 'fake-jwt-token',
                user: {
                    id: 1,
                    username: 'testuser',
                    role: 'admin'
                }
            })
        );
    }),

    // Cameras
    rest.get(`${API_URL}/cameras`, (req, res, ctx) => {
        return res(
            ctx.status(200),
            ctx.json({
                data: [
                    {
                        id: 1,
                        name: 'Camera 1',
                        location: 'Location 1',
                        status: 'active'
                    }
                ]
            })
        );
    }),

    // Events
    rest.get(`${API_URL}/events`, (req, res, ctx) => {
        return res(
            ctx.status(200),
            ctx.json({
                data: [
                    {
                        id: 1,
                        type: 'motion',
                        camera_id: 1,
                        timestamp: new Date().toISOString()
                    }
                ]
            })
        );
    })
]; 