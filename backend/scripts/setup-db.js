const { execSync } = require('child_process');
const dotenv = require('dotenv');
const path = require('path');

// Cargar variables de entorno según el entorno
const envFile = process.env.NODE_ENV === 'test' ? '.env.test' : '.env';
dotenv.config({ path: path.resolve(__dirname, '..', envFile) });

const setupDatabase = () => {
    try {
        // Crear base de datos si no existe
        const createDbCommand = `psql -U ${process.env.DB_USER} -h ${process.env.DB_HOST} -c "CREATE DATABASE ${process.env.DB_NAME};"`;
        execSync(createDbCommand, { stdio: 'inherit' });
    } catch (error) {
        console.log('La base de datos ya existe o hubo un error al crearla');
    }

    // Ejecutar migraciones
    execSync('npm run migrate', { stdio: 'inherit' });
    
    // Ejecutar seeds
    execSync('npm run seed', { stdio: 'inherit' });
};

setupDatabase(); 