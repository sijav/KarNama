import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo'
import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { GraphQLModule } from '@nestjs/graphql'
import { parseEnv } from './config/env.js'
import { GraphqlModule } from './graphql/graphql.module.js'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      // Test fixtures must never pick up local provider keys or demo settings.
      ignoreEnvFile: process.env.NODE_ENV === 'test',
      // The whole environment goes through one schema and the result REPLACES
      // process.env for anything reading through ConfigService. Throwing here
      // is what makes a missing variable a startup failure rather than a
      // surprise at the first request that needed it.
      validate: parseEnv,
    }),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      // Code first, and IN MEMORY. It used to write `schema.gql` on boot, which
      // made the committed contract a side effect of running the server: a
      // fresh clone had none, and a server started in the wrong directory
      // rewrote it in a different format and broke the staleness check. The
      // file is produced by `npm run schema:generate`, from the same
      // decorators, without a server. KN-120.
      autoSchemaFile: true,
      sortSchema: true,
      // On in every environment on purpose. This is a personal tool with a
      // public schema and no secrets in it, and a playground that only exists
      // in development is a playground that has never been tested where it
      // matters.
      playground: false,
      graphiql: true,
    }),
    // One module, registering the same list the generator reads. See
    // graphql.module.ts for why that matters.
    GraphqlModule,
  ],
})
export class AppModule {}
