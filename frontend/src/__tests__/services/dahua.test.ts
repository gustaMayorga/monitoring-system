import { DahuaService } from '../../services/dahua';
import axios from 'axios';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('DahuaService', () => {
    let service: DahuaService;
    const mockConfig = {
        ip: '192.168.1.100',
        port: 80,
        username: 'admin',
        password: 'password123'
    };

    beforeEach(() => {
        service = new DahuaService(
            mockConfig.ip,
            mockConfig.port,
            mockConfig.username,
            mockConfig.password
        );
        jest.clearAllMocks();
    });

    describe('login', () => {
        beforeEach(() => {
            mockedAxios.create.mockReturnValue({
                get: jest.fn().mockResolvedValue({
                    data: {
                        session: 'test-session',
                        realm: 'test-realm',
                        random: 'test-random'
                    }
                }),
                post: jest.fn().mockResolvedValue({
                    data: { session: 'test-session' }
                }),
                interceptors: {
                    request: { use: jest.fn() },
                    response: { use: jest.fn() }
                }
            } as any);
        });

        it('should authenticate successfully', async () => {
            await service['login']();
            expect(service['sessionId']).toBe('test-session');
        });

        it('should handle login errors', async () => {
            const client = mockedAxios.create();
            (client.post as jest.Mock).mockRejectedValueOnce(new Error('Login failed'));

            await expect(service['login']()).rejects.toThrow('Login failed');
        });
    });

    describe('getStream', () => {
        it('should return correct main stream RTSP URL', async () => {
            const url = await service.getStream(1);
            expect(url).toBe(
                `rtsp://${mockConfig.username}:${mockConfig.password}@${mockConfig.ip}:${mockConfig.port}/cam/realmonitor?channel=1&subtype=0`
            );
        });

        it('should return correct sub stream RTSP URL', async () => {
            const url = await service.getStream(1, 'sub');
            expect(url).toBe(
                `rtsp://${mockConfig.username}:${mockConfig.password}@${mockConfig.ip}:${mockConfig.port}/cam/realmonitor?channel=1&subtype=1`
            );
        });
    });

    describe('session management', () => {
        it('should refresh session on 401 error', async () => {
            const client = mockedAxios.create();
            (client.get as jest.Mock)
                .mockRejectedValueOnce({ response: { status: 401 } })
                .mockResolvedValueOnce({ data: { session: 'new-session' } });

            await service.getDeviceInfo();
            expect(service['sessionId']).toBe('new-session');
        });
    });
}); 