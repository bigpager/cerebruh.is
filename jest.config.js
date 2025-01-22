export default {
preset: 'ts-jest/presets/default-esm',
setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
testEnvironment: 'node',
transform: {
    '^.+\\.(js|jsx|ts|tsx|mjs)$': ['ts-jest', {
    useESM: true,
    }],
    'jest.setup.js': ['ts-jest', {
    useESM: true,
    }]
},
transformIgnorePatterns: [
    '/node_modules/(?!(@testing-library)/)',
],
modulePathIgnorePatterns: [
    '<rootDir>/dist/',
],
extensionsToTreatAsEsm: ['.ts', '.mts', '.jsx', '.tsx', '.mjs'],
moduleFileExtensions: ['js', 'mjs', 'cjs', 'jsx', 'ts', 'tsx', 'json', 'node'],
moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
},
testMatch: [
    '<rootDir>/test/**/*.test.{js,jsx,ts,tsx}',
],
}
