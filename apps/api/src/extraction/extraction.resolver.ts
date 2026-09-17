import { ConfigService } from '@nestjs/config'
import { Args, Context, Mutation, Resolver } from '@nestjs/graphql'
import { tokenFrom, type RequestContext } from '../auth/auth.resolver.js'
import { AuthService } from '../auth/auth.service.js'
import { clientIp } from '../client-ip.js'
import { ExtractedJob } from './extraction.model.js'
import { ExtractionService, sourceText } from './extraction.service.js'

@Resolver()
export class ExtractionResolver {
  constructor(
    private readonly auth: AuthService,
    private readonly extraction: ExtractionService,
    private readonly config: ConfigService,
  ) {}

  @Mutation(() => ExtractedJob)
  async extractJob(@Args('source') source: string, @Context() context: RequestContext) {
    const token = tokenFrom(context)
    if (!token && this.config.get<string>('ALLOW_DEMO_EXTRACTION') === 'true') {
      // Refused BEFORE anything is counted, KN-484: `auth.limit` counts and
      // checks in one statement, so a source this will reject has already spent
      // one of ten an hour by the time the service rejects it.
      sourceText(source)
      await this.auth.limit(`extract-demo:${clientIp(context.req)}`, 10)
      await this.auth.limit('extract-demo:global', 20)
    } else {
      // Authentication FIRST, then the source. The other order would answer a
      // bad token carrying a short source with INVALID_POSTING, telling the
      // caller their posting was the problem when their token was.
      const account = await this.auth.account(token)
      sourceText(source)
      await this.auth.limit(`extract:${account.id}`, 20)
    }
    return this.extraction.extract(source)
  }
}
