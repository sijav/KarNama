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
    // NOT defaulted, KN-485: a provider nobody chose has to stay tellable from
    // one chosen as `openai`, or the refusal below cannot see it.
    expect(env.EXTRACTION_PROVIDER).toBeUndefined()
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

/** What a refused environment says, or '' when it was not refused at all. */
const refusal = (source: Record<string, string | undefined>) => {
  try {
    parseEnv(source)
    return ''
  } catch (error) {
    return error instanceof Error ? error.message : String(error)
  }
}

describe('demo extraction, which must not start half configured', () => {
  // Long enough for the schema's floor, which auth.service.ts checks again.
  const secret = 'x'.repeat(32)
  const demo = { ...complete, ALLOW_DEMO_EXTRACTION: 'true' }

  it('leaves a deployment with demo extraction OFF alone', () => {
    // The default posture, and nothing about it is broken. None of this fires.
    expect(refusal(complete)).toBe('')
    expect(refusal({ ...complete, EXTRACTION_PROVIDER: 'groq' })).toBe('')
  })

  it('tells an ABSENT provider from an explicitly chosen openai', () => {
    // The distinction the whole refusal rests on. With a default on the schema
    // it is unobservable, because a default is applied DURING parsing and the
    // refinement would read `openai` either way.
    expect(parseEnv(complete).EXTRACTION_PROVIDER).toBeUndefined()
    expect(parseEnv({ ...complete, EXTRACTION_PROVIDER: 'openai' }).EXTRACTION_PROVIDER).toBe('openai')
  })

  it('refuses without AUTH_SECRET, because every demo limit is keyed by HMAC', () => {
    expect(refusal({ ...demo, EXTRACTION_PROVIDER: 'groq', GROQ_API_KEY: 'a-key' })).toContain('AUTH_SECRET')
  })

  it('refuses when no provider was chosen, and asks for nothing else yet', () => {
    const message = refusal({ ...demo, AUTH_SECRET: secret })
    expect(message).toContain('EXTRACTION_PROVIDER')
    // Naming OpenAI's key here would answer a question nobody has asked: this
    // deployment has not said which provider it wants.
    expect(message).not.toContain('OPENAI_API_KEY')
  })

  it('refuses groq without its key', () => {
    expect(refusal({ ...demo, AUTH_SECRET: secret, EXTRACTION_PROVIDER: 'groq' })).toContain('GROQ_API_KEY')
  })

  it('refuses openai without its key', () => {
    const source = { ...demo, AUTH_SECRET: secret, EXTRACTION_PROVIDER: 'openai', OPENAI_EXTRACTION_MODEL: 'a-model' }
    expect(refusal(source)).toContain('OPENAI_API_KEY')
  })

  it('refuses openai without its MODEL, which has no default anywhere', () => {
    // extraction.service.ts fails on `!key || !model`, and only the Groq model
    // is defaulted. A refusal that checked keys alone would let this boot and
    // fail every extraction, which is the outage this card exists to stop.
    const source = { ...demo, AUTH_SECRET: secret, EXTRACTION_PROVIDER: 'openai', OPENAI_API_KEY: 'a-key' }
    expect(refusal(source)).toContain('OPENAI_EXTRACTION_MODEL')
  })

  it('accepts groq with no model, because that one is defaulted twice', () => {
    expect(refusal({ ...demo, AUTH_SECRET: secret, EXTRACTION_PROVIDER: 'groq', GROQ_API_KEY: 'a-key' })).toBe('')
  })

  it('accepts a complete demo configuration', () => {
    const source = {
      ...demo,
      AUTH_SECRET: secret,
      EXTRACTION_PROVIDER: 'openai',
      OPENAI_API_KEY: 'a-key',
      OPENAI_EXTRACTION_MODEL: 'a-model',
    }
    expect(refusal(source)).toBe('')
  })

  it('names every missing piece at once rather than one per deploy', () => {
    const message = refusal(demo)
    expect(message).toContain('2 configuration problem(s)')
    expect(message).toContain('AUTH_SECRET')
    expect(message).toContain('EXTRACTION_PROVIDER')
  })
})
