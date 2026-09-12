import { Field, Int, ObjectType } from '@nestjs/graphql'

@ObjectType()
export class Account {
  @Field() id!: string
  @Field() phone!: string
  @Field() name!: string
  @Field() since!: string
}

@ObjectType()
export class LoginResult {
  @Field() token!: string
  @Field() expiresAt!: string
  @Field(() => Account) account!: Account
}

@ObjectType()
export class CodeDelivery {
  @Field() phone!: string
  @Field(() => Int) retryAfterSeconds!: number
  @Field(() => Int) expiresInSeconds!: number
}
