import { Knex } from 'knex';
import bcrypt from 'bcrypt';

export async function seed(knex: Knex): Promise<void> {
    // Limpiar las tablas en orden para evitar problemas de foreign keys
    await knex('roles_permissions').del();
    await knex('permissions').del();
    await knex('roles').del();

    // Crear roles básicos
    const roles = await knex('roles').insert([
        {
            name: 'admin',
            description: 'Administrador del sistema con acceso completo'
        },
        {
            name: 'supervisor',
            description: 'Supervisor con acceso a monitoreo y reportes'
        },
        {
            name: 'operator',
            description: 'Operador con acceso básico al sistema'
        }
    ]).returning('*');

    const adminRole = roles.find(r => r.name === 'admin');
    const supervisorRole = roles.find(r => r.name === 'supervisor');

    // Crear permisos por recurso
    const permissions = await knex('permissions').insert([
        // Permisos de usuarios
        { name: 'users:create', resource: 'users', action: 'create', description: 'Crear usuarios' },
        { name: 'users:read', resource: 'users', action: 'read', description: 'Ver usuarios' },
        { name: 'users:update', resource: 'users', action: 'update', description: 'Actualizar usuarios' },
        { name: 'users:delete', resource: 'users', action: 'delete', description: 'Eliminar usuarios' },

        // Permisos de roles
        { name: 'roles:create', resource: 'roles', action: 'create', description: 'Crear roles' },
        { name: 'roles:read', resource: 'roles', action: 'read', description: 'Ver roles' },
        { name: 'roles:update', resource: 'roles', action: 'update', description: 'Actualizar roles' },
        { name: 'roles:delete', resource: 'roles', action: 'delete', description: 'Eliminar roles' },
        { name: 'roles:manage', resource: 'roles', action: 'manage', description: 'Gestionar permisos de roles' },

        // Permisos de cámaras
        { name: 'cameras:create', resource: 'cameras', action: 'create', description: 'Crear cámaras' },
        { name: 'cameras:read', resource: 'cameras', action: 'read', description: 'Ver cámaras' },
        { name: 'cameras:update', resource: 'cameras', action: 'update', description: 'Actualizar cámaras' },
        { name: 'cameras:delete', resource: 'cameras', action: 'delete', description: 'Eliminar cámaras' },
        { name: 'cameras:stream', resource: 'cameras', action: 'stream', description: 'Ver stream de cámaras' },
        { name: 'cameras:manage', resource: 'cameras', action: 'manage', description: 'Gestionar configuración de cámaras' },

        // Permisos de eventos
        { name: 'events:create', resource: 'events', action: 'create', description: 'Crear eventos' },
        { name: 'events:read', resource: 'events', action: 'read', description: 'Ver eventos' },
        { name: 'events:update', resource: 'events', action: 'update', description: 'Actualizar eventos' },
        { name: 'events:delete', resource: 'events', action: 'delete', description: 'Eliminar eventos' },
        { name: 'events:manage', resource: 'events', action: 'manage', description: 'Gestionar eventos' },

        // Permisos de clientes
        { name: 'clients:create', resource: 'clients', action: 'create', description: 'Crear clientes' },
        { name: 'clients:read', resource: 'clients', action: 'read', description: 'Ver clientes' },
        { name: 'clients:update', resource: 'clients', action: 'update', description: 'Actualizar clientes' },
        { name: 'clients:delete', resource: 'clients', action: 'delete', description: 'Eliminar clientes' },
        { name: 'clients:manage', resource: 'clients', action: 'manage', description: 'Gestionar clientes' }
    ]).returning('*');

    // Asignar todos los permisos al rol admin
    if (adminRole) {
        await knex('roles_permissions').insert(
            permissions.map(permission => ({
                role_id: adminRole.id,
                permission_id: permission.id
            }))
        );
    }

    // Asignar permisos de lectura y operación básica al supervisor
    if (supervisorRole) {
        const supervisorPermissions = permissions.filter(p => 
            p.name.includes(':read') || 
            p.name.includes(':stream') ||
            p.name === 'events:create' ||
            p.name === 'events:update'
        );

        await knex('roles_permissions').insert(
            supervisorPermissions.map(permission => ({
                role_id: supervisorRole.id,
                permission_id: permission.id
            }))
        );
    }

    // Crear usuario admin por defecto si no existe
    const existingAdmin = await knex('users').where({ username: 'admin' }).first();
    if (!existingAdmin && adminRole) {
        const hashedPassword = await bcrypt.hash('admin123', 10);
        await knex('users').insert({
            username: 'admin',
            password: hashedPassword,
            role_id: adminRole.id
        });
    }
} 