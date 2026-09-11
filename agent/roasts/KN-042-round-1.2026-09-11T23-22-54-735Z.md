1. Routing walk

- Hard refresh on `#/network`: works. `App` initializes from the hash and renders `NetworkScreen`.
- Back button after navigation: works for normal known hashes, via `hashchange`.
- Pasting `#/add`: works initially, it opens the add modal.
- Unknown hash: state and address disagree. `#/nowhere` renders the jobs board, but the URL remains `#/nowhere` indefinitely. [routes.ts:15](D:/Kar/Gandom/KarNama/apps/web/src/app/routes.ts:15)
- Two tabs: routes remain independent, but records do not. Each tab loads one snapshot and overwrites the other tab’s entire board on its next write.
- Closing add through cancel normalizes to `#/jobs`, but saving does not. A successful save leaves `current === 'add'`, so the modal remains open and the URL stays `#/add`.

2. Records persistence

- Two tabs lose data through last-writer-wins whole-board writes.
- A quota/storage write failure is swallowed after in-memory state changes, so the user sees a successful edit which disappears on reload.
- Older or malformed stored shapes are not safely read field-by-field. A `null` status entry or a job without `draft` throws during filtering, then causes the provider to discard the entire stored board.
- Deleting a status deletes every job in that status. This directly violates the stated rule that deletion must be refused while postings remain.
- API wiring will require replacing the provider’s browser-only reads, whole-snapshot mutations, generated IDs, and persistence behavior. There is no migration or reconciliation path for existing `karnama.records` data.

Findings

- critical — KN-042 is marked done while its explicit Apollo, auth, and error-boundary condition is absent. `AppProviders` only composes preferences, theme, and the local records store; there is no Apollo provider, auth state, or error boundary. A thrown screen still takes down the tree rather than rendering an error state. [AppProviders.tsx:89](D:/Kar/Gandom/KarNama/apps/web/src/app/AppProviders.tsx:89) [App.tsx:53](D:/Kar/Gandom/KarNama/apps/web/src/app/App.tsx:53)

- critical — Saving from `#/add` cannot close the add destination. `AddJobModal.save` only invokes `onSave`; `JobsScreen.addJob` clears local `adding` but never calls `onAddClose`; because `addOpen` remains true, `addingTo` immediately resolves back to `first` and the modal remains open. The URL remains `#/add` as well. [AddJobModal.tsx:164](D:/Kar/Gandom/KarNama/apps/web/src/shared/add-job/AddJobModal.tsx:164) [JobsScreen.tsx:68](D:/Kar/Gandom/KarNama/apps/web/src/screens/JobsScreen.tsx:68) [JobsScreen.tsx:78](D:/Kar/Gandom/KarNama/apps/web/src/screens/JobsScreen.tsx:78)

- critical — Deleting a populated status irreversibly deletes its job records. Selecting delete on a column filters out both the status and all jobs assigned to it, with no refusal or preservation path. That is direct data loss, and contradicts the defined status-deletion contract. [RecordsProvider.tsx:148](D:/Kar/Gandom/KarNama/apps/web/src/core/records/RecordsProvider.tsx:148) [board.json:1714](D:/Kar/Gandom/KarNama/agent/board.json:1714)

- major — Two open tabs silently overwrite each other’s records. State is read once on provider mount, no `storage` event is observed, and every mutation serializes its full stale snapshot. Reproduce: open two tabs, add A in tab one, add B in tab two; refresh tab one and A is gone. [RecordsProvider.tsx:101](D:/Kar/Gandom/KarNama/apps/web/src/core/records/RecordsProvider.tsx:101) [RecordsProvider.tsx:107](D:/Kar/Gandom/KarNama/apps/web/src/core/records/RecordsProvider.tsx:107)

- major — Persistence failures are reported as success. `change` commits React state before `keep`; `keep` catches quota and security errors without returning or surfacing failure. An add or edit that exceeds quota vanishes after reload. [RecordsProvider.tsx:107](D:/Kar/Gandom/KarNama/apps/web/src/core/records/RecordsProvider.tsx:107) [RecordsProvider.tsx:68](D:/Kar/Gandom/KarNama/apps/web/src/core/records/RecordsProvider.tsx:68)

- major — The claimed backward-compatible stored-record reader can throw on ordinary old/corrupt entries and then resets the whole board. For example, `statuses: [null]` dereferences `entry.id`; `jobs: [{ id: 'x' }]` dereferences `job.draft.status`. The outer catch then replaces all saved records with a fresh board. [records.ts:153](D:/Kar/Gandom/KarNama/apps/web/src/core/records/records.ts:153) [RecordsProvider.tsx:58](D:/Kar/Gandom/KarNama/apps/web/src/core/records/RecordsProvider.tsx:58)

VERDICT
score: 2.5
criticals: 3
one-line: Do not call KN-042 done until the missing error/API shell is implemented and `#/add` reliably returns to `#/jobs` after a successful save.