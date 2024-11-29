import { render, screen, waitFor } from '@testing-library/react';
import { Dashboard } from '../../../components/dashboard/Dashboard';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import { handlers } from '../../mocks/handlers';
import { AuthProvider } from '../../../context/AuthContext';

const server = setupServer(...handlers);

const renderWithAuth = (component: React.ReactElement) => {
    return render(
        <AuthProvider>
            {component}
        </AuthProvider>
    );
};

describe('Dashboard Component', () => {
    beforeAll(() => {
        server.listen();
        localStorage.setItem('token', 'test-token');
    });

    afterEach(() => {
        server.resetHandlers();
        localStorage.clear();
    });

    afterAll(() => server.close());

    it('debe mostrar el estado del sistema', async () => {
        renderWithAuth(<Dashboard />);

        // Verificar loading state
        expect(screen.getByText(/cargando dashboard/i)).toBeInTheDocument();

        // Esperar a que se carguen los datos
        await waitFor(() => {
            expect(screen.getByText('10')).toBeInTheDocument(); // Total cámaras
            expect(screen.getByText('8')).toBeInTheDocument();  // Cámaras online
            expect(screen.getByText('2')).toBeInTheDocument();  // Cámaras offline
        });
    });

    it('debe mostrar eventos recientes', async () => {
        renderWithAuth(<Dashboard />);

        await waitFor(() => {
            expect(screen.getByText(/cámara 3 se desconectó/i)).toBeInTheDocument();
            expect(screen.getByText(/movimiento detectado/i)).toBeInTheDocument();
        });
    });

    it('debe mostrar error cuando falla la carga', async () => {
        server.use(
            rest.get('/api/system/status', (req, res, ctx) => {
                return res([
                    ctx.status(500),
                    ctx.json({ message: 'Error del servidor' })
                ]);
            })
        );

        renderWithAuth(<Dashboard />);

        await waitFor(() => {
            expect(screen.getByText(/error al cargar datos del dashboard/i)).toBeInTheDocument();
        });
    });

    it('debe actualizar los datos periódicamente', async () => {
        jest.useFakeTimers();
        
        let requestCount = 0;
        server.use(
            rest.get('/api/system/status', (req, res, ctx) => {
                requestCount++;
                return res([
                    ctx.json({
                        totalCameras: 10 + requestCount,
                        onlineCameras: 8,
                        offlineCameras: 2 + requestCount,
                        lastUpdate: new Date().toISOString()
                    })
                ]);
            })
        );

        renderWithAuth(<Dashboard />);

        // Verificar carga inicial
        await waitFor(() => {
            expect(screen.getByText('11')).toBeInTheDocument(); // 10 + 1
        });

        // Avanzar 30 segundos
        jest.advanceTimersByTime(30000);

        // Verificar actualización
        await waitFor(() => {
            expect(screen.getByText('12')).toBeInTheDocument(); // 10 + 2
        });

        jest.useRealTimers();
    });
}); 