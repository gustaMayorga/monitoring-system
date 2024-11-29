import { CameraAdapter } from '../../services/cameraAdapter';
import { HikvisionService } from '../../services/hikvision';
import { DahuaService } from '../../services/dahua';

jest.mock('../../services/hikvision');
jest.mock('../../services/dahua');

describe('CameraAdapter', () => {
    const mockConfig = {
        ip: '192.168.1.100',
        port: 80,
        username: 'admin',
        password: 'password123',
        type: 'hikvision' as const
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('initialization', () => {
        it('should create correct service based on type', () => {
            new CameraAdapter(mockConfig);
            expect(HikvisionService).toHaveBeenCalledWith(
                mockConfig.ip,
                mockConfig.port,
                mockConfig.username,
                mockConfig.password
            );

            new CameraAdapter({ ...mockConfig, type: 'dahua' });
            expect(DahuaService).toHaveBeenCalledWith(
                mockConfig.ip,
                mockConfig.port,
                mockConfig.username,
                mockConfig.password
            );
        });
    });

    describe('stream operations', () => {
        it('should get stream URL correctly', async () => {
            const adapter = new CameraAdapter(mockConfig);
            await adapter.getStream({ channel: 1 });
            expect(HikvisionService.prototype.getStream).toHaveBeenCalledWith(1, 'main');
        });

        it('should handle stream type parameter', async () => {
            const adapter = new CameraAdapter(mockConfig);
            await adapter.getStream({ channel: 1, streamType: 'sub' });
            expect(HikvisionService.prototype.getStream).toHaveBeenCalledWith(1, 'sub');
        });
    });

    describe('PTZ operations', () => {
        it('should control PTZ correctly', async () => {
            const adapter = new CameraAdapter(mockConfig);
            const ptzParams = {
                command: 'left' as const,
                speed: 5,
                channel: 1
            };

            await adapter.controlPTZ(ptzParams);
            expect(HikvisionService.prototype.controlPTZ).toHaveBeenCalledWith(ptzParams);
        });

        it('should handle PTZ errors', async () => {
            const adapter = new CameraAdapter(mockConfig);
            const error = new Error('PTZ error');
            
            (HikvisionService.prototype.controlPTZ as jest.Mock).mockRejectedValueOnce(error);
            
            await expect(adapter.controlPTZ({
                command: 'left',
                speed: 5,
                channel: 1
            })).rejects.toThrow('PTZ error');
        });
    });

    describe('snapshot operations', () => {
        it('should get snapshot correctly', async () => {
            const adapter = new CameraAdapter(mockConfig);
            const mockBlob = new Blob(['test'], { type: 'image/jpeg' });
            
            (HikvisionService.prototype.getSnapshot as jest.Mock).mockResolvedValueOnce(mockBlob);
            
            const result = await adapter.getSnapshot(1);
            expect(result).toBe(mockBlob);
            expect(HikvisionService.prototype.getSnapshot).toHaveBeenCalledWith(1);
        });
    });
}); 