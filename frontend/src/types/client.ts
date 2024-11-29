import { Camera } from './camera';

export interface Client {
    id: number;
    name: string;
    contact_person: string;
    email: string;
    phone: string;
    address?: string;
    status: ClientStatus;
    created_at: Date;
    updated_at: Date;
    cameras?: Camera[];
}

export type ClientStatus = 'active' | 'inactive' | 'suspended';

export interface CreateClientDTO {
    name: string;
    contact_person: string;
    email: string;
    phone: string;
    address?: string;
}

export interface UpdateClientDTO extends Partial<CreateClientDTO> {
    status?: ClientStatus;
}

export interface ClientQuery {
    search?: string;
    status?: ClientStatus;
    page?: number;
    limit?: number;
} 