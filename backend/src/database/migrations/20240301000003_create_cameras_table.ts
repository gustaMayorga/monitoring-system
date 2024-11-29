import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
    await knex.schema.createTable('cameras', (table) => {
        table.increments('id').primary();
        table.string('name').notNullable();
        table.string('location').notNullable();
        table.string('ip_address').notNullable();
        table.integer('port').notNullable();
        table.string('username');
        table.string('password');
        table.string('stream_url').notNullable();
        table.enum('status', ['active', 'inactive', 'error']).defaultTo('inactive');
        table.jsonb('settings').defaultTo('{}');
        table.integer('client_id').unsigned().notNullable()
            .references('id').inTable('clients')
            .onDelete('CASCADE');
        table.timestamps(true, true);
    });
}

export async function down(knex: Knex): Promise<void> {
    await knex.schema.dropTable('cameras');
} 