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
