import { Catch } from '@nestjs/common'
import { GqlExceptionFilter } from '@nestjs/graphql'
import { GraphQLError } from 'graphql'

@Catch(GraphQLError)
export class GraphqlErrorFilter implements GqlExceptionFilter {
  catch(error: GraphQLError) {
    return error
  }
}
