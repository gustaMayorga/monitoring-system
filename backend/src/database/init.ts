import { config } from '../config';
import knex from 'knex';

async function initDatabase() {
    // Conectar como superusuario
    const db = knex({
        client: 'pg',
        connection: {
            host: config.db.connection.host,
            port: config.db.connection.port,
            user: 'postgres',
            password: 'postgres', // La contraseña que configuraste para postgres
            database: 'postgres'
        }
    });

    try {
        // Verificar si la base de datos existe
        const exists = await db.raw(`
            SELECT 1 FROM pg_database WHERE datname = ?;
        `, [config.db.connection.database]);

        if (exists.rows.length === 0) {
            // Crear la base de datos
            await db.raw(`CREATE DATABASE ??`, [config.db.connection.database]);
            console.log(`Base de datos ${config.db.connection.database} creada.`);
        }

        // Crear el usuario si no existe y asignar permisos
        await db.raw(`
            DO $$
            BEGIN
                IF NOT EXISTS (SELECT FROM pg_user WHERE usename = '${config.db.connection.user}') THEN
                    CREATE USER ${config.db.connection.user} WITH PASSWORD '${config.db.connection.password}';
                    ALTER USER ${config.db.connection.user} WITH SUPERUSER;
                END IF;
            END
            $$;
        `);

        // Asignar permisos
        await db.raw(`GRANT ALL PRIVILEGES ON DATABASE ?? TO ??`, 
            [config.db.connection.database, config.db.connection.user]);

        // Conectar a la nueva base de datos para crear el schema
        const newDb = knex({
            client: 'pg',
            connection: {
                host: config.db.connection.host,
                port: config.db.connection.port,
                user: config.db.connection.user,
                password: config.db.connection.password,
                database: config.db.connection.database
            }
        });

        // Crear el schema public si no existe
        await newDb.raw(`
            CREATE SCHEMA IF NOT EXISTS public;
            GRANT ALL ON SCHEMA public TO ${config.db.connection.user};
            GRANT ALL ON ALL TABLES IN SCHEMA public TO ${config.db.connection.user};
            ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO ${config.db.connection.user};
        `);

        await newDb.destroy();

    } catch (error) {
        console.error('Error al inicializar la base de datos:', error);
        throw error;
    } finally {
        await db.destroy();
    }
}

initDatabase()
    .then(() => {
        console.log('Inicialización completada');
        process.exit(0);
    })
    .catch(error => {
        console.error('Error:', error);
        process.exit(1);
    }); 