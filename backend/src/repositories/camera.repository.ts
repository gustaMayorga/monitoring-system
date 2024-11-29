import { db } from '../database';
import { Camera, CreateCameraDTO, UpdateCameraDTO, CameraVendor, CameraStatus } from '../types/camera';

export interface DbCamera {
    id: number;
    name: string;
    location: string;
    ip_address: string;
    port: number;
    stream_url: string;
    vendor: CameraVendor;
    client_id: number;
    status: CameraStatus;
    username?: string;
    password?: string;
    created_at: Date;
    updated_at: Date;
}

export class CameraRepository {
    async findAll(): Promise<DbCamera[]> {
        return db<DbCamera>('cameras').select('*');
    }

    async findById(id: number): Promise<DbCamera | undefined> {
        return db<DbCamera>('cameras').where({ id }).first();
    }

    async create(data: CreateCameraDTO): Promise<DbCamera> {
        const [camera] = await db<DbCamera>('cameras')
            .insert({
                ...data,
                created_at: new Date(),
                updated_at: new Date()
            })
            .returning('*');
        return camera;
    }

    async update(id: number, data: UpdateCameraDTO): Promise<DbCamera> {
        const [camera] = await db<DbCamera>('cameras')
            .where({ id })
            .update({
                ...data,
                updated_at: new Date()
            })
            .returning('*');
        return camera;
    }

    async delete(id: number): Promise<void> {
        await db<DbCamera>('cameras').where({ id }).delete();
    }
} 