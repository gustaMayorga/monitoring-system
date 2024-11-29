import { RoleRepository, CreateRoleDTO, UpdateRoleDTO, Role } from '../repositories/role.repository';
import { PermissionRepository } from '../repositories/permission.repository';

export class RoleService {
    constructor(
        private roleRepository: RoleRepository,
        private permissionRepository: PermissionRepository
    ) {}

    async getAllRoles(): Promise<Role[]> {
        return this.roleRepository.findAll();
    }

    async getRoleById(id: number): Promise<Role | undefined> {
        return this.roleRepository.findById(id);
    }

    async createRole(data: CreateRoleDTO): Promise<Role> {
        const existingRole = await this.roleRepository.findByName(data.name);
        if (existingRole) {
            throw new Error('Role already exists');
        }
        return this.roleRepository.create(data);
    }

    async updateRole(id: number, data: UpdateRoleDTO): Promise<Role> {
        const role = await this.roleRepository.findById(id);
        if (!role) {
            throw new Error('Role not found');
        }

        if (data.name && data.name !== role.name) {
            const existingRole = await this.roleRepository.findByName(data.name);
            if (existingRole) {
                throw new Error('Role name already exists');
            }
        }

        return this.roleRepository.update(id, data);
    }

    async deleteRole(id: number): Promise<void> {
        const role = await this.roleRepository.findById(id);
        if (!role) {
            throw new Error('Role not found');
        }
        await this.roleRepository.delete(id);
    }

    async getRolePermissions(roleId: number): Promise<string[]> {
        const role = await this.roleRepository.findById(roleId);
        if (!role) {
            throw new Error('Role not found');
        }
        return this.roleRepository.getPermissions(roleId);
    }

    async setRolePermissions(roleId: number, permissionNames: string[]): Promise<void> {
        const role = await this.roleRepository.findById(roleId);
        if (!role) {
            throw new Error('Role not found');
        }

        // Verificar que todos los permisos existen
        const permissions = await Promise.all(
            permissionNames.map(name => this.permissionRepository.findByName(name))
        );

        const invalidPermissions = permissions.filter(p => !p);
        if (invalidPermissions.length > 0) {
            throw new Error('Some permissions do not exist');
        }

        const permissionIds = permissions.map(p => p!.id);
        await this.roleRepository.setPermissions(roleId, permissionIds);
    }
} 