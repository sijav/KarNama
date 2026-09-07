import { storybookTest } from '@storybook/addon-vitest/vitest-plugin'
import react from '@vitejs/plugin-react-swc'
import { playwright } from '@vitest/browser-playwright'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'

const dirname = fileURLToPath(new URL('.', import.meta.url))

/**
 * Two projects, deliberately.
 *
 * `unit` runs in node against the things that have no DOM: the token set, the
 * catalogs, the theme. `storybook` runs every story as a test in a real
 * headless Chromium, which is the only way a component's rendered result is
 * actually checked rather than its computed props.
 *
 * Coverage is total by intent. The threshold is the standard, and lowering it
 * to fit code that was written without a test is how a 100 percent target
 * quietly becomes 60.
 */
export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      include: ['src/**/*.{ts,tsx}'],
      exclude: ['src/**/*.stories.tsx', 'src/main.tsx', 'src/**/*.d.ts', 'src/gate-fixtures/**'],
      thresholds: { statements: 100, branches: 100, functions: 100, lines: 100 },
    },
    projects: [
      {
        plugins: [react()],
        test: {
          name: 'unit',
          environment: 'node',
          // The failing fixture is named `.gate.ts`, so this pattern cannot
          // reach it and no exclude is needed. An exclude was worse: it made
          // vitest report "no test files found" when the verifier named the
          // file explicitly.
          include: ['src/**/*.test.ts'],
        },
      },
      {
        plugins: [react(), storybookTest({ configDir: `${dirname}.storybook` })],
        test: {
          name: 'storybook',
          browser: {
            enabled: true,
            headless: true,
            provider: playwright(),
            instances: [{ browser: 'chromium' }],
          },
          setupFiles: ['.storybook/vitest.setup.ts'],
        },
      },
    ],
  },
})
