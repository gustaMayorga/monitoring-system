import '@testing-library/jest-dom';
import { server } from './mocks/server';

// Mock WebRTC
class MockRTCPeerConnection {
    static generateCertificate() {
        return Promise.resolve({});
    }
    addTransceiver = jest.fn();
    createOffer = jest.fn().mockResolvedValue({ type: 'offer', sdp: 'test' });
    setLocalDescription = jest.fn();
    close = jest.fn();
}

global.RTCPeerConnection = MockRTCPeerConnection as any;

beforeAll(() => {
    process.env.VITE_API_URL = 'http://localhost:3000';
    Object.defineProperty(window, 'location', {
        value: {
            origin: 'http://localhost:3000'
        }
    });
    server.listen({ onUnhandledRequest: 'bypass' });
});

afterEach(() => {
    server.resetHandlers();
});

afterAll(() => {
    server.close();
});

// Extend expect matchers
declare global {
    namespace jest {
        interface Matchers<R> {
            toHaveBeenCalledOnceWith(...args: any[]): R;
        }
    }
} 