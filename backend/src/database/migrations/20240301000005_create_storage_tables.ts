import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
    // Tabla para metadata de grabaciones
    await knex.schema.createTable('recordings', (table) => {
        table.increments('id').primary();
        table.integer('camera_id').notNullable()
            .references('id').inTable('cameras')
            .onDelete('CASCADE');
        table.string('path').notNullable();
        table.timestamp('start_time').notNullable();
        table.timestamp('end_time');
        table.integer('duration');
        table.bigInteger('size').notNullable();
        table.string('format').notNullable();
        table.string('resolution');
        table.integer('fps');
        table.integer('bitrate');
        table.string('codec');
        table.enum('status', ['recording', 'completed', 'failed', 'deleted'])
            .defaultTo('recording');
        table.string('error');
        table.timestamps(true, true);
    });

    // Tabla para políticas de retención
    await knex.schema.createTable('retention_policies', (table) => {
        table.increments('id').primary();
        table.integer('camera_id')
            .references('id').inTable('cameras')
            .onDelete('CASCADE');
        table.integer('days').notNullable();
        table.string('min_quality');
        table.boolean('compress').defaultTo(false);
        table.boolean('delete_after').defaultTo(true);
        table.timestamps(true, true);

        // Una cámara solo puede tener una política
        table.unique(['camera_id']);
    });

    // Tabla para cuotas de almacenamiento
    await knex.schema.createTable('storage_quotas', (table) => {
        table.increments('id').primary();
        table.integer('client_id').notNullable()
            .references('id').inTable('clients')
            .onDelete('CASCADE');
        table.integer('max_size').notNullable(); // en GB
        table.integer('warning_threshold').notNullable(); // porcentaje
        table.enum('action', ['notify', 'stop_recording', 'delete_oldest'])
            .defaultTo('notify');
        table.timestamps(true, true);

        // Un cliente solo puede tener una cuota
        table.unique(['client_id']);
    });
}

export async function down(knex: Knex): Promise<void> {
    await knex.schema.dropTable('storage_quotas');
    await knex.schema.dropTable('retention_policies');
    await knex.schema.dropTable('recordings');
} 