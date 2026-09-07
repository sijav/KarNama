import { defineConfig } from 'vitest/config'

/**
 * A config whose only job is to run the file that is supposed to fail.
 *
 * The fixture is named `.gate.ts` rather than `.test.ts` so the ordinary
 * include pattern cannot match it. Excluding it from the real config instead
 * was tried and does not work: with the exclude in place vitest reports "no
 * test files found" for an explicitly named file, and clearing the exclude on
 * the command line drops the filter and runs the whole suite. Either way the
 * proof would be that something passed, which is not the proof wanted.
 */
export default defineConfig({
  test: {
    name: 'gate',
    environment: 'node',
    include: ['src/gate-fixtures/**/*.gate.ts'],
  },
})
