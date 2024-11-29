import { Knex } from 'knex';
import bcrypt from 'bcrypt';

export async function seed(knex: Knex): Promise<void> {
    // Limpiar la tabla users
    await knex('users').del();

    // Crear un usuario de prueba
    const hashedPassword = await bcrypt.hash('test123', 10);
    await knex('users').insert([
        {
            username: 'admin',
            password: hashedPassword,
            role: 'admin',
            permissions: ['read:all', 'write:all']
        }
    ]);
} 