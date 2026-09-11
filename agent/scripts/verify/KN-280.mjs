#!/usr/bin/env node
// Verifies KN-280: the bound Input tells its own writes from a Controls value
// by a revision carried with each write, not by value.
//
// Exit condition: Bound tells its own writes from anything else by a revision
// carried with each write, not by value, so an arg whose value is not the one
// sent at its revision is taken, whatever the queue holds; a check in a
// production build reproduces the sequence, an edit in flight, a Controls value
// equal to it arriving after a newer edit, and ends with the field and the arg
// equal; the exception is gone from the comment; the revision never reaches the
// Input or shows as a control; and KN-253's and KN-249's verifiers still pass.
//
// How Storybook 10's preview renders, read from its runtime: an args update
// writes the store at once; a rerender reads the store when it STARTS; and one
// asked for while another is pending only sets a flag, so a single later render
// delivers whatever the store holds by then. So, in a production Storybook
// served here, in Playwright's Chromium, and in one tick:
//
// - Sequence A, the card's: a render put in flight first, then two edits
//   through the field's own input events, x7a and x7ab, then Controls set to
//   x7a through the channel the manager uses. One render delivers only the
//   final (x7a, 2), with x7a still among the field's own sends. Testing the
//   echo by value alone takes it as that edit's echo and the field stays x7ab.
// - Sequence B, unprompted: the same edits and Controls value, two renders,
//   (x7a, 1) then (x7a, 2). Watching the value alone for a change sees none in
//   the second, the pre-KN-280 failure, and the field stays x7ab.
//
// Each has a build with that one flaw put back as its positive control.
//
// NOT read-only: it edits Input.stories.tsx for its mutated builds and
// restores it in a finally, and it runs KN-253's verifier, which runs KN-249's.
// The builds go to the system temp directory and are removed.

import { spawnSync } from 'node:child_process'
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { createServer } from 'node:http'
import { createRequire } from 'node:module'
import { tmpdir } from 'node:os'
import { dirname, extname, join, normalize } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = dirname(dirname(dirname(dirname(fileURLToPath(import.meta.url)))))
const WEB = join(ROOT, 'apps', 'web')
const STORIES = join(WEB, 'src', 'shared', 'input', 'Input.stories.tsx')
const { chromium } = createRequire(join(WEB, 'package.json'))('playwright')

// The echo tested by revision and value, and by value alone.
const ECHO = 'held.sent.some((sent) => sent.revision === revision && sent.value === args.value)'
const ECHO_BY_VALUE = 'held.sent.some((sent) => sent.value === args.value)'
// A change seen in the value or the revision, and in the value alone.
const SEEN = '  if (args.value !== held.seen.value || revision !== held.seen.revision) {'
const SEEN_BY_VALUE = '  if (args.value !== held.seen.value) {'
// The Input given the args without the revision, and given them whole.
const STRIPPED = '  return <Input {...args} {...(bound && held.value !== undefined ? { value: held.value } : {})} onChange={onChange} />'
const WHOLE = '  return <Input {...given} {...(bound && held.value !== undefined ? { value: held.value } : {})} onChange={onChange} />'
// The revision kept out of every table, and left in them.
const HIDDEN = "  argTypes: { revision: { type: { name: 'number' }, table: { disable: true } } },"
const SHOWN = "  argTypes: { revision: { type: { name: 'number' } } },"
// A story with no list of offered controls, so its arg types keep the
// revision's; Default offers a list, and Storybook trims its arg types to it.
const UNLISTED = 'shared-input--controls-match-the-canvas'

const failures = []
const check = async (label, run) => {
  try {
    const problem = await run()
    if (problem) failures.push(`${label}: ${problem}`)
    else process.stdout.write(`  ok   ${label}\n`)
  } catch (error) {
    failures.push(`${label}: threw ${error instanceof Error ? error.message : String(error)}`)
  }
}

const build = (name, edits = []) => {
  const original = readFileSync(STORIES, 'utf8')
  let changed = original
  for (const [from, to] of edits) {
    if (!changed.includes(from)) throw new Error(`the anchor for this mutation is gone:\n${from}`)
    changed = changed.replace(from, () => to)
  }
  const out = mkdtempSync(join(tmpdir(), `kn280-${name}-`))
  try {
    writeFileSync(STORIES, changed)
    const result = spawnSync(`npx storybook build -o "${out}" --quiet`, { cwd: WEB, encoding: 'utf8', shell: true })
    if (result.status !== 0) throw new Error(`the Storybook build failed:\n${`${result.stdout}${result.stderr}`.slice(-800)}`)
    return out
  } finally {
    writeFileSync(STORIES, original)
  }
}

