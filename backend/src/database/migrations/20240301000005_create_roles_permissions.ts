import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
    // Crear tabla de roles
    await knex.schema.createTable('roles', (table) => {
        table.increments('id').primary();
        table.string('name').notNullable().unique();
        table.string('description');
        table.timestamps(true, true);
    });

    // Crear tabla de permisos
    await knex.schema.createTable('permissions', (table) => {
        table.increments('id').primary();
        table.string('name').notNullable().unique();
        table.string('description');
        table.string('resource').notNullable();
        table.string('action').notNullable();
        table.timestamps(true, true);
    });

    // Crear tabla de relación roles_permissions
    await knex.schema.createTable('roles_permissions', (table) => {
        table.increments('id').primary();
        table.integer('role_id').unsigned().notNullable()
            .references('id').inTable('roles')
            .onDelete('CASCADE');
        table.integer('permission_id').unsigned().notNullable()
            .references('id').inTable('permissions')
            .onDelete('CASCADE');
        table.unique(['role_id', 'permission_id']);
        table.timestamps(true, true);
    });

    // Modificar la tabla users para incluir role_id
    await knex.schema.alterTable('users', (table) => {
        table.integer('role_id').unsigned()
            .references('id').inTable('roles')
            .onDelete('SET NULL');
    });
}

export async function down(knex: Knex): Promise<void> {
    await knex.schema.alterTable('users', (table) => {
        table.dropColumn('role_id');
    });
    await knex.schema.dropTable('roles_permissions');
    await knex.schema.dropTable('permissions');
    await knex.schema.dropTable('roles');
} 