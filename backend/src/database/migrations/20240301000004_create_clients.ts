import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
    await knex.schema.createTable('clients', (table) => {
        table.increments('id').primary();
        table.string('name').notNullable();
        table.string('contact_person');
        table.string('email');
        table.string('phone');
        table.string('address');
        table.string('city');
        table.string('state');
        table.string('zip_code');
        table.string('country');
        table.json('settings').defaultTo('{}');
        table.boolean('active').defaultTo(true);
        table.timestamps(true, true);
    });

    // Relacionar cámaras con clientes
    await knex.schema.alterTable('cameras', (table) => {
        table.integer('client_id').references('id').inTable('clients').onDelete('CASCADE');
    });
}

export async function down(knex: Knex): Promise<void> {
    await knex.schema.alterTable('cameras', (table) => {
        table.dropColumn('client_id');
    });
    await knex.schema.dropTable('clients');
} 