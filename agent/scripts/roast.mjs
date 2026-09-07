#!/usr/bin/env node
// The roast harness.
//
// Hands one finished task to Codex, running `gpt-5.6-terra`, with a clean
// context and read access to the repository, and archives the reply under
// `agent/roasts/`.
//
// The point is not the score. The point is that a model which did not write the
// code reads it without knowing what it was meant to do, so it sees the thing
// that is there rather than the thing that was intended.
//
// Zero dependencies, same reason as todo.mjs.

import { spawnSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const AGENT_DIR = dirname(dirname(fileURLToPath(import.meta.url)))
const ROOT = dirname(AGENT_DIR)
const BOARD_PATH = join(AGENT_DIR, 'board.json')
const ROAST_DIR = join(AGENT_DIR, 'roasts')

const MODEL = 'gpt-5.6-terra'
/** Past this the prompt costs more than the extra context is worth. */
const DIFF_LIMIT = 180_000

const fail = (message) => {
  process.stderr.write(`${message}\n`)
  process.exit(1)
}

// ---------------------------------------------------------------- arguments

const parseArgs = (argv) => {
  const flags = {}
  const positional = []
  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index]
    if (!token.startsWith('--')) {
      positional.push(token)
      continue
    }
    const equals = token.indexOf('=')
    const key = equals === -1 ? token.slice(2) : token.slice(2, equals)
    let value
    if (equals !== -1) value = token.slice(equals + 1)
    else if (argv[index + 1] !== undefined && !argv[index + 1].startsWith('--')) value = argv[(index += 1)]
    else value = true
    if (key in flags) flags[key] = Array.isArray(flags[key]) ? [...flags[key], value] : [flags[key], value]
    else flags[key] = value
  }
  return { flags, positional }
}

const { flags, positional } = parseArgs(process.argv.slice(2))
const taskId = positional[0]

if (!taskId) {
  fail(
    [
      'npm run roast -- <task-id> --summary "what you actually did" --ask "a question" [--ask "another"]',
      '',
      '  --summary   honest account of the change, including what you are unsure about',
      '  --ask       a question aimed at this task\'s specific mechanism. Repeatable.',
      '              Generic questions get generic answers. Ask where you are weakest.',
      '  --base      git ref to diff against, default HEAD',
      '  --model     override the model, default ' + MODEL,
      '',
    ].join('\n'),
  )
}

// ---------------------------------------------------------------- the task

if (!existsSync(BOARD_PATH)) fail('no agent/board.json, nothing to roast against')
const board = JSON.parse(readFileSync(BOARD_PATH, 'utf8'))
const task = board.tasks.find((entry) => entry.id === taskId)
if (!task) fail(`roast: ${taskId} is not on the board`)

const summary = flags.summary && flags.summary !== true ? String(flags.summary) : ''
if (!summary) {
  fail('roast needs --summary. A reviewer who does not know what you claim to have done cannot tell you that you are wrong.')
}

const questions = (Array.isArray(flags.ask) ? flags.ask : flags.ask && flags.ask !== true ? [flags.ask] : []).map(String)
if (!questions.length) {
  fail(
    'roast needs at least one --ask. The questions are what make this useful: a generic "review this" gets a generic reply that finds nothing.',
  )
}

// ---------------------------------------------------------------- the diff

const git = (args) => spawnSync('git', args, { cwd: ROOT, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 })

// A roast has to be OF something. Reviewing a dirty worktree produces a verdict
// that cannot be tied to any revision, so the same clear round stays "valid"
// while the code underneath it keeps changing. Commit first, then roast the
// commit, and `move done` can check that nothing moved since.
const dirty = (git(['status', '--porcelain']).stdout ?? '').trim()
if (dirty) {
  fail(
    `The worktree is dirty, so this roast could not be tied to any revision:\n${dirty}\n\n` +
      'Commit the work first, then roast the commit. That is what lets the board refuse to close a task whose code changed after it was reviewed.',
  )
}

const hasCommits = git(['rev-parse', '--verify', 'HEAD']).status === 0
const head = hasCommits ? (git(['rev-parse', 'HEAD']).stdout ?? '').trim() : ''
const base = flags.base && flags.base !== true ? String(flags.base) : 'HEAD~1'

