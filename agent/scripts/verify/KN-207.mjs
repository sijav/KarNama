#!/usr/bin/env node
// Verifies KN-207: the Checkbox and the Tooltip carry no prose a Docs page
// prints, and every callback prop has an fn() that a check enforces.
//
// Exit condition: Checkbox.tsx carries only comments that explain the code,
// and no prose that a Docs page prints; the prop descriptions live in
// story-docs, which already have them. onChange has an fn() in the shared args
// and a story asserts it is called with the event and the new checked value. A
// check catches a callback prop with no fn(), so this does not rest on
// remembering. Widened to the Tooltip, which broke the same rule.
//
// "Prose a Docs page prints" is asked of react-docgen-typescript, the parser
// Storybook's Controls table reads, rather than grepped for: whatever it
// reports as a description is what the page prints.
//
// NOT read-only: it edits the two files under test and restores each.

import { spawnSync } from 'node:child_process'
import { readFileSync, writeFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = dirname(dirname(dirname(dirname(fileURLToPath(import.meta.url)))))
const WEB = join(ROOT, 'apps', 'web')
const CHECKBOX = join(WEB, 'src', 'shared', 'checkbox', 'Checkbox.tsx')
const TOOLTIP = join(WEB, 'src', 'shared', 'tooltip', 'Tooltip.tsx')
const CHECKBOX_STORIES = join(WEB, 'src', 'shared', 'checkbox', 'Checkbox.stories.tsx')

const failures = []
const check = (label, run) => {
  try {
    const problem = run()
    if (problem) failures.push(`${label}: ${problem}`)
    else process.stdout.write(`  ok   ${label}\n`)
  } catch (error) {
    failures.push(`${label}: threw ${error instanceof Error ? error.message : String(error)}`)
  }
}

const { withDefaultConfig } = createRequire(join(WEB, 'package.json'))('react-docgen-typescript')

/** Every description react-docgen would print for the component in `file`. */
const printedProse = (file) => {
  const parser = withDefaultConfig({
    savePropValueAsString: true,
    skipChildrenPropWithoutDoc: false,
    propFilter: (prop) => !prop.parent?.fileName.includes('node_modules'),
  })
  return parser.parse([file]).flatMap((component) => [
    ...(component.description.trim() ? [`${component.displayName}: ${component.description.trim().slice(0, 60)}`] : []),
    ...Object.values(component.props)
      .filter((prop) => prop.description.trim())
      .map((prop) => `${component.displayName}.${prop.name}: ${prop.description.trim().slice(0, 60)}`),
  ])
}

const guard = () => {
  const result = spawnSync('npx vitest run --project unit src/shared/story-docs/guard.test.ts', { cwd: WEB, encoding: 'utf8', shell: true })
  return { code: result.status, output: `${result.stdout ?? ''}${result.stderr ?? ''}` }
}

const withEdit = (file, from, to, body) => {
  const original = readFileSync(file, 'utf8')
  if (!original.includes(from)) return `the anchor for this mutation is gone: ${from}`
  try {
    writeFileSync(file, original.replace(from, () => to))
    return body()
  } finally {
    writeFileSync(file, original)
  }
}

check('react-docgen prints no prose for the Checkbox or the Tooltip', () => {
  const prose = [...printedProse(CHECKBOX), ...printedProse(TOOLTIP)]
  return prose.length ? `a Docs page would print: ${prose.join(' | ')}` : null
})

check('MUTATION: a prop doc comment put back is seen, so the check above can fail', () =>
  withEdit(CHECKBOX, '  checked?: boolean\n', '  /** Controlled on or off. */\n  checked?: boolean\n', () => {
    const prose = printedProse(CHECKBOX)
    return prose.some((line) => line.startsWith('Checkbox.checked')) ? null : 'react-docgen did not report the restored comment, so the check cannot see prose'
  }),
)

check('the story-docs guard passes, including the fn() rule for callback props', () => {
  const { code, output } = guard()
  if (code !== 0) return `the guard fails:\n${output.slice(-800)}`
  return /every callback prop has an fn\(\) in the meta args/.test(readFileSync(join(WEB, 'src', 'shared', 'story-docs', 'guard.test.ts'), 'utf8'))
    ? null
    : 'the guard has no callback-prop rule'
})

check("THE CASE: the Checkbox without onChange's fn() fails the guard, naming the prop", () =>
  withEdit(CHECKBOX_STORIES, ', onChange: fn() },', ' },', () => {
    const { code, output } = guard()
    if (code === 0) return 'the guard passed with a callback prop unspied, so the rule rests on remembering'
    return /callback prop onChange has no fn\(\)/.test(output) ? null : `it failed, but not on the callback:\n${output.slice(-600)}`
  }),
)

check('a story asserts onChange gets the event and the new checked value', () => {
  const source = readFileSync(CHECKBOX_STORIES, 'utf8')
  if (!source.includes('toHaveBeenLastCalledWith(expect.objectContaining({ target: box }), true)')) return 'nothing asserts the call when it turns on'
  if (!source.includes('toHaveBeenLastCalledWith(expect.objectContaining({ target: box }), false)')) return 'nothing asserts the call when it turns off'
  const result = spawnSync('npx vitest run --project storybook src/shared/checkbox', { cwd: WEB, encoding: 'utf8', shell: true })
  return result.status === 0 ? null : `the Checkbox stories fail:\n${`${result.stdout}${result.stderr}`.slice(-600)}`
})

if (failures.length) {
  process.stderr.write(`\nKN-207 verify FAILED, ${failures.length} check(s):\n`)
  for (const failure of failures) process.stderr.write(`  - ${failure}\n`)
  process.exit(1)
}
process.stdout.write('\nKN-207 verify passed.\n')
