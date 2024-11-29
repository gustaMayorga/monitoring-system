import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Login } from '../../../components/auth/Login';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
import { handlers } from '../../mocks/handlers';
import { AuthProvider } from '../../../context/AuthContext';
import { BrowserRouter } from 'react-router-dom';

const server = setupServer(...handlers);

const renderWithProviders = (component: React.ReactElement) => {
    return render(
        <BrowserRouter>
            <AuthProvider>
                {component}
            </AuthProvider>
        </BrowserRouter>
    );
};

describe('Login Component', () => {
    beforeAll(() => server.listen());
    afterEach(() => {
        server.resetHandlers();
        localStorage.clear();
    });
    afterAll(() => server.close());

    it('debe mostrar el formulario de login', () => {
        renderWithProviders(<Login />);
        
        expect(screen.getByLabelText(/usuario/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/contraseña/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /iniciar sesión/i })).toBeInTheDocument();
    });

    // ... resto de las pruebas ...
}); 