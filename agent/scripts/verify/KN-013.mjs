#!/usr/bin/env node
// Verifies KN-013: the checkbox, five states, from Figma node 204:11.
//
// Exit condition: all five states match Figma, indeterminate is set through the
// DOM PROPERTY rather than an attribute so it survives a re-render, and the
// control is reachable and toggleable by keyboard.
//
// The middle clause is the one that needs proving rather than asserting, and it
// is the one that was actually broken twice while building this. MUI does not
// set the property at all — it picks an icon and writes `data-indeterminate` —
// so a checkbox can draw a dash while telling assistive technology it is simply
// unchecked. And MUI 9 removed `inputRef` from SwitchBase, so the first attempt
// to set the property silently did nothing: an unknown prop is ignored and
// nothing about the rendered output looked wrong.
//
// So this does not read the source and agree with it. It BREAKS the assignment
// and requires the story to fail, which is the only way to show the story is
// testing the property rather than the attribute beside it.
//
// The five states are checked BY NAME, read from the card itself, KN-208. This
// used to count five passing stories, and the five were not the five: there was
// no Hover story, KeyboardOnly made up the number, and the count read as though
// every drawn state was covered.
//
// NOT read-only: it edits Checkbox.tsx and Checkbox.stories.tsx and restores
// each in a finally, and writes a vitest report under the OS temp folder.

import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { spawnSync } from 'node:child_process'
import { createRequire } from 'node:module'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const ROOT = dirname(dirname(dirname(dirname(fileURLToPath(import.meta.url)))))
const WEB = join(ROOT, 'apps', 'web')
const COMPONENT = join(WEB, 'src', 'shared', 'checkbox', 'Checkbox.tsx')
const STORIES = join(WEB, 'src', 'shared', 'checkbox', 'Checkbox.stories.tsx')

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

/**
 * The Checkbox stories, in a real browser, through the storybook project, with
 * each story's outcome BY NAME from vitest's JSON report rather than a count
 * scraped from the summary line.
 */
const stories = () => {
  const dir = mkdtempSync(join(tmpdir(), 'kn013-'))
  const report = join(dir, 'report.json')
  try {
    const result = spawnSync(
      'npx',
      ['vitest', 'run', '--project', 'storybook', 'src/shared/checkbox', '--reporter=default', '--reporter=json', `--outputFile.json="${report}"`],
      { cwd: WEB, encoding: 'utf8', shell: true },
    )
    const output = `${result.stdout ?? ''}${result.stderr ?? ''}`
    let outcomes = new Map()
    try {
      const parsed = JSON.parse(readFileSync(report, 'utf8'))
      outcomes = new Map(parsed.testResults.flatMap((file) => file.assertionResults.map((test) => [test.title, test.status])))
    } catch {
      // No report means the run itself broke; the exit code and output say how.
    }
    return { code: result.status, output, outcomes }
  } finally {
    rmSync(dir, { recursive: true, force: true })
  }
}

const withBreak = (file, from, to) => {
  const original = readFileSync(file, 'utf8')
  if (!original.includes(from)) return { stale: true, code: null, output: '', outcomes: new Map() }
  try {
    // A function replacer: a replacement STRING expands `$'` and `$&`.
    writeFileSync(file, original.replace(from, () => to))
    return stories()
  } finally {
    writeFileSync(file, original)
  }
}

/** The states the CARD names, from its description: "A, B, C and D from Figma". */
const cardStates = () => {
  const board = JSON.parse(readFileSync(join(ROOT, 'agent', 'board.json'), 'utf8'))
  const card = board.tasks.find((task) => task.id === 'KN-013')
  const list = /^(.*?) from Figma/.exec(card?.desc ?? '')?.[1]
  if (!list) throw new Error('the KN-013 card no longer lists its states as "A, B and C from Figma"')
  return list.split(/,\s*|\s+and\s+/).map((state) => state.trim()).filter(Boolean)
}

/** Story export names, from Storybook's own CSF parser rather than a regex. */
const storyExports = async () => {
  const requireFromWeb = createRequire(join(WEB, 'package.json'))
  const { loadCsf } = await import(pathToFileURL(requireFromWeb.resolve('storybook/internal/csf-tools')).href)
  const parsed = loadCsf(readFileSync(STORIES, 'utf8'), { makeTitle: (title) => title, fileName: STORIES }).parse()
  return parsed.indexInputs.map((input) => input.exportName)
}

const baseline = stories()

await check('every state the card names has a story, BY NAME', async () => {
  const states = cardStates()
  // The title says how many; the description says which. If they disagree the
  // card itself is wrong, and a check built on it would inherit the mistake.
  const counted = Number(/(\d+) states/.exec(JSON.parse(readFileSync(join(ROOT, 'agent', 'board.json'), 'utf8')).tasks.find((task) => task.id === 'KN-013').title)?.[1])
  if (counted !== states.length) return `the card's title says ${counted} states and its description names ${states.length}: ${states.join(', ')}`
  const exported = await storyExports()
  const missing = states.filter((state) => !exported.includes(state))
  return missing.length ? `no story for ${missing.join(', ')}; the stories are ${exported.join(', ')}` : null
})

