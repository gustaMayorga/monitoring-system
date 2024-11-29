import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
    await knex.schema.createTable('clients', (table) => {
        table.increments('id').primary();
        table.string('name').notNullable();
        table.string('contact_name');
        table.string('email');
        table.string('phone');
        table.string('address');
        table.boolean('active').defaultTo(true);
        table.timestamps(true, true);
    });
}

export async function down(knex: Knex): Promise<void> {
    await knex.schema.dropTable('clients');
} 