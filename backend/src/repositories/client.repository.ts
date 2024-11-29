import { db } from '../database';

export interface Client {
    id: number;
    name: string;
    contact_person?: string;
    email?: string;
    phone?: string;
    address?: string;
    city?: string;
    state?: string;
    zip_code?: string;
    country?: string;
    active: boolean;
    created_at: Date;
    updated_at: Date;
}

export interface CreateClientDTO {
    name: string;
    contact_person?: string;
    email?: string;
    phone?: string;
    address?: string;
    city?: string;
    state?: string;
    zip_code?: string;
    country?: string;
}

export interface UpdateClientDTO extends Partial<CreateClientDTO> {
    active?: boolean;
}

export class ClientRepository {
    async findAll(): Promise<Client[]> {
        return db('clients')
            .select('*')
            .orderBy('created_at', 'desc');
    }

    async findById(id: number): Promise<Client | undefined> {
        return db('clients')
            .where({ id })
            .first();
    }

    async findActive(): Promise<Client[]> {
        return db('clients')
            .where({ active: true })
            .orderBy('name');
    }

    async create(data: CreateClientDTO): Promise<Client> {
        const [client] = await db('clients')
            .insert({
                ...data,
                active: true
            })
            .returning('*');
        return client;
    }

    async update(id: number, data: UpdateClientDTO): Promise<Client> {
        const [client] = await db('clients')
            .where({ id })
            .update({
                ...data,
                updated_at: new Date()
            })
            .returning('*');
        return client;
    }

    async delete(id: number): Promise<void> {
        await db('clients')
            .where({ id })
            .delete();
    }

    async getCameras(clientId: number): Promise<any[]> {
        return db('cameras')
            .where({ client_id: clientId })
            .select('*');
    }
} 