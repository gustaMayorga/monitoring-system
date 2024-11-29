import request from 'supertest';
import { app } from '../../src/app';
import { db } from '../../src/database';
import config from '../../src/config';
import { createTestUser, cleanupTestUser } from '../helpers/auth';

describe('Auth API Integration', () => {
    let testUser: any;

    beforeAll(async () => {
        expect(config.database.connection.database).toContain('test');
        testUser = await createTestUser();
    });

    afterAll(async () => {
        await cleanupTestUser();
        await db.destroy();
    });

    it('debe autenticar un usuario válido', async () => {
        const response = await request(app)
            .post('/api/auth/login')
            .send({
                username: testUser.username,
                password: 'test123'
            });

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('token');
        expect(response.body.user).toHaveProperty('id', testUser.id);
    });

    it('debe rechazar credenciales inválidas', async () => {
        const response = await request(app)
            .post('/api/auth/login')
            .send({
                username: testUser.username,
                password: 'wrong'
            });

        expect(response.status).toBe(401);
        expect(response.body).toHaveProperty('message', 'Credenciales inválidas');
    });
}); 