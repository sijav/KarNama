import { afterEach, beforeEach } from 'vitest'

// A test that makes React warn fails, rather than printing into a log nobody
// reads, KN-134. React's development warnings are printf-style console.error
// calls, their first argument a format string with %s in it; the product's own
// reports, the Tooltip's and the Icon Button's, are plain sentences, and a story
// that means to provoke one watches the console itself. Every call still
// reaches the console as it would have.
const heard: string[] = []
const original = console.error

beforeEach(() => {
  heard.length = 0
  console.error = (...args: unknown[]) => {
    const [first] = args
    if (typeof first === 'string' && first.includes('%s')) heard.push(first)
    original(...args)
  }
})

afterEach(() => {
  console.error = original
  if (heard.length > 0) throw new Error(`React warned during this test:\n${heard.join('\n')}`)
})
