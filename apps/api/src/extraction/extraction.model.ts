import { Field, ObjectType } from '@nestjs/graphql'

@ObjectType()
export class ExtractedJob {
  @Field() title!: string
  @Field() company!: string
  @Field(() => [String]) employmentTypes!: string[]
  @Field() location!: string
  @Field() experience!: string
  @Field(() => String, { nullable: true }) jobLevel!: string | null
  @Field() postedAt!: string
  @Field() salary!: string
  @Field() source!: string
  @Field() expiresAt!: string
  @Field() postingUrl!: string
  @Field() description!: string
}
