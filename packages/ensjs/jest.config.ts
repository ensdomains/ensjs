const config = {
  verbose: true,
  testEnvironment: 'node',
  extensionsToTreatAsEsm: ['.ts'],
  transform: {
    '^.+\\.(t|j)sx?$': ['@swc/jest'],
  },
}

export default config
