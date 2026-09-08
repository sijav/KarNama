import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      // `generated.ts` is types only, so there is nothing to execute and
      // nothing to cover. Including it would report 0 percent for a file with
      // no runtime, which is a number that teaches people to ignore the number.
      include: ['src/**/*.ts'],
      exclude: ['src/generated.ts', 'src/index.ts', 'src/**/*.test.ts'],
      thresholds: { statements: 100, branches: 100, functions: 100, lines: 100 },
    },
  },
})
