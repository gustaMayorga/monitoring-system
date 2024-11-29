import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Login } from '../../components/Login';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import { handlers } from '../mocks/handlers';

const server = setupServer(...handlers);

describe('Login Component', () => {
    beforeAll(() => server.listen());
    afterEach(() => {
        server.resetHandlers();
        localStorage.clear();
    });
    afterAll(() => server.close());

    it('debe mostrar el formulario de login', () => {
        render(<Login />);
        
        expect(screen.getByLabelText(/usuario/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/contraseña/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /iniciar sesión/i })).toBeInTheDocument();
    });

    it('debe mostrar errores de validación cuando los campos están vacíos', async () => {
        render(<Login />);
        
        const submitButton = screen.getByRole('button', { name: /iniciar sesión/i });
        fireEvent.click(submitButton);

        // Los mensajes de validación del navegador deberían mostrarse
        expect(screen.getByLabelText(/usuario/i)).toBeInvalid();
        expect(screen.getByLabelText(/contraseña/i)).toBeInvalid();
    });

    it('debe mostrar el estado de carga durante el login', async () => {
        // Modificar el handler para agregar delay
        server.use(
            rest.post('/api/auth/login', async (req, res, ctx) => {
                return res([
                    ctx.delay(1000),
                    ctx.json({
                        token: 'test-token',
                        user: {
                            id: 1,
                            username: 'test',
                            role: 'admin',
                            permissions: ['read:all', 'write:all']
                        }
                    })
                ]);
            })
        );

        render(<Login />);
        
        await userEvent.type(screen.getByLabelText(/usuario/i), 'test');
        await userEvent.type(screen.getByLabelText(/contraseña/i), 'password123');
        
        const submitButton = screen.getByRole('button', { name: /iniciar sesión/i });
        fireEvent.click(submitButton);

        // Verificar que el botón muestre estado de carga
        expect(submitButton).toBeDisabled();
        expect(screen.getByText(/cargando/i)).toBeInTheDocument();

        // Esperar a que termine el login
        await waitFor(() => {
            expect(screen.getByText(/inicio de sesión exitoso/i)).toBeInTheDocument();
            expect(submitButton).not.toBeDisabled();
        });
    });

    it('debe persistir el token en localStorage después del login exitoso', async () => {
        render(<Login />);
        
        await userEvent.type(screen.getByLabelText(/usuario/i), 'test');
        await userEvent.type(screen.getByLabelText(/contraseña/i), 'password123');
        
        fireEvent.click(screen.getByRole('button', { name: /iniciar sesión/i }));

        await waitFor(() => {
            expect(localStorage.getItem('token')).toBe('test-token');
        });
    });
}); 