let diff = ''
let diffNote = ''
if (hasCommits) {
  diff = git(['diff', base]).stdout ?? ''
  const untracked = (git(['ls-files', '--others', '--exclude-standard']).stdout ?? '').trim()
  if (untracked) diff += `\n\n--- untracked files (content not shown, read them in the repo) ---\n${untracked}\n`
  diffNote = `\`git diff ${base}\`, plus a list of untracked paths.`
} else {
  const tracked = (git(['ls-files']).stdout ?? '').trim()
  const untracked = (git(['ls-files', '--others', '--exclude-standard']).stdout ?? '').trim()
  diff = `The repository has no commits yet, so there is no diff. These are the files that exist:\n\n${[tracked, untracked].filter(Boolean).join('\n')}\n`
  diffNote = 'No commits yet, so a file listing stands in for the diff. Read the files directly.'
}

if (diff.length > DIFF_LIMIT) {
  diff = `${diff.slice(0, DIFF_LIMIT)}\n\n[... truncated at ${DIFF_LIMIT} characters. Read the rest from the repository directly ...]`
}

// ---------------------------------------------------------------- the prompt

const round = (task.roasts?.length ?? 0) + 1
const priorRounds = (task.roasts ?? [])
  .map((entry) => `  round ${entry.round}: score ${entry.score}, ${entry.criticals} critical(s)`)
  .join('\n')

const prompt = `You are reviewing one unit of work in a repository you have read access to. Read the
actual files, do not rely only on the diff below. You did not write this code and
you have no stake in it being good.

Be adversarial and specific. A finding that names an input, a state, or a
sequence that produces a wrong result is worth more than a page of style notes.
If the work is genuinely sound, say so plainly rather than inventing findings to
look thorough. Do not soften. The author has asked to be told what is wrong.

## The task

id: ${task.id}
title: ${task.title}
area: ${task.area}
severity: ${task.severity}

What it was meant to do:
${task.desc}

Why it exists:
${task.why}

The condition under which it may be called done:
${task.exit}
${priorRounds ? `\nPrevious roast rounds on this same task:\n${priorRounds}\n(This is round ${round}. Check whether the earlier findings were actually fixed, not merely acknowledged.)\n` : ''}
## What the author says they did

${summary}

## What the author specifically wants challenged

${questions.map((question, index) => `${index + 1}. ${question}`).join('\n')}

## The change

${diffNote}

\`\`\`diff
${diff}
\`\`\`

## Project rules the work must satisfy

Read \`AGENTS.md\` and \`DESIGN.md\` at the repository root and hold the change to
them. The ones that are violated most often:

- Every user-facing string goes through lingui with an ENGLISH message id. A
  bare string literal in a .tsx file is a defect even when it is in English.
- No colour, spacing or radius literal in a component. Everything resolves
  through the theme, which is generated from the Figma tokens.
- Components must match the Figma design exactly, not approximately. Sizes,
  states, and the set of variants are all part of the contract.
- No TypeScript escape hatches: no \`as\` to force a mismatch, no \`@ts-ignore\`,
  no \`@ts-expect-error\`, no \`any\`.
- Every component has a story, and the story renders from its args so the
  Controls panel actually drives the canvas.
- Documentation prose lives in markdown under story-docs, never as JSDoc in a
  .tsx file.
- Coverage is meant to be total. A component with no test that exercises its
  behaviour has not been finished, and a test that asserts nothing is worse than
  no test because it reports green.

## How to answer

Answer the author's questions first, directly, one by one.

Then list findings. Give each one a severity from: critical, major, minor, nit.
"critical" means the exit condition above is not actually met, or the change is
wrong in a way that produces incorrect behaviour or data. Cite file and line.

Finish with exactly this block, on its own lines, and nothing after it:

VERDICT
score: <a number from 0 to 10, one decimal>
criticals: <how many findings you rated critical>
one-line: <the single most important thing to fix, or "nothing" if there is none>
`

// ---------------------------------------------------------------- run codex

mkdirSync(ROAST_DIR, { recursive: true })
const stamp = new Date().toISOString().replace(/[:.]/g, '-')
const promptPath = join(ROAST_DIR, `${task.id}-round-${round}.prompt.md`)
const replyPath = join(ROAST_DIR, `${task.id}-round-${round}.${stamp}.md`)
writeFileSync(promptPath, prompt, 'utf8')

