import { render } from '@testing-library/react';

describe('Simple test', () => {
    test('renders without crashing', () => {
        render(<div>Test</div>);
        expect(true).toBe(true);
    });
}); 