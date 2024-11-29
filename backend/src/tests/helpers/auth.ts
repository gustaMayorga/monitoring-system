import { db } from '../../database';
import { hashPassword } from '../../services/auth.service';
import { DbUser } from '../../types/user';

export async function createTestUser() {
    const hashedPassword = await hashPassword('test123');
    const [user] = await db<DbUser>('users').insert({
        username: 'testuser',
        password: hashedPassword,
        role: 'admin',
        role_id: 1,
        permissions: ['admin'],
        created_at: new Date(),
        updated_at: new Date()
    }).returning('*');

    return user;
}

export async function cleanupTestUser(): Promise<void> {
    await db<DbUser>('users').where({ username: 'testuser' }).delete();
} 