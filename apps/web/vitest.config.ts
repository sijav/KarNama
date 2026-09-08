import { storybookTest } from '@storybook/addon-vitest/vitest-plugin'
import react from '@vitejs/plugin-react-swc'
import { playwright } from '@vitest/browser-playwright'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'

const dirname = fileURLToPath(new URL('.', import.meta.url))

/**
 * Gate mode: `KARNAMA_GATE_FIXTURES=1 npm test` adds the fixture that is
 * supposed to fail to the unit project, ON TOP of the ordinary include rather
 * than instead of it.
 *
 * This exists because the earlier proof ran the fixture through a separate
 * config file, which established that vitest can report a failure and NOT that
 * the gate this repository runs would have caught one. The real unit project
 * could have been excluded, emptied or misconfigured and that proof stayed
 * green. Adding to the same array means emptying it shows up in both directions:
 * the ordinary run drops to zero tests and the gate run stops reporting any
 * passes alongside the failure.
 *
 * `.gate.ts` rather than `.test.ts` is what keeps the fixture out of an
 * ordinary run, so this flag is the only way in.
 */
// `.test.tsx` as well as `.test.ts`: a test that renders JSX through
// `react-dom/server` needs the extension, and the node project is where the
// cases a story cannot reach are tested, such as a context read outside its
// provider. `.gate.ts` still matches neither, which is what keeps the
// deliberately failing fixture out of an ordinary run.
const unitInclude = ['src/**/*.test.ts', 'src/**/*.test.tsx']
const gateMode = Boolean(process.env.KARNAMA_GATE_FIXTURES)

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
          include: gateMode ? [...unitInclude, 'src/gate-fixtures/**/*.gate.ts'] : unitInclude,
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
