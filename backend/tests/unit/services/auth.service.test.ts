import { AuthService, hashPassword } from '../../../src/services/auth.service';
import { UserRepository } from '../../../src/repositories/user.repository';
import { mockUserRepository } from '../../mocks/repositories';

describe('AuthService', () => {
    let authService: AuthService;
    let userRepository: jest.Mocked<UserRepository>;

    beforeEach(() => {
        userRepository = mockUserRepository();
        authService = new AuthService(userRepository);
    });

    it('debe validar credenciales correctamente', async () => {
        const credentials = {
            username: 'test',
            password: 'test123'
        };

        const hashedPassword = await hashPassword('test123');
        userRepository.findByUsername.mockResolvedValue({
            id: 1,
            username: 'test',
            password: hashedPassword,
            role: 'admin',
            created_at: new Date()
        });

        const result = await authService.validateCredentials(credentials);
        expect(result).toBeTruthy();
    });

    it('debe generar un token válido', () => {
        const userId = 1;
        const token = authService.generateToken(userId);
        expect(token).toBeTruthy();
        expect(typeof token).toBe('string');
    });
}); 