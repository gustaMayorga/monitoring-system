export interface Client {
    id: number;
    name: string;
    contact_person: string;
    email: string;
    phone: string;
    address?: string;
    status: 'active' | 'inactive';
    created_at: Date;
    updated_at: Date;
}

export interface CreateClientDTO {
    name: string;
    contact_person: string;
    email: string;
    phone: string;
    address?: string;
}

export interface UpdateClientDTO extends Partial<CreateClientDTO> {
    status?: 'active' | 'inactive';
} 