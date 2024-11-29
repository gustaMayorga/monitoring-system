import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
    await knex.schema.createTable('event_types', (table) => {
        table.increments('id').primary();
        table.string('name').notNullable();
        table.string('description');
        table.enum('severity', ['info', 'warning', 'error', 'critical']).notNullable();
        table.string('icon');
        table.string('color');
        table.timestamps(true, true);
    });

    await knex.schema.createTable('events', (table) => {
        table.increments('id').primary();
        table.integer('event_type_id').unsigned().notNullable()
            .references('id').inTable('event_types')
            .onDelete('CASCADE');
        table.integer('camera_id').unsigned().notNullable()
            .references('id').inTable('cameras')
            .onDelete('CASCADE');
        table.integer('client_id').unsigned().notNullable()
            .references('id').inTable('clients')
            .onDelete('CASCADE');
        table.timestamp('occurred_at').notNullable();
        table.timestamp('processed_at');
        table.enum('status', ['pending', 'processing', 'processed', 'failed']).notNullable().defaultTo('pending');
        table.jsonb('metadata');
        table.text('notes');
        table.timestamps(true, true);
    });

    await knex.schema.createTable('event_attachments', (table) => {
        table.increments('id').primary();
        table.integer('event_id').unsigned().notNullable()
            .references('id').inTable('events')
            .onDelete('CASCADE');
        table.enum('type', ['image', 'video', 'json']).notNullable();
        table.string('url').notNullable();
        table.string('thumbnail_url');
        table.jsonb('metadata');
        table.timestamps(true, true);
    });
}

export async function down(knex: Knex): Promise<void> {
    await knex.schema.dropTable('event_attachments');
    await knex.schema.dropTable('events');
    await knex.schema.dropTable('event_types');
} 