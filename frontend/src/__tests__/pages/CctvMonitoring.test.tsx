import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import CctvMonitoring from '../../pages/CctvMonitoring';
import { CameraService } from '../../services/cameraService';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import rootReducer from '../../store/reducers';
import { Camera } from '../../types/camera';

jest.mock('../../services/cameraService');
const MockedCameraService = CameraService as jest.MockedClass<typeof CameraService>;

describe('CctvMonitoring', () => {
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

    const store = configureStore({
        reducer: rootReducer,
        preloadedState: {
            cameras: {
                cameras: mockCameras,
                selectedCamera: null,
                loading: false,
                error: null
            }
        }
    });

    beforeEach(() => {
        MockedCameraService.prototype.getCameras.mockResolvedValue(mockCameras);
    });

    it('renders camera grid', async () => {
        render(
            <Provider store={store}>
                <CctvMonitoring />
            </Provider>
        );

        await waitFor(() => {
            expect(screen.getByText('Camera 1')).toBeInTheDocument();
        });
    });

    it('handles layout changes', async () => {
        render(
            <Provider store={store}>
                <CctvMonitoring />
            </Provider>
        );

        const layoutButton = screen.getByTestId('layout-2x2');
        fireEvent.click(layoutButton);

        expect(screen.getByTestId('camera-grid')).toHaveStyle({
            gridTemplateColumns: 'repeat(2, 1fr)',
            gridTemplateRows: 'repeat(2, 1fr)'
        });
    });

    it('handles camera selection', async () => {
        render(
            <Provider store={store}>
                <CctvMonitoring />
            </Provider>
        );

        const cameraElement = await screen.findByText('Camera 1');
        fireEvent.click(cameraElement);

        expect(screen.getByTestId('selected-camera')).toHaveTextContent('Camera 1');
        expect(screen.getByTestId('ptz-controls')).toBeInTheDocument();
    });

    it('handles recording controls', async () => {
        MockedCameraService.prototype.startRecording.mockResolvedValue(undefined);
        
        render(
            <Provider store={store}>
                <CctvMonitoring />
            </Provider>
        );

        const cameraElement = await screen.findByText('Camera 1');
        fireEvent.click(cameraElement);

        const recordButton = screen.getByTestId('record-button');
        fireEvent.click(recordButton);

        expect(MockedCameraService.prototype.startRecording).toHaveBeenCalledWith(1);
        expect(recordButton).toHaveClass('recording');
    });

    it('handles errors gracefully', async () => {
        MockedCameraService.prototype.getCameras.mockRejectedValue(new Error('Network error'));

        render(
            <Provider store={store}>
                <CctvMonitoring />
            </Provider>
        );

        await waitFor(() => {
            expect(screen.getByText('Error al cargar cámaras')).toBeInTheDocument();
        });
    });
}); 