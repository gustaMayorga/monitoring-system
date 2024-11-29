import { db } from '../database';
import { User, DbUser } from '../types/user';

export class UserRepository {
    async findByUsername(username: string): Promise<User | undefined> {
        return db<DbUser>('users').where({ username }).first();
    }

    async findById(id: number): Promise<User | undefined> {
        return db<DbUser>('users').where({ id }).first();
    }

    async create(userData: Omit<DbUser, 'id'>): Promise<User> {
        const [user] = await db<DbUser>('users')
            .insert(userData)
            .returning('*');
        return user;
    }

    async delete(id: number): Promise<void> {
        await db<DbUser>('users').where({ id }).delete();
    }

    async deleteByUsername(username: string): Promise<void> {
        await db<DbUser>('users').where({ username }).delete();
    }

    async findByClientId(clientId: number): Promise<User[]> {
        return db<DbUser>('users')
            .join('user_clients', 'users.id', 'user_clients.user_id')
            .where('user_clients.client_id', clientId)
            .select('users.*');
    }
} 