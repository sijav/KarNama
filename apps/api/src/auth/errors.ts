import { GraphQLError } from 'graphql'

export const fail = (code: string): never => {
  throw new GraphQLError(code, { extensions: { code } })
}
