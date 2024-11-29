import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
    // Guardar las tablas de migraciones
    await knex.raw(`
        CREATE TABLE IF NOT EXISTS knex_migrations_backup AS 
        SELECT * FROM knex_migrations;
        
        CREATE TABLE IF NOT EXISTS knex_migrations_lock_backup AS 
        SELECT * FROM knex_migrations_lock;
    `);

    // Eliminar el esquema
    await knex.raw('DROP SCHEMA public CASCADE');
    await knex.raw('CREATE SCHEMA public');
    await knex.raw('GRANT ALL ON SCHEMA public TO postgres');
    await knex.raw('GRANT ALL ON SCHEMA public TO public');

    // Restaurar las tablas de migraciones
    await knex.raw(`
        CREATE TABLE knex_migrations AS 
        SELECT * FROM knex_migrations_backup;
        
        CREATE TABLE knex_migrations_lock AS 
        SELECT * FROM knex_migrations_lock_backup;
        
        DROP TABLE knex_migrations_backup;
        DROP TABLE knex_migrations_lock_backup;
    `);
}

export async function down(knex: Knex): Promise<void> {
    // No hacer nada en down
} 