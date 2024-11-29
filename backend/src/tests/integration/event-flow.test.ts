import request from 'supertest';
import { app } from '../../app';
import { db } from '../../database';
import { createTestUser, cleanupTestUser } from '../helpers/auth';
import { createTestClient, cleanupTestClient } from '../helpers/client';
import { createTestCamera, cleanupTestCamera } from '../helpers/camera';

describe('Flujo de Eventos', () => {
    let token: string;
    let clientId: number;
    let cameraId: number;

    beforeAll(async () => {
        // Crear datos de prueba
        const user = await createTestUser();
        const client = await createTestClient();
        const camera = await createTestCamera(client.id);

        clientId = client.id;
        cameraId = camera.id;

        // Obtener token
        const loginResponse = await request(app)
            .post('/api/auth/login')
            .send({
                username: user.username,
                password: 'test123'
            });

        token = loginResponse.body.token;
    });

    afterAll(async () => {
        await cleanupTestUser();
        await db.destroy();
    });

    it('debe crear y notificar un nuevo evento', async () => {
        const eventData = {
            event_type_id: 1,
            camera_id: cameraId,
            client_id: clientId,
            description: 'Movimiento detectado',
            occurred_at: new Date(),
            metadata: {
                confidence: 0.95
            }
        };

        const response = await request(app)
            .post('/api/events')
            .set('Authorization', `Bearer ${token}`)
            .send(eventData);

        expect(response.status).toBe(201);
        expect(response.body.data).toHaveProperty('id');
        expect(response.body.data.description).toBe(eventData.description);
    });

    it('debe listar eventos con filtros', async () => {
        const response = await request(app)
            .get('/api/events')
            .set('Authorization', `Bearer ${token}`)
            .query({
                clientId,
                fromDate: new Date(Date.now() - 86400000).toISOString(),
                toDate: new Date().toISOString()
            });

        expect(response.status).toBe(200);
        expect(Array.isArray(response.body.data)).toBe(true);
    });
}); 