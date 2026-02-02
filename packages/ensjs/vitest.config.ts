import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    coverage: {
      enabled: true,
      include: ['src/**/*'],
      exclude: ['data/**/*'],
    },
    environment: 'node',
    globalSetup: ['./src/test/globalSetup.ts'],
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.test.ts'],
    exclude: ['data/**/*', 'src/actions/subgraph/**/*.test.ts'],
  },
})
