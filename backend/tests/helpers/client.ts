import { db } from '../../src/database';
import { CreateClientDTO } from '../../src/types/client';

export async function createTestClient() {
    const [client] = await db('clients').insert({
        name: 'Test Client',
        contact_person: 'Test Contact',
        email: 'test@example.com',
        phone: '1234567890',
        active: true
    }).returning('*');

    return client;
}

export async function cleanupTestClient(id: number) {
    await db('clients').where({ id }).delete();
} 