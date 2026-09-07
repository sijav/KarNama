// The digest of what a reviewer was actually shown.
//
// One definition, imported by both the board and the harness. It was two
// copies, which is the same shape of bug the worktree filter had: two rules that
// have to agree, kept in two places, silently drifting.
//
// `verify` is part of it. Leaving it out meant a task could be closed against a
// check nobody reviewed: record a clear round, `set <id> --verify "<something
// that always passes>"`, commit that as bookkeeping, and close. The manifest
// still matched, no work path had changed, and the substituted command passed.
// The command that decides whether a task is finished is part of the task.

import { createHash } from 'node:crypto'

export const cardDigest = (task) =>
  createHash('sha256')
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
        verify: task.verify ?? null,
      }),
    )
    .digest('hex')
