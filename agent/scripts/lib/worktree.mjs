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
 * The loop's own files. Anchored, so the three match exactly. Unanchored, a work
 * file named `agent/board.json.bak` was treated as bookkeeping and hidden.
 *
 * Under `roasts/` only the archive itself is bookkeeping: a `.md` reply and its
 * `.md.meta.json` manifest, nothing else. Excluding the whole directory made it
 * a blind spot that anything could be parked in. A task's `verify` command could
 * point at `node agent/roasts/close-check.mjs`, and editing that script after a
 * clear roast changed neither the card digest nor any path the work-change check
 * could see, so the close ran a checker nobody had reviewed.
 */
export const BOOKKEEPING =
  /^agent\/(?:board\.json|TODO_BOARD\.md|STATE\.md)$|^agent\/roasts\/[^/]+\.md(?:\.meta\.json)?$/

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

// `workChangedSince` used to live here, comparing work paths between two
// commits. It existed for one caller: the close gate's check that nothing had
// changed since the roast that cleared the task. The owner's rule of 2026-09-10
// closes a task BEFORE its roast, so there is no reviewed commit to compare
// against and the function had no remaining caller. Removed rather than left
// exported, because an unused helper is something the next person wires back in.
//
// The lesson it carried is kept in `workingChanges` above and is still live
// there: a rename has TWO paths, and reading only one of them let a rename of
// real source INTO `agent/roasts/` read as bookkeeping and disappear.
