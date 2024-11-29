import { db } from '../database';

export interface Role {
    id: number;
    name: string;
    description?: string;
    created_at: Date;
    updated_at: Date;
}

export class RoleRepository {
    async findAll(): Promise<Role[]> {
        return db('roles').select('*');
    }

    async findById(id: number): Promise<Role | undefined> {
        return db('roles').where({ id }).first();
    }

    async findByName(name: string): Promise<Role | undefined> {
        return db('roles').where({ name }).first();
    }

    async create(data: { name: string; description?: string }): Promise<Role> {
        const [role] = await db('roles').insert(data).returning('*');
        return role;
    }

    async update(id: number, data: { name?: string; description?: string }): Promise<Role> {
        const [role] = await db('roles')
            .where({ id })
            .update(data)
            .returning('*');
        return role;
    }

    async delete(id: number): Promise<void> {
        await db('roles').where({ id }).delete();
    }

    async getPermissions(roleId: number): Promise<string[]> {
        const result = await db('roles_permissions')
            .join('permissions', 'roles_permissions.permission_id', 'permissions.id')
            .where('roles_permissions.role_id', roleId)
            .select('permissions.name');
        
        return result.map(p => p.name);
    }

    async setPermissions(roleId: number, permissionIds: number[]): Promise<void> {
        await db.transaction(async (trx) => {
            await trx('roles_permissions')
                .where({ role_id: roleId })
                .delete();

            if (permissionIds.length > 0) {
                await trx('roles_permissions').insert(
                    permissionIds.map(permissionId => ({
                        role_id: roleId,
                        permission_id: permissionId
                    }))
                );
            }
        });
    }
} 