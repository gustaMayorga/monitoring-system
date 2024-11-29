import { db } from '../../src/database';
import { Knex } from 'knex';

describe('Database Migrations', () => {
    let knex: Knex;

    beforeAll(async () => {
        knex = db;
        await knex.migrate.latest();
    });

    afterAll(async () => {
        await knex.destroy();
    });

    it('debe crear todas las tablas necesarias', async () => {
        const tables = await knex('information_schema.tables')
            .select('table_name')
            .where({ table_schema: 'public' });

        expect(tables.map(t => t.table_name)).toContain('users');
        expect(tables.map(t => t.table_name)).toContain('cameras');
        expect(tables.map(t => t.table_name)).toContain('events');
    });

    it('debe aplicar las restricciones de clave foránea', async () => {
        const foreignKeys = await knex('information_schema.key_column_usage')
            .select('*')
            .whereRaw("constraint_name LIKE '%fk%'");

        expect(foreignKeys.length).toBeGreaterThan(0);
    });
}); 