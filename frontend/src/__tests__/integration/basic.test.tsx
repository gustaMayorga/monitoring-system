import { render, screen } from '@testing-library/react';
import { App } from '../../App';

describe('Basic Integration Test', () => {
    it('should render without crashing', () => {
        render(<App />);
        expect(screen.getByText(/sistema de monitoreo/i)).toBeInTheDocument();
    });
}); 