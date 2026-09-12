import { Module } from '@nestjs/common'
import { APP_FILTER } from '@nestjs/core'
import { AuthService } from '../auth/auth.service.js'
import { AuthDatabase } from '../auth/database.service.js'
import { SmsService } from '../auth/sms.service.js'
import { ExtractionService } from '../extraction/extraction.service.js'
import { GraphqlErrorFilter } from './error.filter.js'
import { resolvers } from './resolvers.js'

/**
 * Registers EVERY resolver, from the same list the schema generator builds
 * from.
 *
 * That is the whole point, and the previous arrangement did not have it: the
 * generator read `resolvers.ts` while `HealthModule` registered
 * `HealthResolver` independently, so the two were separate lists that a test
 * comparing filenames only appeared to keep in step. A resolver added to the
 * module and not the list was in the running server and absent from the
 * committed schema; one added to the list and not the module put a field in the
 * contract that nothing answered. Both were green.
 *
 * Now there is one array. A resolver reaches the server and the schema together
 * or reaches neither.
 */
@Module({
  providers: [
    ...resolvers,
    AuthDatabase,
    AuthService,
    SmsService,
    ExtractionService,
    { provide: APP_FILTER, useClass: GraphqlErrorFilter },
  ],
})
export class GraphqlModule {}
