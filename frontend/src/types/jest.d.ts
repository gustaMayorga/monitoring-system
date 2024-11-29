/// <reference types="jest" />

declare namespace jest {
    interface Matchers<R> {
        toHaveBeenCalledWith(...args: any[]): R;
        toBe(expected: any): R;
        toMatch(pattern: string | RegExp): R;
        toThrow(message?: string | Error): R;
    }
}

declare module 'jest-mock' {
    export interface MockInstance<T extends (...args: any[]) => any> {
        mockResolvedValue(value: any): void;
        mockRejectedValue(value: any): void;
        mockReturnValue(value: any): void;
        mockImplementation(fn: (...args: any[]) => any): void;
    }
} 