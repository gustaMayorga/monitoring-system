import { render, screen, waitFor } from '@testing-library/react';
import { CameraList } from '../../../components/cameras/CameraList';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import { handlers } from '../../mocks/handlers';
import { AuthProvider } from '../../../context/AuthContext';

const server = setupServer(...handlers);

describe('CameraList Component', () => {
    beforeAll(() => {
        server.listen();
        // Simular token almacenado
        localStorage.setItem('token', 'test-token');
    });
    
    afterEach(() => {
        server.resetHandlers();
        localStorage.clear();
    });
    
    afterAll(() => server.close());

    it('debe mostrar la lista de cámaras', async () => {
        render(<CameraList />);
        
        // Mostrar loading inicialmente
        expect(screen.getByText(/cargando cámaras/i)).toBeInTheDocument();
        
        // Esperar a que se carguen las cámaras
        await waitFor(() => {
            expect(screen.getByText('Camera 1')).toBeInTheDocument();
        });
        
        // Verificar detalles de la cámara
        expect(screen.getByText(/online/i)).toBeInTheDocument();
        expect(screen.getByText(/hikvision/i)).toBeInTheDocument();
        expect(screen.getByText(/rtsp:\/\/test\/1/i)).toBeInTheDocument();
    });

    it('debe mostrar error cuando falla la carga', async () => {
        server.use(
            rest.get('/api/cameras', (req, res, ctx) => {
                return res([
                    ctx.status(500),
                    ctx.json({ message: 'Error del servidor' })
                ]);
            })
        );

        render(<CameraList />);

        await waitFor(() => {
            expect(screen.getByText(/error al cargar las cámaras/i)).toBeInTheDocument();
        });
    });

    it('debe mostrar botones de acción solo para usuarios con permisos', async () => {
        // Mock del hook useAuth para simular un usuario con permisos
        jest.mock('../../../hooks/useAuth', () => ({
            useAuth: () => ({
                user: {
                    id: 1,
                    username: 'admin',
                    permissions: ['write:all']
                }
            })
        }));

        render(<CameraList />);

        await waitFor(() => {
            expect(screen.getByText('Camera 1')).toBeInTheDocument();
            expect(screen.getAllByRole('button')).toHaveLength(2);
            expect(screen.getByText(/editar/i)).toBeInTheDocument();
            expect(screen.getByText(/configurar/i)).toBeInTheDocument();
        });
    });
}); 