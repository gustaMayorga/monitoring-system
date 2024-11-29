import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
    // Tabla de tipos de alarmas
    await knex.schema.createTable('alarm_types', (table) => {
        table.increments('id').primary();
        table.string('code').notNullable().unique(); // Código SIA o CID
        table.string('name').notNullable();
        table.string('description');
        table.string('protocol').notNullable(); // 'SIA' o 'CID'
        table.integer('priority').defaultTo(3); // 1: Alta, 2: Media, 3: Baja
        table.timestamps(true, true);
    });

    // Tabla de alarmas
    await knex.schema.createTable('alarms', (table) => {
        table.increments('id').primary();
        table.integer('alarm_type_id').references('id').inTable('alarm_types');
        table.integer('camera_id').references('id').inTable('cameras');
        table.integer('client_id').references('id').inTable('clients');
        table.timestamp('triggered_at').notNullable();
        table.timestamp('acknowledged_at');
        table.integer('acknowledged_by').references('id').inTable('users');
        table.string('status').defaultTo('pending'); // pending, acknowledged, resolved, false_alarm
        table.text('notes');
        table.json('raw_data');
        table.timestamps(true, true);
    });
}

export async function down(knex: Knex): Promise<void> {
    await knex.schema.dropTable('alarms');
    await knex.schema.dropTable('alarm_types');
} 