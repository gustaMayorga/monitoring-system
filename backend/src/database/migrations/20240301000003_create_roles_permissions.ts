import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
    // Tabla de roles
    await knex.schema.createTable('roles', (table) => {
        table.increments('id').primary();
        table.string('name').notNullable().unique();
        table.string('description');
        table.timestamps(true, true);
    });

    // Tabla de permisos
    await knex.schema.createTable('permissions', (table) => {
        table.increments('id').primary();
        table.string('name').notNullable().unique();
        table.string('description');
        table.string('resource').notNullable();
        table.string('action').notNullable();
        table.timestamps(true, true);
    });

    // Tabla pivote roles_permissions
    await knex.schema.createTable('roles_permissions', (table) => {
        table.integer('role_id').references('id').inTable('roles').onDelete('CASCADE');
        table.integer('permission_id').references('id').inTable('permissions').onDelete('CASCADE');
        table.primary(['role_id', 'permission_id']);
    });

    // Agregar columna role_id a users
    await knex.schema.alterTable('users', (table) => {
        table.integer('role_id').references('id').inTable('roles');
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