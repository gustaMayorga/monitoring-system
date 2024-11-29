import { render, screen } from '@testing-library/react';
import { StatCard } from '../../components/StatCard';
import { UserIcon } from '@heroicons/react/solid';

describe('StatCard', () => {
    it('renders correctly', () => {
        render(
            <StatCard
                title="Test Title"
                value="123"
                icon={<UserIcon className="h-6 w-6" />}
                type="success"
            />
        );

        expect(screen.getByText('Test Title')).toBeInTheDocument();
        expect(screen.getByText('123')).toBeInTheDocument();
    });

    it('applies correct styles based on type', () => {
        const { container } = render(
            <StatCard
                title="Test"
                value="123"
                icon={<UserIcon className="h-6 w-6" />}
                type="danger"
            />
        );

        expect(container.firstChild).toHaveClass('bg-red-50', 'text-red-600');
    });
}); 