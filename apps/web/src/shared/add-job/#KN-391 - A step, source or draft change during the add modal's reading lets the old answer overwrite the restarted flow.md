# KN-391 · A step, source or draft change during the add modal's reading lets the old answer overwrite the restarted flow

Beside the add modal. Recorded after the fix, on 2026-09-11, under the owner's
rules of that day.

**Exit condition, from the board.** A restart from changed props drops any
reading in flight, by the flow the answer belongs to rather than a ref written
during render, so a late answer applies only to the flow that started it; a
story changes the step while the loading panel waits and resolves the reading
after, and the new step stays.

## What was done

- A reading's answer now settles through a functional update that applies it
  only when the flow is still loading and loading since this reading began,
  the `startedAt` it set. KN-361's restart replaces the flow and never with a
  loading one, since the step a modal opens on excludes loading, so an answer
  it left behind lands nowhere. The reading counter still drops an answer after
  leaving or a later reading; nothing new is written to a ref during render.
- RestartWhileReading: Extract, the loading panel, the parent changes the step
  to Manual, the empty form, then the held reading is settled with what it
  found; the form stays empty. On the old modal the answer filled it.
