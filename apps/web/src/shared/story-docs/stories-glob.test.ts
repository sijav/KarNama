import { existsSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import config from '../../../.storybook/main'

// The MDX a stories pattern for .mdx would index: a bare English label, copy
// no lint block reads, committed beside the other gate fixtures, KN-097.
const FIXTURE = new URL('../../gate-fixtures/unlinted-copy.mdx', import.meta.url)

describe("Storybook's stories patterns", () => {
  it('index no MDX, which no lint block reads, so copy in one would go unchecked', () => {
    expect(existsSync(FIXTURE)).toBe(true)
    const { stories } = config
    if (!Array.isArray(stories)) throw new Error('the stories are not a list of patterns')
    const patterns = stories.map((entry) => (typeof entry === 'string' ? entry : `${entry.directory}/${entry.files ?? ''}`))
    expect(patterns.length).toBeGreaterThan(0)
    expect(patterns.filter((pattern) => pattern.includes('mdx'))).toEqual([])
  })
})
