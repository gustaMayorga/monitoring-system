import config from './src/config';
import type { Knex } from 'knex';

const knexConfig: Knex.Config = {
    client: config.database.client,
    connection: config.database.connection,
    pool: config.database.pool,
    migrations: config.database.migrations,
    seeds: config.database.seeds
};

export default knexConfig; 