import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
    await knex.schema.createTable('event_types', (table) => {
        table.increments('id').primary();
        table.string('name').notNullable();
        table.string('description');
        table.string('severity').notNullable(); // info, warning, error, critical
        table.string('icon').notNullable();
        table.string('color').notNullable();
        table.timestamps(true, true);
    });

    await knex.schema.createTable('events', (table) => {
        table.increments('id').primary();
        table.integer('event_type_id').references('id').inTable('event_types').onDelete('CASCADE');
        table.integer('camera_id').references('id').inTable('cameras').onDelete('CASCADE');
        table.integer('client_id').references('id').inTable('clients').onDelete('CASCADE');
        table.timestamp('occurred_at').notNullable();
        table.timestamp('processed_at');
        table.string('status').defaultTo('pending'); // pending, processing, processed, failed
        table.json('metadata');
        table.text('notes');
        table.timestamps(true, true);
    });

    await knex.schema.createTable('event_attachments', (table) => {
        table.increments('id').primary();
        table.integer('event_id').references('id').inTable('events').onDelete('CASCADE');
        table.string('type').notNullable(); // image, video, json
        table.string('url').notNullable();
        table.string('thumbnail_url');
        table.json('metadata');
        table.timestamps(true, true);
    });
}

export async function down(knex: Knex): Promise<void> {
    await knex.schema.dropTable('event_attachments');
    await knex.schema.dropTable('events');
    await knex.schema.dropTable('event_types');
} 