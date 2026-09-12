import { afterEach, beforeEach } from 'vitest'
import { installConsoleGuard, setWatching, type ConsoleGuard } from '../src/shared/console-guard'

// A test that makes React warn fails, rather than printing into a log nobody
// reads, KN-134. The rule is in `src/shared/console-guard.ts`, with its own
// test: the product MARKS what it says at the console and anything unmarked
// fails, whatever its shape and whichever method said it. This file is only the
// wiring, because a test beside it would never run: the unit project takes
// `src/**/*.test.ts` alone, KN-401.
let guard: ConsoleGuard | null = null

beforeEach(() => {
  guard = installConsoleGuard(console)
  setWatching(guard)
})

afterEach(() => {
  const heard = guard?.heard ?? []
  guard?.restore()
  guard = null
  if (heard.length > 0) throw new Error(`something warned during this test:\n${heard.join('\n')}`)
})
