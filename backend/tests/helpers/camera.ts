import { db } from '../../src/database';
import { DbCamera } from '../../src/types/camera';

export async function createTestCamera(clientId: number) {
    const [camera] = await db<DbCamera>('cameras').insert({
        name: 'Test Camera',
        location: 'Test Location',
        ip_address: '192.168.1.100',
        port: 80,
        stream_url: 'rtsp://test/stream',
        vendor: 'hikvision',
        client_id: clientId,
        status: 'active',
        created_at: new Date(),
        updated_at: new Date()
    }).returning('*');

    return camera;
}

export async function cleanupTestCamera(id: number) {
    await db('cameras').where({ id }).delete();
} 