const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.woff': 'font/woff', '.png': 'image/png' }
const serve = (dir) =>
  new Promise((resolve) => {
    const server = createServer((request, response) => {
      const path = normalize(join(dir, decodeURIComponent(new URL(request.url ?? '/', 'http://local').pathname)))
      if (!path.startsWith(dir)) return void response.writeHead(403).end()
      try {
        response.writeHead(200, { 'content-type': TYPES[extname(path)] ?? 'application/octet-stream' }).end(readFileSync(path))
      } catch {
        response.writeHead(404).end()
      }
    })
    server.listen(0, '127.0.0.1', () => resolve(server))
  })

// A browser on a built Storybook, for as long as run takes.
const session = async (dir, run) => {
  const server = await serve(dir)
  const browser = await chromium.launch()
  try {
    return await run(browser, `http://127.0.0.1:${server.address().port}`)
  } finally {
    await browser.close()
    server.close()
  }
}

const open = async (browser, base, args, story = 'shared-input--default') => {
  const page = await browser.newPage()
  await page.goto(`${base}/iframe.html?id=${story}&viewMode=story&args=${args}`)
  await page.waitForFunction(() => window.__STORYBOOK_PREVIEW__?.currentRender?.phase === 'finished', null, { timeout: 30000 })
  return page
}

// What the field shows and what the store holds.
const read = (page) =>
  page.evaluate(() => {
    const preview = window.__STORYBOOK_PREVIEW__
    const stored = preview.storyStoreValue.args.get(preview.currentRender.story.id)
    return { field: document.querySelector('#storybook-root input')?.value, arg: stored.value, revision: stored.revision, leaked: document.querySelectorAll('#storybook-root [revision]').length }
  })
const settled = async (page) => {
  await page.waitForTimeout(1500)
  return read(page)
}

// In the page, in one tick: a render put in flight when asked, then two edits
// through the field's own input events, then Controls set to the first,
// through the channel the manager uses.
const sequence = (pending) => {
  const preview = window.__STORYBOOK_PREVIEW__
  const channel = window.__STORYBOOK_ADDONS_CHANNEL__
  if (pending) channel.emit('forceReRender')
  const box = document.querySelector('#storybook-root input')
  const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set
  for (const text of ['x7a', 'x7ab']) {
    setter.call(box, text)
    box.dispatchEvent(new Event('input', { bubbles: true }))
  }
  channel.emit('updateStoryArgs', { storyId: preview.currentRender.story.id, updatedArgs: { value: 'x7a' } })
}

const run = async (browser, base, pending) => {
  const page = await open(browser, base, 'value:x7')
  try {
    await page.evaluate(sequence, pending)
    return await settled(page)
  } finally {
    await page.close()
  }
}

const emit = (page, event, updatedArgs) =>
  page.evaluate(({ event, updatedArgs }) => {
    const preview = window.__STORYBOOK_PREVIEW__
    window.__STORYBOOK_ADDONS_CHANNEL__.emit(event, { storyId: preview.currentRender.story.id, ...(updatedArgs ? { updatedArgs } : {}) })
  }, { event, updatedArgs })

const typeInto = async (page, text) => {
  await page.locator('#storybook-root input').click()
  await page.keyboard.press('End')
  await page.keyboard.type(text)
}

// The Controls panel's rows in the manager after an edit, and the Docs page's
// args table.
const tables = async (browser, base) => {
  const page = await browser.newPage({ viewport: { width: 1400, height: 1000 } })
  try {
    await page.goto(`${base}/index.html?path=/story/shared-input--default&args=value:x7`)
    const frame = page.frameLocator('#storybook-preview-iframe')
    await frame.locator('#storybook-root input').waitFor({ timeout: 30000 })
    await frame.locator('#storybook-root input').click()
    await page.keyboard.press('End')
    await page.keyboard.type('ab')
    await page.getByRole('tab', { name: /^Controls/ }).first().click()
    await page.waitForTimeout(800)
    const controls = await page.evaluate(() => [...document.querySelectorAll('#storybook-panel-root table tbody tr')].map((row) => row.querySelector('td')?.innerText?.trim()).filter(Boolean))
    const address = page.url()
    await page.goto(`${base}/iframe.html?id=shared-input--docs&viewMode=docs`)
    await page.waitForSelector('table.docblock-argstable tbody tr', { timeout: 30000 })
    const docs = await page.evaluate(() => [...document.querySelectorAll('table.docblock-argstable tbody tr')].map((row) => row.querySelector('td')?.innerText?.trim()).filter(Boolean))
    return { controls, docs, address }
  } finally {
    await page.close()
  }
}

