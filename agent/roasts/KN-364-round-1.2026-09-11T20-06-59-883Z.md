1. Yes. If a page waits for its status mutation before updating local job state, Confirm → Save makes it merge the still-`interview` record with the status-less save payload and send that whole record. If that whole-record request wins the race, it overwrites Offer. A rejected status mutation produces the same stale source state. Omitting status is safe only for patch-style saves or callers that synchronously update their authoritative record; this interface does not enforce either. Carrying the confirmed status would avoid that specific stale merge, but atomic server-side mutation/versioning is the robust solution.

2. Yes. The stories accept any status other than `interview`, including an erroneously reintroduced `status: 'new'`. `Omit` improves normal authoring but is not an exact-object guarantee in TypeScript: a variable or spread containing `JobDraft` remains assignable to `JobSaved` despite its extra `status` key.

Findings:

- **major**: The new callback contract leaves whole-record callers vulnerable to the same data loss. `onStatusChange` is synchronous and returns no pending/error result, while the displayed status remains exclusively prop-driven. A parent that updates the record only after its status request resolves can save a whole record built from stale state immediately after Confirm, reintroducing the old status server-side. [JobModal.tsx](/D:/Kar/Gandom/KarNama/apps/web/src/shared/job-modal/JobModal.tsx:74) [JobModal.tsx](/D:/Kar/Gandom/KarNama/apps/web/src/shared/job-modal/JobModal.tsx:255) [JobModal.tsx](/D:/Kar/Gandom/KarNama/apps/web/src/shared/job-modal/JobModal.tsx:639)

- **major**: The required story does not prove that Save sends no status. Both assertions only reject the original `interview` value. Change the implementation to send `status: 'new'` after selecting Offer, or send any other non-`interview` status from the Note save, and both stories pass despite violating the stated invariant. The `Omit` type does not close this runtime or spread-variable path. [JobModal.stories.tsx](/D:/Kar/Gandom/KarNama/apps/web/src/shared/job-modal/JobModal.stories.tsx:179) [JobModal.stories.tsx](/D:/Kar/Gandom/KarNama/apps/web/src/shared/job-modal/JobModal.stories.tsx:259) [JobModal.tsx](/D:/Kar/Gandom/KarNama/apps/web/src/shared/job-modal/JobModal.tsx:63)

`node agent/scripts/todo.mjs validate` passed. The focused Vitest run could not start because the read-only sandbox prevents Vite from creating its temporary config file.

VERDICT
score: 5.5
criticals: 0
one-line: Make the save/status-update contract safe for whole-record callers, then assert the `status` key is absent rather than merely not the old value