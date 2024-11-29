/** @type {import('jest').Config} */
module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'jsdom',
    setupFilesAfterEnv: ['<rootDir>/src/__tests__/setup.minimal.ts'],
    moduleNameMapper: {
        '\\.(css|less|scss)$': 'identity-obj-proxy'
    },
    testMatch: ['<rootDir>/src/__tests__/integration/**/*.test.[jt]s?(x)']
}; 