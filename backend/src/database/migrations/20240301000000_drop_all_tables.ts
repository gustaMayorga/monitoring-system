import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
    // Para PostgreSQL
    await knex.raw('DROP SCHEMA public CASCADE');
    await knex.raw('CREATE SCHEMA public');
    await knex.raw('GRANT ALL ON SCHEMA public TO postgres');
    await knex.raw('GRANT ALL ON SCHEMA public TO public');
}

export async function down(knex: Knex): Promise<void> {
    // No hacer nada en down
} 