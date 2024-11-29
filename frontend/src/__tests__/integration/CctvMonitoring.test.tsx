import { render, screen, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { store } from '../../store';
import CctvMonitoring from '../../pages/CctvMonitoring';

jest.mock('../../utils/axios', () => ({
    get: jest.fn().mockResolvedValue({
        data: [{
            id: 1,
            name: 'Test Camera',
            stream_url: 'rtsp://test',
            status: 'online',
            type: 'hikvision'
        }]
    })
}));

describe('CCTV Monitoring', () => {
    it('should show camera feed', async () => {
        render(
            <Provider store={store}>
                <CctvMonitoring />
            </Provider>
        );

        await waitFor(() => {
            expect(screen.getByText('Test Camera')).toBeInTheDocument();
        });
    });
}); 