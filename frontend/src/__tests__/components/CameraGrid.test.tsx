import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { CameraGrid } from '../../components/CameraGrid';

describe('CameraGrid Component', () => {
    const mockCameras: Camera[] = [
        {
            id: 1,
            name: 'Camera 1',
            stream_url: 'rtsp://test/1',
            status: 'online',
            type: 'hikvision',
            config: {
                ip: '192.168.1.100',
                port: 80,
                username: 'admin',
                password: 'admin123'
            }
        }
    ];

    it('renders correct number of cameras', () => {
        render(<CameraGrid cameras={mockCameras} layout={{ rows: 2, cols: 2 }} />);
        
        const videoPlayers = screen.getAllByTestId('video-player');
        expect(videoPlayers).toHaveLength(mockCameras.length);
    });

    it('handles layout changes', () => {
        const { rerender } = render(
            <CameraGrid cameras={mockCameras} layout={{ rows: 2, cols: 2 }} />
        );

        // Cambiar a layout 1x1
        rerender(<CameraGrid cameras={mockCameras} layout={{ rows: 1, cols: 1 }} />);
        
        const videoPlayers = screen.getAllByTestId('video-player');
        expect(videoPlayers).toHaveLength(1);
    });

    it('supports camera selection', () => {
        const onSelect = jest.fn();
        render(
            <CameraGrid 
                cameras={mockCameras} 
                layout={{ rows: 2, cols: 2 }}
                onCameraSelect={onSelect}
            />
        );

        const firstCamera = screen.getByText('Camera 1');
        fireEvent.click(firstCamera);

        expect(onSelect).toHaveBeenCalledWith(mockCameras[0]);
    });
}); 