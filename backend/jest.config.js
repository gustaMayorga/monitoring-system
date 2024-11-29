/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    roots: ['<rootDir>/src'],
    moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/src/$1'
    },
    setupFilesAfterEnv: ['<rootDir>/src/tests/setup.ts'],
    testMatch: [
        '**/src/tests/**/*.test.ts'
    ],
    moduleDirectories: ['node_modules', '<rootDir>']
}; 