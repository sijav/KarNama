import { ConfigService } from '@nestjs/config'
import { Args, Context, Mutation, Resolver } from '@nestjs/graphql'
import { tokenFrom, type RequestContext } from '../auth/auth.resolver.js'
import { AuthService } from '../auth/auth.service.js'
import { ExtractedJob } from './extraction.model.js'
import { ExtractionService } from './extraction.service.js'

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
      const ip = context.req.ip ?? context.req.socket.remoteAddress ?? ''
      await this.auth.limit(`extract-demo:${ip}`, 10)
      await this.auth.limit('extract-demo:global', 20)
    } else {
      const account = await this.auth.account(token)
      await this.auth.limit(`extract:${account.id}`, 20)
    }
    return this.extraction.extract(source)
  }
}
