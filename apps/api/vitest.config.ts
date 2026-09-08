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
 *
 * TWO PROJECTS, and they exist because the two halves want opposite things.
 *
 * Building a GraphQL schema in process throws `Cannot use GraphQLScalarType
 * "Boolean" from another module or realm` unless `graphql` AND `@nestjs/graphql`
 * are inlined: Vite's transform pipeline and the CommonJS interop each resolve
 * their own copy, and graphql compares scalars by identity. Inlining
 * `@nestjs/graphql` then breaks the test that boots the whole application,
 * because Nest cannot resolve `graphQlFactory` out of the inlined module.
 *
 * So the schema tests get the inlining and everything else does not. Neither
 * problem exists in the built server, which loads one copy of each; both are
 * artefacts of running Nest under Vite.
 */
const shared = {
  globals: false,
  environment: 'node' as const,
  // Runs BEFORE any import in a test file, which is the only place the
  // environment can be set: ConfigModule validates at import time.
  setupFiles: ['./vitest.setup.ts'],
}

export default defineConfig({
  test: {
    projects: [
      {
        plugins: [swc.vite({ module: { type: 'es6' } })],
        test: {
          ...shared,
          name: 'api',
          include: ['src/**/*.test.ts'],
          exclude: ['src/graphql/**/*.test.ts'],
        },
      },
      {
        plugins: [swc.vite({ module: { type: 'es6' } })],
        resolve: { dedupe: ['graphql'] },
        ssr: { noExternal: ['graphql', '@nestjs/graphql'] },
        test: {
          ...shared,
          name: 'schema',
          include: ['src/graphql/**/*.test.ts'],
        },
      },
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      include: ['src/**/*.ts'],
      // `main.ts` boots a real server on a real port and `*.module.ts` files are
      // declarations with no behaviour: covering them would mean asserting that
      // a decorator was written, which the schema snapshot already does better.
      exclude: [
        'src/main.ts',
        'src/**/*.module.ts',
        'src/**/*.test.ts',
        // The only excluded files with code in them, and neither makes a
        // decision: six lines that read argv, call a function and set an exit
        // code. Both are covered by a test that SPAWNS them as a real process,
        // and coverage cannot see a subprocess.
        'src/database/cli-entry.ts',
        'src/graphql/schema-entry.ts',
      ],
      thresholds: { statements: 100, branches: 100, functions: 100, lines: 100 },
    },
  },
})
