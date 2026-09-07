// What counts as an unreviewed change to the WORK, as opposed to the loop's own
// bookkeeping.
//
// This lives in one place because it was in two, and they disagreed. The harness
// rejected any dirty worktree while the board ignored bookkeeping, so the
// documented sequence in RALPH.md step 4, `move <id> review` and then
// `npm run roast`, deadlocked: the move wrote `board.json`, and the harness
// refused the tree it had just dirtied. The only reason it was never hit is that
// the documented `review` step was being skipped.

import { spawnSync } from 'node:child_process'

/**
 * The loop's own files. Anchored, so the three match exactly and only `roasts/`
 * matches as a directory prefix. Unanchored, a work file named
 * `agent/board.json.bak` was treated as bookkeeping and its changes hidden.
 */
export const BOOKKEEPING = /^agent\/(?:board\.json|TODO_BOARD\.md|STATE\.md)$|^agent\/roasts\/./

const isBookkeeping = (path) => BOOKKEEPING.test(path)

/**
 * Every path a `git status --porcelain` line refers to.
 *
 * A rename or copy prints two paths, `R  old -> new`, and taking only the
 * leading one meant a rename OUT of `agent/roasts/` into real source was read as
 * bookkeeping and hidden from the close check. Both sides count, so a change is
 * work when either end of it is work.
 */
const pathsInStatusLine = (line) => {
  const body = line.slice(3).trim()
  const arrow = body.indexOf(' -> ')
  const halves = arrow === -1 ? [body] : [body.slice(0, arrow), body.slice(arrow + 4)]
  return halves.map((half) => half.trim().replace(/^"|"$/g, ''))
}

const run = (root, args) => spawnSync('git', args, { cwd: root, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 })

/** Uncommitted changes to the work, ignoring the loop's bookkeeping. */
export const workingChanges = (root) =>
  (run(root, ['status', '--porcelain']).stdout ?? '')
    .split('\n')
    .filter((line) => line.trim())
    // `-z` would avoid the quoting entirely, but the porcelain v1 text form is
    // what a human reads in the error, so parse it and count a line as work
    // whenever ANY path it names is work.
    .filter((line) => pathsInStatusLine(line).some((path) => !isBookkeeping(path)))
    .map((line) => line.trim())

/** Work paths that changed between two commits, ignoring the loop's bookkeeping. */
export const workChangedSince = (root, from, to) =>
  (run(root, ['diff', '--name-only', from, to]).stdout ?? '')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .filter((path) => !isBookkeeping(path))
