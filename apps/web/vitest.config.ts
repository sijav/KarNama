import { storybookTest } from '@storybook/addon-vitest/vitest-plugin'
import react from '@vitejs/plugin-react-swc'
import { defineBrowserCommand, playwright } from '@vitest/browser-playwright'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'

const dirname = fileURLToPath(new URL('.', import.meta.url))

// Moves the runner's real pointer off the page, where it hovers nothing,
// KN-260 and KN-369. Storybook's vitest plugin has a reset of its own,
// resetMousePosition to the same place, but it adds the setup file that calls
// it only when the ROOT config enables the browser, and here only the
// storybook project does, so it never runs: this is the suite's one reset,
// TECH-DEBT 19. Off the page rather than at its corner, where a story that
// opens a modal at once has the modal's backdrop. A command rather than a
// hover of some element, because Playwright's hover waits for its target to
// be visible and stable, which an element added before a story renders never
// is.
const parkPointer = defineBrowserCommand(async (context) => {
  await context.page.mouse.move(-1000, -1000)
})

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
// The EXACT string, not truthiness. `Boolean(process.env.X)` is true for "0",
// "false" and "no", so a variable that reads as off turned the deliberately
// failing fixture ON, and an inherited value from a CI template or a shell made
// an ordinary run fail for a reason nobody would connect to this file. An
// explicit opt-in is the only reading under which a stray value is safe.
const gateMode = process.env.KARNAMA_GATE_FIXTURES === '1'

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
      exclude: [
        'src/**/*.stories.tsx',
        'src/main.tsx',
        'src/**/*.d.ts',
        'src/gate-fixtures/**',
        // The Storybook Docs page and the hook that feeds it. Excluded for the
        // same reason `*.stories.tsx` is: this repository covers React by
        // rendering stories in a real browser, and a Docs page cannot be
        // rendered as a story — it needs the docs context that only Storybook's
        // docs view provides. Every decision they make was moved into
        // `docs-locale.ts` and `catalog.ts`, which ARE tested; what is left in
        // these two is wiring, and the wiring is checked by opening Storybook
        // and switching the Language toolbar, which is gate steps 5 to 7.
        'src/shared/story-docs/DocsPage.tsx',
        'src/shared/story-docs/useDocsLocale.ts',
      ],
      thresholds: { statements: 100, branches: 100, functions: 100, lines: 100 },
    },
    projects: [
      {
        plugins: [react()],
        test: {
          name: 'unit',
          environment: 'node',
          include: gateMode ? [...unitInclude, 'src/gate-fixtures/**/*.gate.ts'] : unitInclude,
          // Both projects fail a test that makes React warn, KN-134.
          setupFiles: ['.storybook/react-warnings.setup.ts'],
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
            commands: { parkPointer },
          },
          setupFiles: ['.storybook/react-warnings.setup.ts', '.storybook/vitest.setup.ts'],
        },
      },
    ],
  },
})