const model = flags.model && flags.model !== true ? String(flags.model) : MODEL

// On Windows `codex` is a .cmd shim, and Node refuses to spawn one without a
// shell, so spawnSync fails with ENOENT before it ever reaches the model. With
// a shell the whole command is re-parsed as a string, so any argument that
// could hold a space has to be quoted by us.
const isWindows = process.platform === 'win32'
const shellQuote = (value) => (/[\s"^&|<>]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value)

const runCodex = (args, options) =>
  spawnSync('codex', isWindows ? args.map(shellQuote) : args, { shell: isWindows, ...options })

// Preflight. Building a prompt that can run to a couple of hundred kilobytes
// and only then discovering the binary is unreachable wastes the whole round,
// and the failure reads like a model problem rather than a PATH problem.
const version = runCodex(['--version'], { encoding: 'utf8' })
if (version.error || version.status !== 0) {
  fail(
    `codex is not runnable from here: ${version.error?.message ?? `exit ${version.status}`}\n` +
      'Install it, or put it on PATH. The roast step is not optional, so this is a hard stop rather than a skip.',
  )
}

process.stderr.write(`Roasting ${task.id}, round ${round}, with ${model}. This takes a few minutes.\n`)

const result = runCodex(['exec', '-m', model, '--sandbox', 'read-only', '-C', ROOT, '-o', replyPath, '-'], {
  input: prompt,
  encoding: 'utf8',
  stdio: ['pipe', 'inherit', 'inherit'],
  maxBuffer: 64 * 1024 * 1024,
})

if (result.error) fail(`could not run codex: ${result.error.message}`)
if (!existsSync(replyPath)) fail(`codex exited ${result.status} without writing a reply to ${replyPath}`)
if (readFileSync(replyPath, 'utf8').trim() === '') fail(`codex wrote an empty reply to ${replyPath}`)

const reply = readFileSync(replyPath, 'utf8')

// The sidecar is what makes the archive evidence rather than an assertion. Round
// 2 of this very task showed why: `todo.mjs` accepted any file containing the
// word VERDICT, and the harness's own PROMPT file contains the verdict template,
// so a passing round could be recorded against it with one flag. The board now
// requires this manifest, and the digest has to match the reply it names.
const metaPath = `${replyPath}.meta.json`
writeFileSync(
  metaPath,
  `${JSON.stringify(
    {
      task: task.id,
      round,
      model,
      head,
      base,
      // What the reviewer was actually looking at. `move done` refuses to close
      // a task whose card changed after the round that cleared it.
      cardDigest: createHash('sha256')
        .update(
          JSON.stringify({
            title: task.title,
            desc: task.desc,
            why: task.why,
            exit: task.exit,
            area: task.area,
            severity: task.severity,
            points: task.points,
            parent: task.parent,
          }),
        )
        .digest('hex'),
      replyDigest: createHash('sha256').update(reply).digest('hex'),
      at: new Date().toISOString(),
    },
    null,
    2,
  )}\n`,
  'utf8',
)

const scoreMatch = reply.match(/^\s*score:\s*([0-9]+(?:\.[0-9]+)?)/im)
const criticalMatch = reply.match(/^\s*criticals:\s*([0-9]+)/im)

process.stdout.write(`\n${'='.repeat(72)}\n`)
process.stdout.write(`Roast archived at ${replyPath}\n`)
if (scoreMatch && criticalMatch) {
  process.stdout.write(`Codex reported: score ${scoreMatch[1]}, ${criticalMatch[1]} critical(s).\n`)
} else {
  process.stdout.write('Codex did not emit a parseable VERDICT block. Read the reply and judge it yourself.\n')
}
process.stdout.write(
  [
    '',
    'This is EVIDENCE, not a verdict. Now roast the roast:',
    '',
    '  - reproduce each finding, or say precisely what the reviewer misread',
    '  - a finding you drop without a reason is a finding you did not check',
    '  - real but out of scope becomes its own board entry, with all nine fields',
    '',
    `Then record YOUR adjudicated measurement, not the number above:`,
    `  npm run todo -- roast ${task.id} --score <yours> --criticals <yours> --file ${replyPath.replace(ROOT, '.').replace(/\\/g, '/')}`,
    '',
    'And relay the roast to the owner in your reply. They cannot see this output.',
    '',
  ].join('\n'),
)
