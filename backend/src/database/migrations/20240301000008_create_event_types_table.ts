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
}

export async function down(knex: Knex): Promise<void> {
    await knex.schema.dropTable('event_types');
} 