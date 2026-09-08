import swc from 'unplugin-swc'
import { defineConfig } from 'vitest/config'

/**
 * Vitest rather than Jest, so the monorepo has one runner, and `unplugin-swc`
 * because NestJS needs decorator METADATA at runtime.
 *
 * esbuild, which Vite uses by default, strips decorators and emits no metadata,
 * so `@Args('id') id: string` loses the fact that it is a string and every
 * injected dependency arrives as `undefined`. The failure is not a type error,
 * it is a resolver that returns null and a container that cannot construct
 * anything, which is why this is a plugin rather than a tsconfig flag.
 */
export default defineConfig({
  plugins: [swc.vite({ module: { type: 'es6' } })],
  test: {
    globals: false,
    environment: 'node',
    include: ['src/**/*.test.ts'],
    // Runs BEFORE any import in a test file, which is the only place the
    // environment can be set: ConfigModule validates at import time.
    setupFiles: ['./vitest.setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      include: ['src/**/*.ts'],
      // `main.ts` boots a real server on a real port and `*.module.ts` files are
      // declarations with no behaviour: covering them would mean asserting that
      // a decorator was written, which the schema snapshot already does better.
      exclude: ['src/main.ts', 'src/**/*.module.ts', 'src/**/*.test.ts'],
      thresholds: { statements: 100, branches: 100, functions: 100, lines: 100 },
    },
  },
})
