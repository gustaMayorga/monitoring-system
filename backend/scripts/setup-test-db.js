const { execSync } = require('child_process');
const dotenv = require('dotenv');
const path = require('path');

// Cargar variables de entorno de prueba
dotenv.config({ path: path.resolve(__dirname, '..', '.env.test') });

async function setupTestDb() {
    try {
        process.env.PGPASSWORD = process.env.DB_PASSWORD;

        console.log('Configurando base de datos de pruebas...');
        console.log(`Usuario: ${process.env.DB_USER}`);
        console.log(`Base de datos: ${process.env.DB_NAME}`);

        try {
            // Eliminar la base de datos si existe
            execSync(
                `dropdb -U ${process.env.DB_USER} -h ${process.env.DB_HOST} --if-exists ${process.env.DB_NAME}`,
                { stdio: 'inherit' }
            );
            console.log('Base de datos anterior eliminada (si existía)');
        } catch (error) {
            console.log('No se pudo eliminar la base de datos (puede que no exista)');
        }

        try {
            // Crear la nueva base de datos
            execSync(
                `createdb -U ${process.env.DB_USER} -h ${process.env.DB_HOST} ${process.env.DB_NAME}`,
                { stdio: 'inherit' }
            );
            console.log('Base de datos de pruebas creada exitosamente');
        } catch (error) {
            console.error('Error al crear la base de datos:', error.message);
            process.exit(1);
        }

        // Ejecutar migraciones
        console.log('Ejecutando migraciones...');
        execSync('npm run migrate:test', { stdio: 'inherit' });
        console.log('Migraciones ejecutadas exitosamente');

    } catch (error) {
        console.error('Error configurando la base de datos de pruebas:', error);
        process.exit(1);
    }
}

setupTestDb(); 