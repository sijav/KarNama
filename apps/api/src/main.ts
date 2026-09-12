import 'reflect-metadata'

import { ConfigService } from '@nestjs/config'
import { NestFactory } from '@nestjs/core'
import type { NestExpressApplication } from '@nestjs/platform-express'
import { pathToFileURL } from 'node:url'
import { parseEnv } from './config/env.js'

/**
 * Boot.
 *
 * `reflect-metadata` first, before anything that reads a decorator, which is
 * every Nest module. Importing it later is a class of failure that reads as a
 * broken schema rather than a missing polyfill.
 *
 * The environment is parsed HERE, before `app.module` is imported, and that
 * ordering is the reason the module is imported dynamically.
 * `ConfigModule.forRoot({ validate })` runs when `app.module` is IMPORTED, so
 * with a static import a missing variable threw during module evaluation, above
 * any catch in this file. The message was right and arrived wrapped in a Nest
 * exception handler and five frames of stack through `ModuleJob.run`. Whoever
 * is reading a failed deploy log should get one sentence naming the variable.
 */
export const bootstrap = async (): Promise<{ port: number; url: string }> => {
  const env = parseEnv(process.env)

  const { AppModule } = await import('./app.module.js')
  const app = await NestFactory.create<NestExpressApplication>(AppModule, { bufferLogs: false })
  app.set('trust proxy', env.TRUST_PROXY_HOPS)
  const config = app.get(ConfigService)

  // Only the origin the web app is served from. `origin: true` reflects
  // whatever asked, which is not a CORS policy, it is the absence of one.
  app.enableCors({ origin: config.get<string>('WEB_ORIGIN') ?? env.WEB_ORIGIN, credentials: true })

  const port = config.get<number>('PORT') ?? env.PORT
  await app.listen(port)
  return { port, url: await app.getUrl() }
}

// Guarded rather than a bare call, so importing this file in a test does not
// start a server on a real port. `import.meta.url` against argv[1] is the ESM
// spelling of `require.main === module`; this workspace is ESM because NestJS 12
// ships ESM-only packages and a CommonJS build cannot `require` them at all.
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  bootstrap().catch((error: unknown) => {
    process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`)
    process.exit(1)
  })
}
