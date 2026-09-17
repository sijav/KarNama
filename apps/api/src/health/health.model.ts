import { Field, ObjectType } from '@nestjs/graphql'

/**
 * What the health query answers.
 *
 * Deliberately more than "ok". A health endpoint that only ever says ok is a
 * health endpoint nobody can debug with: the two things worth knowing when the
 * free tier has just woken up are which build is running and how long it has
 * been awake, and neither is available anywhere else.
 */
@ObjectType()
export class Health {
  @Field(() => String, { description: 'ok when the service is serving requests' })
  status!: string

  @Field(() => String, { description: 'Which environment this process believes it is in' })
  environment!: string

  @Field(() => Number, { description: 'Seconds since this process started, so a cold start is visible' })
  uptimeSeconds!: number

  @Field(() => String, { nullable: true, description: 'Git revision running on Render, when available' })
  revision?: string | null

  @Field(() => Boolean, { description: 'Whether this process allows rate-limited demo extraction' })
  demoExtractionEnabled!: boolean

  @Field(() => String, { description: 'Configured extraction provider, without credentials' })
  extractionProvider!: string

  // Four things can be missing, and a process missing any of them starts anyway
  // and fails every extraction, KN-485. Each says WHETHER it is set and never
  // what it is, which `health.resolver.test.ts` enforces rather than trusts.
  @Field(() => Boolean, { description: 'Whether the signing secret is set, never what it is' })
  authSecretConfigured!: boolean

  @Field(() => Boolean, { description: 'Whether a provider was chosen, rather than falling back to OpenAI' })
  extractionProviderConfigured!: boolean

  @Field(() => Boolean, { description: 'Whether the API key for the provider in force is set, never what it is' })
  extractionKeyConfigured!: boolean

  @Field(() => Boolean, { description: 'Whether the model for the provider in force is set' })
  extractionModelConfigured!: boolean
}
