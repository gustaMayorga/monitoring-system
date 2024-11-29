import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ServiceTickets from '../../pages/ServiceTickets';
import { TicketService } from '../../services/ticketService';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import rootReducer from '../../store/reducers';
import { ServiceTicket, TicketStatus, TicketPriority } from '../../types/ticket';

jest.mock('../../services/ticketService');
const MockedTicketService = TicketService as jest.MockedClass<typeof TicketService>;

describe('ServiceTickets', () => {
    const mockTickets: ServiceTicket[] = [
        {
            id: 1,
            client_id: 1,
            title: 'Test Ticket',
            description: 'Test Description',
            status: 'pending' as TicketStatus,
            priority: 'high' as TicketPriority,
            created_at: new Date(),
            updated_at: new Date()
        }
    ];

    const store = configureStore({
        reducer: rootReducer,
        preloadedState: {
            tickets: {
                tickets: mockTickets,
                loading: false,
                error: null
            }
        }
    });

    beforeEach(() => {
        MockedTicketService.prototype.getTickets.mockResolvedValue(mockTickets);
    });

    it('renders ticket list', async () => {
        render(
            <Provider store={store}>
                <ServiceTickets />
            </Provider>
        );

        await waitFor(() => {
            expect(screen.getByText('Test Ticket')).toBeInTheDocument();
        });
    });

    it('handles ticket creation', async () => {
        const newTicket = {
            title: 'New Ticket',
            description: 'New Description',
            priority: 'medium',
            client_id: 1
        };

        MockedTicketService.prototype.createTicket.mockResolvedValue({
            ...newTicket,
            id: 2,
            status: 'pending',
            created_at: new Date(),
            updated_at: new Date()
        });

        render(
            <Provider store={store}>
                <ServiceTickets />
            </Provider>
        );

        fireEvent.click(screen.getByText('Nuevo Ticket'));

        const titleInput = screen.getByLabelText('Título');
        const descriptionInput = screen.getByLabelText('Descripción');
        const prioritySelect = screen.getByLabelText('Prioridad');

        fireEvent.change(titleInput, { target: { value: newTicket.title } });
        fireEvent.change(descriptionInput, { target: { value: newTicket.description } });
        fireEvent.change(prioritySelect, { target: { value: newTicket.priority } });

        fireEvent.click(screen.getByText('Crear'));

        await waitFor(() => {
            expect(MockedTicketService.prototype.createTicket).toHaveBeenCalledWith(newTicket);
        });
    });

    it('handles ticket status updates', async () => {
        MockedTicketService.prototype.updateStatus.mockResolvedValue(undefined);

        render(
            <Provider store={store}>
                <ServiceTickets />
            </Provider>
        );

        const ticket = await screen.findByText('Test Ticket');
        fireEvent.click(ticket);

        const statusSelect = screen.getByLabelText('Estado');
        fireEvent.change(statusSelect, { target: { value: 'in_progress' } });

        await waitFor(() => {
            expect(MockedTicketService.prototype.updateStatus).toHaveBeenCalledWith(1, 'in_progress');
        });
    });

    it('handles filtering', async () => {
        render(
            <Provider store={store}>
                <ServiceTickets />
            </Provider>
        );

        const statusFilter = screen.getByTestId('status-filter');
        fireEvent.change(statusFilter, { target: { value: 'pending' } });

        await waitFor(() => {
            expect(MockedTicketService.prototype.getTickets).toHaveBeenCalledWith({
                status: 'pending'
            });
        });
    });

    it('handles errors gracefully', async () => {
        MockedTicketService.prototype.getTickets.mockRejectedValue(new Error('Network error'));

        render(
            <Provider store={store}>
                <ServiceTickets />
            </Provider>
        );

        await waitFor(() => {
            expect(screen.getByText('Error al cargar tickets')).toBeInTheDocument();
        });
    });
}); 