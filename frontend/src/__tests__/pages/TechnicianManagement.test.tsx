import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import TechnicianManagement from '../../pages/TechnicianManagement';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import rootReducer from '../../store/reducers';
import { TicketService } from '../../services/ticketService';
import { TechnicianStatus, TechnicianSpecialty } from '../../types/ticket';

jest.mock('../../services/ticketService');
const MockedTicketService = TicketService as jest.MockedClass<typeof TicketService>;

describe('TechnicianManagement', () => {
    const mockTechnicians = [
        {
            id: 1,
            name: 'John Doe',
            email: 'john@example.com',
            phone: '1234567890',
            specialties: ['CCTV', 'Alarms'] as TechnicianSpecialty[],
            status: 'active' as TechnicianStatus
        }
    ];

    const store = configureStore({
        reducer: rootReducer,
        preloadedState: {
            technicians: {
                technicians: mockTechnicians,
                loading: false,
                error: null
            }
        }
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders technician list', () => {
        render(
            <Provider store={store}>
                <TechnicianManagement />
            </Provider>
        );

        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.getByText('john@example.com')).toBeInTheDocument();
    });

    it('handles technician creation', async () => {
        const newTechnician = {
            name: 'Jane Smith',
            email: 'jane@example.com',
            phone: '0987654321',
            specialties: ['CCTV']
        };

        render(
            <Provider store={store}>
                <TechnicianManagement />
            </Provider>
        );

        fireEvent.click(screen.getByText('Nuevo Técnico'));

        const nameInput = screen.getByLabelText('Nombre');
        const emailInput = screen.getByLabelText('Email');
        const phoneInput = screen.getByLabelText('Teléfono');
        const specialtiesSelect = screen.getByLabelText('Especialidades');

        fireEvent.change(nameInput, { target: { value: newTechnician.name } });
        fireEvent.change(emailInput, { target: { value: newTechnician.email } });
        fireEvent.change(phoneInput, { target: { value: newTechnician.phone } });
        fireEvent.change(specialtiesSelect, { target: { value: newTechnician.specialties[0] } });

        fireEvent.click(screen.getByText('Crear'));

        await waitFor(() => {
            expect(screen.getByText('Técnico creado exitosamente')).toBeInTheDocument();
        });
    });

    it('handles technician status updates', async () => {
        render(
            <Provider store={store}>
                <TechnicianManagement />
            </Provider>
        );

        const statusToggle = screen.getByTestId('status-toggle-1');
        fireEvent.click(statusToggle);

        await waitFor(() => {
            expect(screen.getByText('Estado actualizado')).toBeInTheDocument();
        });
    });

    it('displays technician assignments', async () => {
        const mockAssignments = [
            {
                id: 1,
                ticket_id: 1,
                technician_id: 1,
                status: 'pending',
                scheduled_date: new Date().toISOString()
            }
        ];

        MockedTicketService.prototype.getTechnicianAssignments.mockResolvedValue(mockAssignments);

        render(
            <Provider store={store}>
                <TechnicianManagement />
            </Provider>
        );

        const technicianRow = screen.getByText('John Doe');
        fireEvent.click(technicianRow);

        await waitFor(() => {
            expect(screen.getByTestId('assignments-list')).toBeInTheDocument();
            expect(screen.getByText('Ticket #1')).toBeInTheDocument();
        });
    });
}); 