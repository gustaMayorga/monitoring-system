import { renderHook, act } from '@testing-library/react-hooks';
import { useVideoStream } from '../../hooks/useVideoStream';

describe('useVideoStream Hook', () => {
    const mockStreamUrl = 'rtsp://test/stream';

    beforeEach(() => {
        // Mock WebRTC APIs
        global.RTCPeerConnection = jest.fn().mockImplementation(() => ({
            addTransceiver: jest.fn(),
            createOffer: jest.fn().mockResolvedValue({ type: 'offer', sdp: 'test' }),
            setLocalDescription: jest.fn(),
            setRemoteDescription: jest.fn(),
            addEventListener: jest.fn()
        }));
    });

    it('initializes stream correctly', async () => {
        const { result } = renderHook(() => useVideoStream(mockStreamUrl));

        expect(result.current.loading).toBe(true);
        expect(result.current.error).toBe(null);

        // Esperar a que se inicialice el stream
        await act(async () => {
            await new Promise(resolve => setTimeout(resolve, 100));
        });

        expect(result.current.loading).toBe(false);
    });

    it('handles stream errors', async () => {
        // Simular error en WebRTC
        global.RTCPeerConnection = jest.fn().mockImplementation(() => {
            throw new Error('WebRTC error');
        });

        const { result } = renderHook(() => useVideoStream(mockStreamUrl));

        await act(async () => {
            await new Promise(resolve => setTimeout(resolve, 100));
        });

        expect(result.current.error).toBeTruthy();
    });

    it('cleans up on unmount', () => {
        const mockClose = jest.fn();
        global.RTCPeerConnection = jest.fn().mockImplementation(() => ({
            close: mockClose,
            addTransceiver: jest.fn(),
            createOffer: jest.fn().mockResolvedValue({ type: 'offer', sdp: 'test' }),
            setLocalDescription: jest.fn(),
            setRemoteDescription: jest.fn(),
            addEventListener: jest.fn()
        }));

        const { unmount } = renderHook(() => useVideoStream(mockStreamUrl));
        unmount();

        expect(mockClose).toHaveBeenCalled();
    });
}); 