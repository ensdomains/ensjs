import { defineConfig } from 'vitest/config'
// TODO: Include subgraph functions before final merge.

export default defineConfig({
  test: {
    coverage: {
      enabled: true,
      include: ['src/**/*'],
      exclude: ['data/**/*'],
    },
    environment: 'happy-dom',
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.test.ts'],
    exclude: ['data/**/*'],
  },
})
