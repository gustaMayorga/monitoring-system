import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
    return knex.schema.createTable('cameras', (table) => {
        table.increments('id').primary();
        table.string('name').notNullable();
        table.string('stream_url').notNullable();
        table.string('status').notNullable().defaultTo('offline');
        table.string('type').notNullable();
        table.jsonb('config').notNullable();
        table.timestamp('created_at').defaultTo(knex.fn.now());
        table.timestamp('updated_at').defaultTo(knex.fn.now());
    });
}

export async function down(knex: Knex): Promise<void> {
    return knex.schema.dropTable('cameras');
} 