export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const config = {
  API_URL,
  WS_URL: `ws://${window.location.hostname}:8000`,
  APP_NAME: import.meta.env.VITE_APP_NAME || 'Sistema de Monitoreo',
  VERSION: '1.0.0',
  // Añade aquí más configuraciones según necesites
  STREAM_TYPES: {
    MJPEG: 'multipart/x-mixed-replace',
    HLS: 'application/x-mpegURL',
    RTSP: 'rtsp'
  }
};

export default config;