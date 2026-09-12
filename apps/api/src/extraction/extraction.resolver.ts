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
  ) {}

  @Mutation(() => ExtractedJob)
  async extractJob(@Args('source') source: string, @Context() context: RequestContext) {
    const account = await this.auth.account(tokenFrom(context))
    await this.auth.limit(`extract:${account.id}`, 20)
    return this.extraction.extract(source)
  }
}
