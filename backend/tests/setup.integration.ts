import { db } from '../src/database';
import { Knex } from 'knex';

export {};

beforeAll(async () => {
    // Asegurarse de que estamos usando la base de datos de pruebas
    const dbName = process.env.DB_NAME || 'monitoring_system_test';
    const currentDb = await db.raw('SELECT current_database()');
    if (currentDb.rows[0].current_database !== dbName) {
        throw new Error(`Wrong database! Expected ${dbName}`);
    }

    // Ejecutar migraciones
    await db.migrate.latest();
});

afterAll(async () => {
    // Limpiar la base de datos
    await db.migrate.rollback().then(() => {
        return db.destroy();
    });
}); 