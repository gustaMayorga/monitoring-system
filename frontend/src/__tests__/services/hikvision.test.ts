import { HikvisionService } from '../../services/hikvision';
import axios from 'axios';
import { digestAuth } from '../../utils/digestAuth';

jest.mock('axios');
jest.mock('../../utils/digestAuth');

const mockedAxios = axios as jest.Mocked<typeof axios>;
const mockedDigestAuth = digestAuth as jest.MockedFunction<typeof digestAuth>;

describe('HikvisionService', () => {
    let service: HikvisionService;
    const config = {
        ip: '192.168.1.100',
        port: 80,
        username: 'admin',
        password: 'admin123'
    };

    beforeEach(() => {
        service = new HikvisionService(
            config.ip,
            config.port,
            config.username,
            config.password
        );
        jest.clearAllMocks();
        
        mockedDigestAuth.mockResolvedValue({
            Authorization: 'Digest xyz',
            'Content-Type': 'application/json'
        });
    });

    describe('getStream', () => {
        it('returns correct RTSP URL for main stream', async () => {
            mockedAxios.mockResolvedValueOnce({ data: {} });
            
            const url = await service.getStream(1);
            
            expect(url).toBe(
                `rtsp://${config.username}:${config.password}@${config.ip}:${config.port}/ISAPI/Streaming/channels/101`
            );
        });

        it('returns correct RTSP URL for sub stream', async () => {
            mockedAxios.mockResolvedValueOnce({ data: {} });
            
            const url = await service.getStream(1, 'sub');
            
            expect(url).toBe(
                `rtsp://${config.username}:${config.password}@${config.ip}:${config.port}/ISAPI/Streaming/channels/102`
            );
        });
    });

    describe('controlPTZ', () => {
        it('sends correct PTZ commands', async () => {
            mockedAxios.mockResolvedValueOnce({ data: {} });
            
            await service.controlPTZ({
                command: 'up',
                speed: 5,
                channel: 1
            });
            
            expect(mockedAxios).toHaveBeenCalledWith(expect.objectContaining({
                method: 'PUT',
                url: `http://${config.ip}:${config.port}/ISAPI/PTZCtrl/channels/1/continuous`,
                data: {
                    PTZData: {
                        pan: 0,
                        tilt: 5,
                        zoom: 0
                    }
                }
            }));
        });
    });

    // ... más pruebas ...
}); 