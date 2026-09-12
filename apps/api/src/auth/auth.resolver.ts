import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql'
import type { Request } from 'express'
import { Account, CodeDelivery, LoginResult } from './auth.model.js'
import { AuthService } from './auth.service.js'

export interface RequestContext {
  req: Request
}
export const tokenFrom = ({ req }: RequestContext) => req.headers.authorization?.replace(/^Bearer /u, '') ?? ''

@Resolver()
export class AuthResolver {
  constructor(private readonly auth: AuthService) {}

  @Mutation(() => CodeDelivery)
  requestLoginCode(@Args('phone') phone: string, @Context() context: RequestContext) {
    return this.auth.requestCode(phone, context.req.ip ?? context.req.socket.remoteAddress ?? '')
  }

  @Mutation(() => LoginResult)
  verifyLoginCode(@Args('phone') phone: string, @Args('code') code: string, @Context() context: RequestContext) {
    return this.auth.verify(phone, code, context.req.ip ?? context.req.socket.remoteAddress ?? '')
  }

  @Query(() => Account)
  currentAccount(@Context() context: RequestContext) {
    return this.auth.account(tokenFrom(context))
  }

  @Mutation(() => Account)
  saveAccountName(@Args('name') name: string, @Context() context: RequestContext) {
    return this.auth.saveName(tokenFrom(context), name)
  }

  @Mutation(() => Boolean)
  signOut(@Context() context: RequestContext) {
    return this.auth.signOut(tokenFrom(context))
  }
}
