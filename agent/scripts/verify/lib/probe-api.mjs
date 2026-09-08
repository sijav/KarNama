#!/usr/bin/env node
// Starts the BUILT API, waits for it, checks GraphiQL and the health query, and
// stops it. Exits 0 when everything answered, non-zero with a sentence when it
// did not.
//
// A file rather than an inline `node -e` in the verifier, for two reasons. The
// escaped version crashed libuv on Windows on the way out, `Assertion failed:
// !(handle->flags & UV_HANDLE_CLOSING)`, which looked like a server failure and
// was a quoting failure. And shell-escaped scripts have produced silently wrong
// results repeatedly in this repository, which is a bad property for the file
// whose job is to say whether the server works.
//
// Usage: node probe-api.mjs <apiDir> <port>

import { spawn } from 'node:child_process'
import { join } from 'node:path'

const [apiDir, port] = process.argv.slice(2)
if (!apiDir || !port) {
  process.stderr.write('usage: probe-api.mjs <apiDir> <port>\n')
  process.exit(2)
}

const url = `http://localhost:${port}/graphql`
const child = spawn(process.execPath, [join(apiDir, 'dist', 'main.js')], {
  cwd: apiDir,
  env: { ...process.env, PORT: port },
  stdio: ['ignore', 'pipe', 'pipe'],
  // Detached so the whole tree can be signalled, and unref'd so this process is
  // free to exit even if the child is slow to die.
  detached: false,
})

let serverOutput = ''
child.stdout.on('data', (chunk) => (serverOutput += String(chunk)))
child.stderr.on('data', (chunk) => (serverOutput += String(chunk)))

const finish = (code, message) => {
  if (message) process.stderr.write(`${message}\n`)
  if (code !== 0 && serverOutput) process.stderr.write(`server said:\n${serverOutput.slice(-800)}\n`)
  // Kill first, then let the event loop drain on its own. Calling process.exit
  // inside the kill's callback is what tripped the libuv assertion.
  child.kill()
  process.exitCode = code
}

const deadline = Date.now() + 60_000

const attempt = async () => {
  if (Date.now() > deadline) return finish(1, 'the server never became reachable')

  try {
    const page = await fetch(url, { headers: { accept: 'text/html' } })
    const html = await page.text()
    if (!/graphiql|graphql/i.test(html)) return finish(1, 'the GraphQL endpoint served no playground')

    const answer = await fetch(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ query: '{ health { status environment uptimeSeconds } }' }),
    })
    const body = await answer.json()
    const health = body?.data?.health
    if (health?.status !== 'ok') return finish(1, `health did not answer ok: ${JSON.stringify(body)}`)
    if (typeof health.uptimeSeconds !== 'number') return finish(1, 'uptimeSeconds is not a number')
    if (typeof health.environment !== 'string') return finish(1, 'environment is not a string')
    return finish(0)
  } catch {
    // Not up yet, or refused. Both are ordinary while it boots.
    setTimeout(() => void attempt(), 500)
    return undefined
  }
}

child.on('error', (error) => {
  finish(1, `the server could not be started: ${error.message}`)
})

setTimeout(() => void attempt(), 500)
