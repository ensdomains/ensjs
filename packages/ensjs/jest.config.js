/* eslint-disable @typescript-eslint/naming-convention */
const config = {
  verbose: true,
  testEnvironment: 'node',
  extensionsToTreatAsEsm: ['.ts'],
  transform: {
    '^.+\\.(t|j)sx?$': ['@swc/jest'],
  },
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  transformIgnorePatterns: [],
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
    '^multiformats$': '<rootDir>/node_modules/multiformats/src/index.js',
    '^multiformats/(.*)$': '<rootDir>/node_modules/multiformats/src/$1',
    '^@ensdomains/ens-test-env$':
      '<rootDir>/node_modules/@ensdomains/ens-test-env/src/execute.cjs',
  },
}

export default config
