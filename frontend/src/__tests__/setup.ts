import '@testing-library/jest-dom';
import 'whatwg-fetch';
import { server } from './mocks/server';

// Extend expect matchers
expect.extend({
    toHaveBeenCalledOnceWith(received: jest.Mock, ...expected: any[]) {
        const pass = received.mock.calls.length === 1 &&
            JSON.stringify(received.mock.calls[0]) === JSON.stringify(expected);
        
        return {
            pass,
            message: () => pass
                ? `expected ${received.getMockName()} not to have been called once with ${expected}`
                : `expected ${received.getMockName()} to have been called once with ${expected}`
        };
    }
});

// Setup MSW
beforeAll(() => {
    server.listen({ onUnhandledRequest: 'error' });
});

afterEach(() => {
    server.resetHandlers();
    jest.clearAllMocks();
});

afterAll(() => {
    server.close();
});

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation(query => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
    })),
});

// Mock IntersectionObserver
class IntersectionObserver {
    observe = jest.fn();
    disconnect = jest.fn();
    unobserve = jest.fn();
}

Object.defineProperty(window, 'IntersectionObserver', {
    writable: true,
    configurable: true,
    value: IntersectionObserver
});

// Mock ResizeObserver
class ResizeObserver {
    observe = jest.fn();
    disconnect = jest.fn();
    unobserve = jest.fn();
}

Object.defineProperty(window, 'ResizeObserver', {
    writable: true,
    configurable: true,
    value: ResizeObserver
});

// Mock WebRTC
class MockRTCPeerConnection {
    oniceconnectionstatechange: (() => void) | null = null;
    ontrack: ((event: any) => void) | null = null;
    iceConnectionState = 'new';
    
    addTransceiver = jest.fn();
    createOffer = jest.fn().mockResolvedValue({ type: 'offer', sdp: 'test' });
    setLocalDescription = jest.fn();
    close = jest.fn();
    
    static generateCertificate = jest.fn().mockResolvedValue({
        expires: Date.now() + 24 * 60 * 60 * 1000,
        getFingerprints: () => [{ algorithm: 'sha-256', value: 'test' }]
    });
}

Object.defineProperty(window, 'RTCPeerConnection', {
    writable: true,
    configurable: true,
    value: MockRTCPeerConnection
}); 