await check('every one of those stories PASSES in a real browser, by name', () => {
  // The positive control, and it is not decoration: every case below requires a
  // FAILURE, and a component that is broken outright supplies failures free.
  if (baseline.outcomes.size === 0) return `no per-story report, so nothing is known by name:\n${baseline.output.slice(-1200)}`
  const notPassing = cardStates().filter((state) => baseline.outcomes.get(state) !== 'passed')
  if (notPassing.length) {
    return `${notPassing.map((state) => `${state}: ${baseline.outcomes.get(state) ?? 'did not run'}`).join(', ')}\n${baseline.output.slice(-800)}`
  }
  return baseline.code === 0 ? null : `a story outside the five failed:\n${baseline.output.slice(-800)}`
})

await check('THE CASE: breaking the DOM-property assignment fails the Indeterminate story', () => {
  // If the story asserted `data-indeterminate` instead, this break would leave
  // it green: MUI writes that attribute whether or not the property is set.
  const { stale, outcomes } = withBreak(COMPONENT, '    applyIndeterminate(input, indeterminate)', '    applyIndeterminate(input, false)')
  if (stale) return 'the assignment this card is about is no longer in Checkbox.tsx'
  return outcomes.get('Indeterminate') === 'failed'
    ? null
    : `the Indeterminate story was ${outcomes.get('Indeterminate') ?? 'not run'} with the property never set, so nothing tests it`
})

await check('Hover asserts the drawn colour: reverting it to the default border fails Hover', () => {
  const { stale, outcomes } = withBreak(
    COMPONENT,
    "        borderColor: theme.karnama.semantic['border/focus'],\n      },\n      // Scoped to the frame's own class.",
    "        borderColor: theme.karnama.semantic['border/default'],\n      },\n      // Scoped to the frame's own class.",
  )
  if (stale) return 'the hover rule changed shape, so this break no longer applies'
  return outcomes.get('Hover') === 'failed' ? null : `Hover was ${outcomes.get('Hover') ?? 'not run'} with no hover colour at all`
})

await check('Hover uses a REAL pointer: a dispatched hover in its place fails it', () => {
  // `:hover` is the browser's hit-testing, and no synthetic event sets it. If a
  // dispatched hover passed, the story would not be testing hover at all, only
  // whatever else it asserts. So the story must FAIL with one swapped in.
  const { stale, outcomes } = withBreak(STORIES, '    await browser.userEvent.hover(box)', '    await userEvent.hover(box)')
  if (stale) return 'the Hover story no longer drives the real pointer this card requires'
  return outcomes.get('Hover') === 'failed' ? null : `Hover was ${outcomes.get('Hover') ?? 'not run'} under a dispatched hover, so it proves nothing about the pointer`
})

await check('the property is set on the ELEMENT, not rendered into the markup', () => {
  // There is no `indeterminate` content attribute in HTML. Spreading it onto an
  // input would be dropped by React, so the mechanism has to be an assignment.
  const source = readFileSync(COMPONENT, 'utf8')
  if (!/\.indeterminate = /.test(source)) return 'nothing assigns the indeterminate property'
  return /slotProps=\{\{ input: \{ ref:/.test(source)
    ? null
    : 'the input node is not reached through slotProps.input.ref, which is the only way in MUI 9'
})

await check('every colour and radius comes from the Figma variables, by token name', () => {
  // Figma node 204:11 resolves to seven variables. Each maps onto a token key,
  // and naming them here means swapping one for a near-enough neighbour fails
  // rather than merely looking slightly wrong.
  const source = readFileSync(COMPONENT, 'utf8')
  const required = [
    "'bg/surface'",
    "'bg/surface-secondary'",
    "'bg/brand/default'",
    "'border/default'",
    "'border/focus'",
    "'text/on-accent'",
    'radius.sm',
    'iconSize.md',
  ]
  const missing = required.filter((token) => !source.includes(token))
  return missing.length ? `the component no longer uses ${missing.join(', ')}` : null
})

await check('no design value is written as a literal', () => {
  // Delegated to the repository's own rule rather than restated here, so the two
  // cannot disagree. It reads comments as well as code, which is worth knowing.
  const result = spawnSync('npx', ['vitest', 'run', '--project', 'unit', 'src/theme/noLiterals.test.ts'], {
    cwd: WEB,
    encoding: 'utf8',
    shell: true,
  })
  return result.status === 0 ? null : `noLiterals rejects the component:\n${`${result.stdout ?? ''}`.slice(-800)}`
})

await check('the keyboard path is a story, not a claim, and it passes', () => {
  const source = readFileSync(STORIES, 'utf8')
  if (!/export const KeyboardOnly/.test(source)) return 'there is no keyboard-only story'
  // Tab to reach it and Space to toggle it, with no pointer in the story at all.
  if (!/userEvent\.tab\(\)/.test(source)) return 'the keyboard story never tabs to the control'
  if (!/userEvent\.keyboard\(' '\)/.test(source)) return 'the keyboard story never presses Space'
  // Storybook names the test from the export, KeyboardOnly as "Keyboard Only".
  return baseline.outcomes.get('Keyboard Only') === 'passed' ? null : `the keyboard story was ${baseline.outcomes.get('Keyboard Only') ?? 'not run'}`
})

if (failures.length) {
  process.stderr.write(`\nKN-013 verify FAILED, ${failures.length} check(s):\n`)
  for (const failure of failures) process.stderr.write(`  - ${failure}\n`)
  process.exit(1)
}
process.stdout.write('\nKN-013 verify passed.\n')
