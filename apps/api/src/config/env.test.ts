import { describe, expect, it } from 'vitest'
import { parseEnv } from './env.js'

const complete = {
  WEB_ORIGIN: 'https://sijav.github.io',
  DATABASE_URL: 'postgresql://user:pass@host:5432/karnama',
}

describe('parsing the environment', () => {
  it('accepts a complete environment and applies the defaults', () => {
    const env = parseEnv(complete)
    expect(env.NODE_ENV).toBe('development')
    expect(env.PORT).toBe(4000)
    expect(env.WEB_ORIGIN).toBe(complete.WEB_ORIGIN)
    expect(env.EXTRACTION_PROVIDER).toBe('openai')
    expect(env.ALLOW_DEMO_EXTRACTION).toBe('false')
  })

  it('coerces PORT, because the environment only holds strings', () => {
    expect(parseEnv({ ...complete, PORT: '8080' }).PORT).toBe(8080)
  })

  it.each([
    ['PORT', '0'],
    ['PORT', '70000'],
    ['PORT', 'not a number'],
    ['NODE_ENV', 'staging'],
    ['EXTRACTION_PROVIDER', 'invalid'],
    ['ALLOW_DEMO_EXTRACTION', 'yes'],
  ])('rejects %s=%s', (key, value) => {
    expect(() => parseEnv({ ...complete, [key]: value })).toThrow(/cannot start/)
  })

  it.each(['WEB_ORIGIN', 'DATABASE_URL'])('refuses to start without %s', (key) => {
    const incomplete = { ...complete }
    // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
    delete incomplete[key as keyof typeof complete]
    expect(() => parseEnv(incomplete)).toThrow(new RegExp(key))
  })

  it('names EVERY missing variable at once, not the first one', () => {
    // A deploy that fails four times in a row, once per variable, is four cold
    // starts. The count in the message is what makes that impossible to miss.
    try {
      parseEnv({})
      expect.unreachable('an empty environment must not parse')
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      expect(message).toContain('2 configuration problem(s)')
      expect(message).toContain('WEB_ORIGIN')
      expect(message).toContain('DATABASE_URL')
    }
  })

  it('explains what each variable is FOR, not just that it is missing', () => {
    // "WEB_ORIGIN is required" tells whoever is deploying nothing they did not
    // already know from the variable name.
    const message = (() => {
      try {
        parseEnv({})
        return ''
      } catch (error) {
        return error instanceof Error ? error.message : ''
      }
    })()
    expect(message).toContain('the origin the web app is served from')
    expect(message).toContain('the Postgres connection string')
  })

  it('has no default for WEB_ORIGIN, because a default CORS origin is no CORS', () => {
    expect(() => parseEnv({ DATABASE_URL: complete.DATABASE_URL })).toThrow(/WEB_ORIGIN/)
  })
})
