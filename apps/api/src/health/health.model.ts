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
}
