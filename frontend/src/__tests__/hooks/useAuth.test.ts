import { renderHook } from '@testing-library/react-hooks';
import { useAuth } from '../../hooks/useAuth';
import { AuthProvider } from '../../context/AuthContext';
import React from 'react';

describe('useAuth', () => {
    it('provides authentication state', () => {
        const wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
            <AuthProvider>{children}</AuthProvider>
        );

        const { result } = renderHook(() => useAuth(), { wrapper });

        expect(result.current.user).toBeNull();
        expect(typeof result.current.login).toBe('function');
        expect(typeof result.current.logout).toBe('function');
    });
}); 