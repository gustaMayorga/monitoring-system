import { CameraService } from '../../services/cameraService';
import axios from 'axios';
import { Camera } from '../../types/camera';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('CameraService', () => {
    let service: CameraService;
    const mockCamera: Camera = {
        id: 1,
        name: 'Test Camera',
        stream_url: 'rtsp://test/1',
        status: 'online',
        type: 'hikvision',
        config: {
            ip: '192.168.1.100',
            port: 80,
            username: 'admin',
            password: 'admin123'
        }
    };

    beforeEach(() => {
        service = new CameraService();
        jest.clearAllMocks();
    });

    describe('getCameras', () => {
        it('should fetch all cameras', async () => {
            mockedAxios.get.mockResolvedValueOnce({ data: { data: [mockCamera] } });
            const cameras = await service.getCameras();
            expect(cameras).toEqual([mockCamera]);
            expect(mockedAxios.get).toHaveBeenCalledWith('/api/cameras');
        });

        it('should handle errors', async () => {
            const error = new Error('Network error');
            mockedAxios.get.mockRejectedValueOnce(error);
            await expect(service.getCameras()).rejects.toThrow('Network error');
        });
    });

    describe('testConnection', () => {
        it('should return true for successful connection', async () => {
            mockedAxios.get.mockResolvedValueOnce({ data: { success: true } });
            const result = await service.testConnection(mockCamera);
            expect(result).toBe(true);
        });

        it('should return false for failed connection', async () => {
            mockedAxios.get.mockRejectedValueOnce(new Error('Connection failed'));
            const result = await service.testConnection(mockCamera);
            expect(result).toBe(false);
        });
    });

    describe('recording operations', () => {
        it('should start recording', async () => {
            mockedAxios.post.mockResolvedValueOnce({ data: { success: true } });
            await service.startRecording(1);
            expect(mockedAxios.post).toHaveBeenCalledWith('/api/cameras/1/recording/start');
        });

        it('should stop recording', async () => {
            mockedAxios.post.mockResolvedValueOnce({ data: { success: true } });
            await service.stopRecording(1);
            expect(mockedAxios.post).toHaveBeenCalledWith('/api/cameras/1/recording/stop');
        });

        it('should fetch recordings', async () => {
            const startDate = new Date('2024-01-01');
            const endDate = new Date('2024-01-02');
            const mockRecordings = [{ id: 1, start_time: startDate.toISOString() }];

            mockedAxios.get.mockResolvedValueOnce({ data: { data: mockRecordings } });
            const recordings = await service.getRecordings(1, startDate, endDate);

            expect(recordings).toEqual(mockRecordings);
            expect(mockedAxios.get).toHaveBeenCalledWith(
                '/api/cameras/1/recordings',
                {
                    params: {
                        start_date: startDate.toISOString(),
                        end_date: endDate.toISOString()
                    }
                }
            );
        });
    });
}); 