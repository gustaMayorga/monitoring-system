import { ClientRepository, CreateClientDTO, UpdateClientDTO, Client } from '../repositories/client.repository';

export class ClientService {
    constructor(private clientRepository: ClientRepository) {}

    async getAllClients(): Promise<Client[]> {
        return this.clientRepository.findAll();
    }

    async getActiveClients(): Promise<Client[]> {
        return this.clientRepository.findActive();
    }

    async getClientById(id: number): Promise<Client | undefined> {
        return this.clientRepository.findById(id);
    }

    async createClient(data: CreateClientDTO): Promise<Client> {
        // Aquí podrías agregar validaciones adicionales
        return this.clientRepository.create(data);
    }

    async updateClient(id: number, data: UpdateClientDTO): Promise<Client> {
        const client = await this.clientRepository.findById(id);
        if (!client) {
            throw new Error('Cliente no encontrado');
        }
        return this.clientRepository.update(id, data);
    }

    async deleteClient(id: number): Promise<void> {
        const client = await this.clientRepository.findById(id);
        if (!client) {
            throw new Error('Cliente no encontrado');
        }

        // Verificar si el cliente tiene cámaras asociadas
        const cameras = await this.clientRepository.getCameras(id);
        if (cameras.length > 0) {
            throw new Error('No se puede eliminar el cliente porque tiene cámaras asociadas');
        }

        await this.clientRepository.delete(id);
    }

    async getClientCameras(id: number): Promise<any[]> {
        const client = await this.clientRepository.findById(id);
        if (!client) {
            throw new Error('Cliente no encontrado');
        }
        return this.clientRepository.getCameras(id);
    }
} 