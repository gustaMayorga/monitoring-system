import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
    return knex.schema.createTable('events', (table) => {
        table.increments('id').primary();
        table.string('type').notNullable();
        table.string('description').notNullable();
        table.integer('camera_id').references('id').inTable('cameras').onDelete('CASCADE');
        table.timestamp('timestamp').defaultTo(knex.fn.now());
    });
}

export async function down(knex: Knex): Promise<void> {
    return knex.schema.dropTable('events');
} 