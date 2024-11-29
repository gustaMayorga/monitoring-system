import knex from 'knex';
import config from './config';

export const db = knex({
    client: config.database.client,
    connection: config.database.connection,
    pool: config.database.pool,
    migrations: config.database.migrations,
    seeds: config.database.seeds
});

export default db; 