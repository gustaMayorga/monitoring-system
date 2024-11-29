import { db } from '../../src/database';
import { hashPassword } from '../../src/services/auth.service';
import { DbUser } from '../../src/types/user';

export async function createTestUser() {
    const hashedPassword = await hashPassword('test123');
    const [user] = await db<DbUser>('users').insert({
        username: 'testuser',
        password: hashedPassword,
        email: 'test@example.com',
        role: 'admin',
        role_id: 1,
        permissions: ['admin'],
        created_at: new Date(),
        updated_at: new Date()
    }).returning('*');

    return user;
}

export async function cleanupTestUser() {
    await db('users').where({ username: 'testuser' }).delete();
} 