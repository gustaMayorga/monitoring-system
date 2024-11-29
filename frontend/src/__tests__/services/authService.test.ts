import { authService } from '../../services/authService';
import axiosInstance from '../../utils/axios';

jest.mock('../../utils/axios', () => ({
    post: jest.fn()
}));

describe('authService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('login calls correct endpoint with credentials', async () => {
        const mockResponse = { data: { token: 'test-token' } };
        (axiosInstance.post as jest.Mock).mockResolvedValueOnce(mockResponse);

        const credentials = { username: 'test', password: 'test123' };
        await authService.login(credentials);

        expect(axiosInstance.post).toHaveBeenCalledWith(
            '/auth/login',
            credentials
        );
    });
}); 