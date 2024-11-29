import { db } from '../database';

export interface Permission {
    id: number;
    name: string;
    description?: string;
    resource: string;
    action: string;
    created_at: Date;
    updated_at: Date;
}

export interface CreatePermissionDTO {
    name: string;
    description?: string;
    resource: string;
    action: string;
}

export interface UpdatePermissionDTO extends Partial<CreatePermissionDTO> {}

export class PermissionRepository {
    async findAll(): Promise<Permission[]> {
        return db('permissions').select('*');
    }

    async findById(id: number): Promise<Permission | undefined> {
        return db('permissions').where({ id }).first();
    }

    async findByName(name: string): Promise<Permission | undefined> {
        return db('permissions').where({ name }).first();
    }

    async create(data: CreatePermissionDTO): Promise<Permission> {
        const [permission] = await db('permissions')
            .insert(data)
            .returning('*');
        return permission;
    }

    async update(id: number, data: UpdatePermissionDTO): Promise<Permission> {
        const [permission] = await db('permissions')
            .where({ id })
            .update(data)
            .returning('*');
        return permission;
    }

    async delete(id: number): Promise<void> {
        await db('permissions').where({ id }).delete();
    }

    async findByResource(resource: string): Promise<Permission[]> {
        return db('permissions').where({ resource });
    }

    async findByAction(action: string): Promise<Permission[]> {
        return db('permissions').where({ action });
    }

    async getRoles(permissionId: number): Promise<number[]> {
        const roles = await db('roles_permissions')
            .where('permission_id', permissionId)
            .select('role_id');
        return roles.map(r => r.role_id);
    }
} 