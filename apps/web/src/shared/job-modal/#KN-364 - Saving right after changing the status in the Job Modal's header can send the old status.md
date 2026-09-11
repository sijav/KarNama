# KN-364 · Saving right after changing the status in the Job Modal's header can send the old status

Beside the Job Modal. Recorded after the fix, on 2026-09-11, under the owner's
rules of that day.

**Exit condition, from the board.** Save sends the status last chosen in the
header, or none at all, and a story changes the status and saves before the job
prop changes, and sees the new status or no status in onSave.

## What was done

- None at all: `JobSaved` is `Omit<JobDraft, 'status'>` with the description
  and the note, and Save leaves the status out. DESIGN.md already says the
  header's Status Control changes the status at once rather than with Save, so
  the status reaches the page through `onStatusChange` alone, and a page that
  saves the whole record takes it from its own state. The type makes a status
  in Save's payload a compile error.
- ChangeStatus now presses Save straight after confirming a new status in the
  Change Status modal, before the job prop changes, and finds the old status
  absent from what Save hands over; the Note story checks the same of a plain
  save. Both failed on the old payload. The matcher names the job's status, a
  typed string, since the lint refuses `expect.anything()`, which is typed any.
- Nothing visual changed, so there was nothing new to look at.
