import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
    // Crear la tabla de migraciones si no existe
    if (!(await knex.schema.hasTable('knex_migrations'))) {
        await knex.schema.createTable('knex_migrations', (table) => {
            table.increments('id').primary();
            table.string('name');
            table.integer('batch');
            table.timestamp('migration_time');
        });
    }

    if (!(await knex.schema.hasTable('knex_migrations_lock'))) {
        await knex.schema.createTable('knex_migrations_lock', (table) => {
            table.integer('index').primary();
            table.integer('is_locked');
        });
    }
}

export async function down(knex: Knex): Promise<void> {
    await knex.schema.dropTableIfExists('knex_migrations');
    await knex.schema.dropTableIfExists('knex_migrations_lock');
} 