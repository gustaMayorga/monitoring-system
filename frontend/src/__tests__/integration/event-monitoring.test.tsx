import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { App } from '../../App';
import { rest } from 'msw';
import { server } from '../../mocks/server';

describe('Monitoreo de Eventos', () => {
    beforeAll(() => {
        localStorage.setItem('token', 'test-token');
    });

    afterEach(() => {
        server.resetHandlers();
    });

    afterAll(() => {
        localStorage.clear();
    });

    it('debe mostrar eventos en tiempo real', async () => {
        // Mock del WebSocket
        const mockWebSocket = {
            send: jest.fn(),
            close: jest.fn(),
            addEventListener: jest.fn(),
            removeEventListener: jest.fn()
        };

        // Mock de la clase WebSocket
        class MockWebSocket extends WebSocket {
            constructor(url: string) {
                super(url);
                Object.assign(this, mockWebSocket);
            }
        }

        global.WebSocket = MockWebSocket as any;

        render(<App />);

        await waitFor(() => {
            expect(screen.getByText(/panel de control/i)).toBeInTheDocument();
        });

        // Simular evento WebSocket
        const handler = mockWebSocket.addEventListener.mock.calls.find(
            call => call[0] === 'message'
        )?.[1];

        if (handler) {
            handler(new MessageEvent('message', {
                data: JSON.stringify({
                    type: 'event',
                    data: {
                        id: 1,
                        type: 'motion',
                        description: 'Movimiento detectado en Cámara 1',
                        timestamp: new Date().toISOString()
                    }
                })
            }));
        }

        await waitFor(() => {
            expect(screen.getByText(/movimiento detectado en cámara 1/i)).toBeInTheDocument();
        });
    });

    it('debe permitir filtrar eventos', async () => {
        render(<App />);

        // Ir a la página de eventos
        const eventsLink = await screen.findByText(/eventos/i);
        userEvent.click(eventsLink);

        // Aplicar filtros
        const filterButton = screen.getByText(/filtrar/i);
        fireEvent.click(filterButton);

        // Seleccionar fecha
        const dateInput = screen.getByLabelText(/fecha inicio/i);
        fireEvent.change(dateInput, { target: { value: '2024-03-01' } });

        // Aplicar filtros
        const applyButton = screen.getByText(/aplicar/i);
        fireEvent.click(applyButton);

        // Verificar que se actualizan los eventos
        await waitFor(() => {
            expect(screen.getByText(/eventos filtrados/i)).toBeInTheDocument();
        });
    });
}); 