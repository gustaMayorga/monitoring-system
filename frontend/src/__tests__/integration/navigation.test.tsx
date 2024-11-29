import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { store } from '../../store';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../../context/AuthContext';
import { ThemeProvider } from '../../context/ThemeContext';
import App from '../../App';
import { loginUser } from '../utils/test-helpers';

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
    <Provider store={store}>
        <AuthProvider>
            <ThemeProvider>
                <BrowserRouter>
                    {children}
                </BrowserRouter>
            </ThemeProvider>
        </AuthProvider>
    </Provider>
);

describe.skip('Navigation', () => {
    jest.setTimeout(10000);

    it('should navigate to different sections', async () => {
        render(<App />, { wrapper: TestWrapper });
        
        await loginUser();

        screen.debug();

        const monitoringLink = screen.getByText(/monitor/i);
        fireEvent.click(monitoringLink);
        
        screen.debug();

        await waitFor(() => {
            const cameraText = screen.queryByText(/cámaras/i) || screen.queryByText(/cameras/i);
            expect(cameraText).toBeInTheDocument();
        }, { timeout: 5000 });
    });
}); 