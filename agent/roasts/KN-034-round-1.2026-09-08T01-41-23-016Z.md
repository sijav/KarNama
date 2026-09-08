1. The ledger runner does not handle failure safely. A failed multi-statement migration can leave partial DDL with no ledger row, so retrying replays `CREATE TYPE`/`CREATE TABLE` and permanently fails. Two concurrent runners can both observe “not applied”; one then fails on duplicate DDL or ledger insertion. It has no checksum, so editing an applied migration silently skips the changed SQL. Prisma also does not automatically roll migrations back, but it records failures/checksums and serializes deploys. Render free tier sleep itself does not create this race; concurrent deploy/retry/manual migration commands do.

2. The regexes parse all required and optional field-list entries. They deliberately exclude `statusHistory`; it exists in the schema. The prose-only “posting link” and “full text” are add-flow inputs, not named persisted job-record fields. No Figma job-record field is actually absent.

3. No, every seed value does not use `quote`. Notes, contacts, feedback, the seed user name and phone are interpolated as raw SQL literals. Current values happen not to contain ASCII `'`. A future contact named `O'Brien` or feedback text containing `we're` breaks the statement. Doubling apostrophes is adequate only under PostgreSQL’s normal `standard_conforming_strings` setting; parameters are the correct durable solution.

4. Status deletion is correctly blocked while records, or historical `toStatus` references, remain. User deletion cascades the whole account. Job-record deletion cascades its history, notes, file references, and feedback; that is intentional only if deletion is explicitly destructive, despite the misleading test name. A related contact is retained with `jobRecordId = NULL`, which is correct. None of these silently deletes a contact; deleting a job record does make its trail and file references disappear from the user’s archive.

Findings:

- critical — [migrations.ts](D:/Kar/Gandom/KarNama/apps/api/src/database/migrations.ts:59) applies each migration and writes its ledger record in separate statements, with no transaction, lock, failure state, or checksum. If the initial migration fails after creating `ModerationState` but before completion, its name is absent from `_karnama_migrations`; the next deploy reruns it and fails at the existing type. This does not meet the existing-database condition safely.

- critical — [schema.prisma](D:/Kar/Gandom/KarNama/apps/api/prisma/schema.prisma:128) does not make `StatusHistory` immutable. Absence of `updatedAt` changes nothing: the application database role can run `UPDATE "status_history" SET "toStatusId" = ...` or delete rows. The claimed non-rewritable trail is not enforced.

- minor — [seed.ts](D:/Kar/Gandom/KarNama/apps/api/src/database/seed.ts:179) bypasses `quote` for several text values. The next seed edit adding an ASCII apostrophe to a note, contact, or feedback body makes `db:seed` fail, and the string-concatenation approach makes this needlessly fragile.

VERDICT
score: 3.5
criticals: 2
one-line: replace the handwritten ledger loop with transactional, locked, checksum-verified Prisma migration deployment before any real database is used