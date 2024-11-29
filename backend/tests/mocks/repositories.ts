import { User } from '../../src/repositories/user.repository';

export const mockUserRepository = () => ({
    findByUsername: jest.fn(),
    findById: jest.fn(),
    create: jest.fn()
});

export const mockUser: User = {
    id: 1,
    username: 'testuser',
    password: '$2b$10$abcdefghijklmnopqrstuvwxyz',
    role: 'user',
    permissions: ['read:all']
}; 