import { db } from '../../database';
import { Client } from '../../types/client';

export async function createTestClient() {
    const [client] = await db('clients').insert({
        name: 'Test Client',
        contact_person: 'Test Contact',
        email: 'test@example.com',
        phone: '1234567890',
        status: 'active',
        created_at: new Date(),
        updated_at: new Date()
    }).returning('*');

    return client;
}

export async function cleanupTestClient(id: number) {
    await db('clients').where({ id }).delete();
} 