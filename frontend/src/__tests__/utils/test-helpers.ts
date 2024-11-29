import { screen, fireEvent, waitFor } from '@testing-library/react';

export const loginUser = async () => {
    const usernameInput = screen.getByLabelText(/usuario/i);
    const passwordInput = screen.getByLabelText(/contraseña/i);
    const submitButton = screen.getByRole('button', { name: /iniciar sesión/i });

    fireEvent.change(usernameInput, { target: { value: 'test' } });
    fireEvent.change(passwordInput, { target: { value: 'test123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
        const dashboardText = screen.queryByText(/dashboard/i) || screen.queryByText(/panel de control/i);
        expect(dashboardText).toBeInTheDocument();
    }, { timeout: 5000 });
}; 