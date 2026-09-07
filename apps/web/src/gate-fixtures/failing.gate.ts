import { expect, it } from 'vitest'

// Untrue on purpose. Vitest must report this as a failure. See README.md in
// this directory.
it('is a deliberately broken test, and the gate must notice', () => {
  expect(1 + 1).toBe(3)
})
