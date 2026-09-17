import { ConfigService } from '@nestjs/config'
import { Query, Resolver } from '@nestjs/graphql'
import { Health } from './health.model.js'

@Resolver(() => Health)
export class HealthResolver {
  constructor(private readonly config: ConfigService) {}

  @Query(() => Health, { description: 'Whether the API is up, and enough context to tell a cold start from an outage' })
  health(): Health {
    // The provider CHOSEN, which is not the provider in force: with none
    // chosen both readers fall back to OpenAI, so `openai` alone cannot say
    // whether anybody picked it, KN-485.
    const chosen = this.config.get<string>('EXTRACTION_PROVIDER')
    const groq = chosen === 'groq'
    // The same two reads `extraction.service.ts` makes, including the Groq
    // model's call-site default, so this reports the configuration that service
    // will actually find rather than a second opinion about it.
    const key = this.config.get<string>(groq ? 'GROQ_API_KEY' : 'OPENAI_API_KEY')
    const model = groq
      ? this.config.get<string>('GROQ_EXTRACTION_MODEL', 'openai/gpt-oss-120b')
      : this.config.get<string>('OPENAI_EXTRACTION_MODEL')

    return {
      status: 'ok',
      // Read through ConfigService rather than process.env, so the value is the
      // one that was validated at startup rather than whatever the environment
      // happens to hold now.
      environment: this.config.get<string>('NODE_ENV') ?? 'unknown',
      uptimeSeconds: Math.round(process.uptime()),
      revision: this.config.get<string>('RENDER_GIT_COMMIT') ?? null,
      demoExtractionEnabled: this.config.get<string>('ALLOW_DEMO_EXTRACTION') === 'true',
      extractionProvider: chosen ?? 'openai',
      // Presence, never the value. The schema floors the secret's length, so a
      // secret that is set is a secret that is long enough.
      authSecretConfigured: Boolean(this.config.get<string>('AUTH_SECRET')),
      extractionProviderConfigured: chosen !== undefined,
      extractionKeyConfigured: Boolean(key),
      extractionModelConfigured: Boolean(model),
    }
  }
}
