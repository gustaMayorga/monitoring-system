export const config = {
    API_URL: import.meta.env.VITE_API_URL || 'http://localhost:3003/api',
    WS_URL: import.meta.env.VITE_WS_URL || 'ws://localhost:3003/ws'
}; 