// The revision as a story with no list of offered controls declares it, the
// arg type any panel built from it would read.
const declared = async (browser, base) => {
  const page = await open(browser, base, '', UNLISTED)
  try {
    return await page.evaluate(() => window.__STORYBOOK_PREVIEW__.currentRender.story.argTypes.revision ?? null)
  } finally {
    await page.close()
  }
}

const main = async () => {
  await check('the Input stories pass under Vitest', () => {
    const result = spawnSync('npx vitest run --project storybook src/shared/input', { cwd: WEB, encoding: 'utf8', shell: true })
    return result.status === 0 ? null : `they fail:\n${`${result.stdout}${result.stderr}`.slice(-800)}`
  })

  await check('Bound tests an echo by revision and value and watches both for a change, the comment names no exception, and KN-253 no longer does either', () => {
    const source = readFileSync(STORIES, 'utf8')
    const missing = [
      ['the echo by revision and value', ECHO],
      ['a change in either', SEEN],
      ['the write carrying its revision', 'updateArgs({ value, revision: at })'],
    ].filter(([, text]) => !source.includes(text))
    if (missing.length) return `Bound does not have ${missing.map(([what]) => what).join(', ')}`
    if (/cannot tell apart|the one exception/.test(source)) return 'a comment still names the exception'
    const kn253 = readFileSync(join(ROOT, 'agent', 'scripts', 'verify', 'KN-253.mjs'), 'utf8')
    return /the one exception the/.test(kn253) ? "KN-253's verifier still names the exception" : null
  })

  const fixed = build('fixed')
  try {
    await session(fixed, async (browser, base) => {
      await check('THE CASE, sequence A: one render bringing Controls equal to an edit still in flight ends with the field and the arg equal', async () => {
        const after = await run(browser, base, true)
        process.stdout.write(`       A: field ${after.field}, arg ${after.arg}, revision ${after.revision}\n`)
        if (after.field !== 'x7a' || after.arg !== 'x7a') return `field ${after.field} and arg ${after.arg}, where both should be x7a`
        return typeof after.revision === 'number' ? null : `the stored revision is a ${typeof after.revision}`
      })

      await check('sequence B: the same edits and Controls value over two renders end with the field and the arg equal', async () => {
        const after = await run(browser, base, false)
        process.stdout.write(`       B: field ${after.field}, arg ${after.arg}, revision ${after.revision}\n`)
        return after.field === 'x7a' && after.arg === 'x7a' ? null : `field ${after.field} and arg ${after.arg}, where both should be x7a`
      })

      await check('a revision in the address bar: dropped where a story lists its controls, read as a number where it does not, and the next write counts on from what the store holds', async () => {
        const listed = await open(browser, base, 'value:x7;revision:5')
        try {
          const before = await read(listed)
          await typeInto(listed, 'a')
          const after = await settled(listed)
          process.stdout.write(`       Default: loaded ${JSON.stringify(before.revision)}, after one key ${JSON.stringify(after.revision)}\n`)
          if (after.field !== 'x7a' || after.arg !== 'x7a') return `Default: field ${after.field} and arg ${after.arg} after one key`
          if (typeof before.revision !== 'number' || after.revision !== before.revision + 1) return `Default: loaded ${JSON.stringify(before.revision)}, wrote ${JSON.stringify(after.revision)}`
        } finally {
          await listed.close()
        }
        const unlisted = await open(browser, base, 'value:x7;revision:5', UNLISTED)
        try {
          const before = await read(unlisted)
          await typeInto(unlisted, 'a')
          const after = await settled(unlisted)
          process.stdout.write(`       ControlsMatchTheCanvas: loaded ${JSON.stringify(before.revision)}, after one key ${JSON.stringify(after.revision)}\n`)
          if (before.revision !== 5) return `ControlsMatchTheCanvas: the loaded revision is ${JSON.stringify(before.revision)}, not the number 5`
          if (after.field !== 'x7a' || after.arg !== 'x7a') return `ControlsMatchTheCanvas: field ${after.field} and arg ${after.arg} after one key`
          return after.revision === 6 ? null : `ControlsMatchTheCanvas: the write was revision ${JSON.stringify(after.revision)}, not 6`
        } finally {
          await unlisted.close()
        }
      })

      await check('after a reset, a new value set in Controls and typed into ends with the field and the arg equal', async () => {
        const page = await open(browser, base, 'value:x7')
        try {
          await typeInto(page, 'ab')
          await settled(page)
          await emit(page, 'resetStoryArgs')
          await page.waitForTimeout(800)
          await emit(page, 'updateStoryArgs', { value: 'q1' })
          await page.waitForTimeout(800)
          await typeInto(page, 'x')
          const after = await settled(page)
          process.stdout.write(`       after the reset: field ${after.field}, arg ${after.arg}, revision ${after.revision}\n`)
          return after.field === 'q1x' && after.arg === 'q1x' ? null : `field ${after.field} and arg ${after.arg}, where both should be q1x`
        } finally {
          await page.close()
        }
      })

      await check('the revision never reaches the Input: nothing in the story carries it, though the store does', async () => {
        const page = await open(browser, base, 'value:x7')
        try {
          await typeInto(page, 'ab')
          const after = await settled(page)
          if (typeof after.revision !== 'number' || after.revision < 1) return `the store holds no written revision: ${JSON.stringify(after.revision)}`
          return after.leaked === 0 ? null : `${after.leaked} element(s) in the story carry a revision attribute`
        } finally {
          await page.close()
        }
      })

      await check('no control shows it: not in the Controls panel, not in the Docs table, and a story that lists no controls declares it out of every table', async () => {
        const seen = await tables(browser, base)
        process.stdout.write(`       controls ${seen.controls.join(', ')}; docs ${seen.docs.join(', ')}; the address after an edit: ${seen.address.slice(seen.address.indexOf('args='))}\n`)
        if (!seen.controls.includes('value') || !seen.docs.includes('value')) return 'the tables did not load, so this read nothing'
        if (seen.controls.includes('revision') || seen.docs.includes('revision')) return 'a revision row shows'
        const argType = await declared(browser, base)
        return argType?.table?.disable === true && argType?.type?.name === 'number' ? null : `the story declares the revision as ${JSON.stringify(argType)}`
      })
    })
  } finally {
    rmSync(fixed, { recursive: true, force: true })
  }

  await check('the positive control for A: with the echo tested by value alone, sequence A ends with the field and the arg apart', async () => {
    const control = build('echo-by-value', [[ECHO, ECHO_BY_VALUE]])
    try {
      return await session(control, async (browser, base) => {
        const after = await run(browser, base, true)
        process.stdout.write(`       echo by value, A: field ${after.field}, arg ${after.arg}\n`)
        return after.field === 'x7ab' && after.arg === 'x7a' ? null : `field ${after.field} and arg ${after.arg}: sequence A did not reproduce the bug`
      })
    } finally {
      rmSync(control, { recursive: true, force: true })
    }
  })

  await check('the positive control for B: with a change watched in the value alone, sequence B ends with the field and the arg apart', async () => {
    const control = build('seen-by-value', [[SEEN, SEEN_BY_VALUE]])
    try {
      return await session(control, async (browser, base) => {
        const after = await run(browser, base, false)
        process.stdout.write(`       seen by value, B: field ${after.field}, arg ${after.arg}\n`)
        return after.field === 'x7ab' && after.arg === 'x7a' ? null : `field ${after.field} and arg ${after.arg}: sequence B did not reproduce the bug`
      })
    } finally {
      rmSync(control, { recursive: true, force: true })
    }
  })

  await check('the other controls: the whole args spread onto the Input put a revision on it, and a table row left on is declared shown', async () => {
    const leaky = build('leaky', [[STRIPPED, WHOLE], [HIDDEN, SHOWN]])
    try {
      return await session(leaky, async (browser, base) => {
        const page = await open(browser, base, 'value:x7')
        try {
          await typeInto(page, 'ab')
          const after = await settled(page)
          if (after.leaked === 0) return 'with the whole args spread, nothing carried the revision, so the leak check reads nothing'
        } finally {
          await page.close()
        }
        const argType = await declared(browser, base)
        if (!argType) return 'the unlisted story declares no revision at all, so the table check reads nothing'
        return argType.table?.disable === true ? 'with the table row left on, the story still declares it hidden' : null
      })
    } finally {
      rmSync(leaky, { recursive: true, force: true })
    }
  })

  await check("KN-253's verifier passes, and with it KN-249's", () => {
    const result = spawnSync('node', [join(ROOT, 'agent', 'scripts', 'verify', 'KN-253.mjs')], { cwd: ROOT, encoding: 'utf8' })
    const output = `${result.stdout}${result.stderr}`
    if (result.status !== 0) return `it fails:\n${output.slice(-800)}`
    return /ok\s+KN-249's verifier still passes/.test(output) ? null : "KN-253 passed without running KN-249's"
  })
}

await main()
if (failures.length) {
  process.stderr.write(`\nKN-280 verify FAILED, ${failures.length} check(s):\n`)
  for (const failure of failures) process.stderr.write(`  - ${failure}\n`)
  process.exit(1)
}
process.stdout.write('\nKN-280 verify passed.\n')
