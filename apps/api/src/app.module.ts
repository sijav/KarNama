import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo'
import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { GraphQLModule } from '@nestjs/graphql'
import { join } from 'node:path'
import { parseEnv } from './config/env.js'
import { HealthModule } from './health/health.module.js'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      // The whole environment goes through one schema and the result REPLACES
      // process.env for anything reading through ConfigService. Throwing here
      // is what makes a missing variable a startup failure rather than a
      // surprise at the first request that needed it.
      validate: parseEnv,
    }),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      // Code first: the schema is generated FROM the resolvers and written to
      // disk, so `packages/graphql` can generate the client types from a file
      // that cannot disagree with the server. A schema-first setup would put a
      // second copy of the contract in the repository for someone to forget.
      autoSchemaFile: join(process.cwd(), 'schema.gql'),
      sortSchema: true,
      // On in every environment on purpose. This is a personal tool with a
      // public schema and no secrets in it, and a playground that only exists
      // in development is a playground that has never been tested where it
      // matters.
      playground: false,
      graphiql: true,
    }),
    HealthModule,
  ],
})
export class AppModule {}
