import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { VideoPlayer } from '../../components/VideoPlayer';
import { CameraAdapter } from '../../services/cameraAdapter';

jest.mock('../../services/cameraAdapter');

describe('VideoPlayer Component', () => {
    const mockCamera = {
        id: 1,
        name: 'Test Camera',
        stream_url: 'rtsp://test/stream',
        status: 'online',
        type: 'hikvision' as const,
        config: {
            ip: '192.168.1.100',
            port: 80,
            username: 'admin',
            password: 'admin123'
        }
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders camera name and status', () => {
        render(<VideoPlayer camera={mockCamera} />);
        
        expect(screen.getByText(mockCamera.name)).toBeInTheDocument();
        expect(screen.getByText('Online')).toBeInTheDocument();
    });

    it('shows loading state while stream is initializing', () => {
        render(<VideoPlayer camera={mockCamera} />);
        
        expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    });

    it('handles stream errors gracefully', () => {
        const errorCamera = { ...mockCamera, status: 'offline' };
        render(<VideoPlayer camera={errorCamera} />);
        
        expect(screen.getByText('Error al cargar video')).toBeInTheDocument();
    });

    it('supports PTZ controls when available', () => {
        render(<VideoPlayer camera={mockCamera} ptzEnabled={true} />);
        
        const upButton = screen.getByTestId('ptz-up');
        fireEvent.click(upButton);
        
        expect(CameraAdapter.prototype.controlPTZ).toHaveBeenCalledWith({
            command: 'up',
            speed: 5,
            channel: mockCamera.id
        });
    });
}); 