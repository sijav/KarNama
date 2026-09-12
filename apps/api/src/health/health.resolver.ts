import { ConfigService } from '@nestjs/config'
import { Query, Resolver } from '@nestjs/graphql'
import { Health } from './health.model.js'

@Resolver(() => Health)
export class HealthResolver {
  constructor(private readonly config: ConfigService) {}

  @Query(() => Health, { description: 'Whether the API is up, and enough context to tell a cold start from an outage' })
  health(): Health {
    return {
      status: 'ok',
      // Read through ConfigService rather than process.env, so the value is the
      // one that was validated at startup rather than whatever the environment
      // happens to hold now.
      environment: this.config.get<string>('NODE_ENV') ?? 'unknown',
      uptimeSeconds: Math.round(process.uptime()),
      revision: this.config.get<string>('RENDER_GIT_COMMIT') ?? null,
      demoExtractionEnabled: this.config.get<string>('ALLOW_DEMO_EXTRACTION') === 'true',
      extractionProvider: this.config.get<string>('EXTRACTION_PROVIDER') ?? 'openai',
    }
  }
}
