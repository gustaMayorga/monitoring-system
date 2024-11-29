import { PermissionRepository, CreatePermissionDTO, UpdatePermissionDTO, Permission } from '../repositories/permission.repository';

export class PermissionService {
    constructor(private permissionRepository: PermissionRepository) {}

    async getAllPermissions(): Promise<Permission[]> {
        return this.permissionRepository.findAll();
    }

    async getPermissionById(id: number): Promise<Permission | undefined> {
        return this.permissionRepository.findById(id);
    }

    async createPermission(data: CreatePermissionDTO): Promise<Permission> {
        const existingPermission = await this.permissionRepository.findByName(data.name);
        if (existingPermission) {
            throw new Error('Permission already exists');
        }

        // Validar el formato del nombre (resource:action)
        if (!this.validatePermissionName(data.name, data.resource, data.action)) {
            throw new Error('Invalid permission name format. Expected: resource:action');
        }

        return this.permissionRepository.create(data);
    }

    async updatePermission(id: number, data: UpdatePermissionDTO): Promise<Permission> {
        const permission = await this.permissionRepository.findById(id);
        if (!permission) {
            throw new Error('Permission not found');
        }

        if (data.name && data.name !== permission.name) {
            const existingPermission = await this.permissionRepository.findByName(data.name);
            if (existingPermission) {
                throw new Error('Permission name already exists');
            }

            // Validar el formato del nombre si se está actualizando
            if (data.resource && data.action) {
                if (!this.validatePermissionName(data.name, data.resource, data.action)) {
                    throw new Error('Invalid permission name format. Expected: resource:action');
                }
            }
        }

        return this.permissionRepository.update(id, data);
    }

    async deletePermission(id: number): Promise<void> {
        const permission = await this.permissionRepository.findById(id);
        if (!permission) {
            throw new Error('Permission not found');
        }
        await this.permissionRepository.delete(id);
    }

    async getPermissionsByResource(resource: string): Promise<Permission[]> {
        return this.permissionRepository.findByResource(resource);
    }

    async getPermissionsByAction(action: string): Promise<Permission[]> {
        return this.permissionRepository.findByAction(action);
    }

    private validatePermissionName(name: string, resource: string, action: string): boolean {
        return name === `${resource}:${action}`;
    }
} 