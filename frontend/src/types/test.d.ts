declare namespace jest {
    interface Matchers<R> {
        toHaveBeenCalledOnceWith(...args: any[]): R;
    }
}

interface Window {
    RTCPeerConnection: typeof RTCPeerConnection;
    MediaStream: typeof MediaStream;
    IntersectionObserver: typeof IntersectionObserver;
    ResizeObserver: typeof ResizeObserver;
}

declare module '*.jpg';
declare module '*.jpeg';
declare module '*.png';
declare module '*.gif';
declare module '*.svg';
declare module '*.webp'; 