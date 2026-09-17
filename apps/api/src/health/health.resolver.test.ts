import 'reflect-metadata'

import { ConfigService } from '@nestjs/config'
import { describe, expect, it } from 'vitest'
import { HealthResolver } from './health.resolver.js'

/**
 * The one case the booted-application test cannot reach: a container that hands
 * the resolver a config with nothing in it.
 *
 * `NODE_ENV` has a default in the schema, so a correctly built application
 * always has one, and the fallback would be dead code if this did not exist.
 * It is not dead: `ConfigService.get` is typed as possibly undefined for every
 * key, and the day someone renames the variable this is what the health query
 * says instead of crashing.
 */
describe('the resolver on its own', () => {
  it('says unknown rather than throwing when the environment is not configured', () => {
    const empty = { get: () => undefined } as unknown as ConfigService
    const health = new HealthResolver(empty).health()
    expect(health.environment).toBe('unknown')
    expect(health.status).toBe('ok')
  })

  it('reports the configured environment when there is one', () => {
    const configured = { get: () => 'production' } as unknown as ConfigService
    expect(new HealthResolver(configured).health().environment).toBe('production')
  })

  it('reports the deployed revision and effective demo configuration without credentials', () => {
    const config = new ConfigService({
      RENDER_GIT_COMMIT: 'test-revision',
      ALLOW_DEMO_EXTRACTION: 'true',
      EXTRACTION_PROVIDER: 'groq',
      GROQ_API_KEY: 'private-fixture-value',
    })
    const health = new HealthResolver(config).health()
    expect(health.revision).toBe('test-revision')
    expect(health.demoExtractionEnabled).toBe(true)
    expect(health.extractionProvider).toBe('groq')
    expect(JSON.stringify(health)).not.toContain('private-fixture-value')
  })

  it('reports demo extraction disabled unless explicitly enabled', () => {
    const config = new ConfigService({ ALLOW_DEMO_EXTRACTION: 'false' })
    const health = new HealthResolver(config).health()
    expect(health.demoExtractionEnabled).toBe(false)
    expect(health.revision).toBeNull()
    expect(health.extractionProvider).toBe('openai')
  })
})

/**
 * A config holding exactly these keys and nothing the machine happens to carry.
 *
 * Not `new ConfigService({...})`: that falls through to `process.env`, so an
 * assertion that something is NOT configured would pass or fail depending on
 * whoever ran it. The second argument is honoured because the resolver relies
 * on it for the Groq model, exactly as `extraction.service.ts` does.
 */
const holding = (values: Record<string, string>) =>
  ({ get: (key: string, fallback?: string) => values[key] ?? fallback }) as unknown as ConfigService

describe('what is configured, which is not what it is', () => {
  it('says nothing is configured when nothing is', () => {
    const health = new HealthResolver(holding({})).health()
    expect(health.authSecretConfigured).toBe(false)
    expect(health.extractionProviderConfigured).toBe(false)
    expect(health.extractionKeyConfigured).toBe(false)
    expect(health.extractionModelConfigured).toBe(false)
  })

  it('tells a provider IN FORCE from a provider chosen', () => {
    // Both readers fall back to OpenAI, so `openai` is the honest answer for
    // what will run. It is not an answer about whether anyone picked it, and
    // the two were indistinguishable before this card.
    const health = new HealthResolver(holding({})).health()
    expect(health.extractionProvider).toBe('openai')
    expect(health.extractionProviderConfigured).toBe(false)

    const picked = new HealthResolver(holding({ EXTRACTION_PROVIDER: 'openai' })).health()
    expect(picked.extractionProvider).toBe('openai')
    expect(picked.extractionProviderConfigured).toBe(true)
  })

  it('reports the secret as set without carrying it', () => {
    const secret = 'y'.repeat(32)
    const health = new HealthResolver(holding({ AUTH_SECRET: secret })).health()
    expect(health.authSecretConfigured).toBe(true)
    expect(JSON.stringify(health)).not.toContain(secret)
  })

  it('reads groq credentials, whose model is defaulted at the call site', () => {
    const health = new HealthResolver(holding({ EXTRACTION_PROVIDER: 'groq', GROQ_API_KEY: 'a-key' })).health()
    expect(health.extractionKeyConfigured).toBe(true)
    // No GROQ_EXTRACTION_MODEL is set and it still reads configured, because
    // the service would find the default too. Reporting false here would be a
    // second opinion about a service that is going to work.
    expect(health.extractionModelConfigured).toBe(true)
    expect(JSON.stringify(health)).not.toContain('a-key')
  })

  it('reads openai credentials, whose model is defaulted NOWHERE', () => {
    const half = new HealthResolver(holding({ EXTRACTION_PROVIDER: 'openai', OPENAI_API_KEY: 'a-key' })).health()
    expect(half.extractionKeyConfigured).toBe(true)
    // The case the card exists for: a key present, a model absent, and every
    // extraction failing on `!key || !model`.
    expect(half.extractionModelConfigured).toBe(false)

    const whole = new HealthResolver(
      holding({ EXTRACTION_PROVIDER: 'openai', OPENAI_API_KEY: 'a-key', OPENAI_EXTRACTION_MODEL: 'a-model' }),
    ).health()
    expect(whole.extractionModelConfigured).toBe(true)
  })

  it('reads the key belonging to the provider in force, not the other one', () => {
    // A Groq key with OpenAI chosen is the misconfiguration that reads as
    // healthy: something is set, just not the thing that will be asked for.
    const health = new HealthResolver(holding({ EXTRACTION_PROVIDER: 'openai', GROQ_API_KEY: 'a-key' })).health()
    expect(health.extractionKeyConfigured).toBe(false)
  })
})
