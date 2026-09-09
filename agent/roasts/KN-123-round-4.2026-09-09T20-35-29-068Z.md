1. **No. Both bad ledger outcomes remain reachable.** I reproduced APPLIED with the table absent and FAILED with the table committed, through two independent scanner defects. The previous block-comment and ASCII-identifier reproductions are rejected now, but the identifier fix is incomplete.

2. **Yes. The retry delay remains unprotected.** Removing `await wait(retryMs)` preserves the contention tests’ assertions. This was identified in round 3 and remains unfixed. This conclusion comes from reading the tests and mutations, not executing a modified suite.

Findings:

- **critical: Non-ASCII identifiers still hide transaction commands.** [migrations.ts:198](D:/Kar/Gandom/KarNama/apps/api/src/database/migrations.ts:198)

  `continuesIdentifier` recognizes only ASCII characters. PostgreSQL also accepts accented and non-Latin letters in identifiers. [PostgreSQL lexical rules](https://www.postgresql.org/docs/current/sql-syntax-lexical.html)

  Exact reproduction:

  ```sql
  CREATE TABLE probe(id int);
  SELECT 1 AS é$tag$;
  ABORT;
  SELECT 1 AS é$tag$;
  ```

  The scanner treats the two `$tag$` occurrences as a quoted body and swallows `ABORT`. PGlite executes it as transaction control.

  **Observed:** the runner returns the migration name, the ledger has `applied=true, failed=false`, `probe` is absent, and retry returns `[]`.

  The opposite outcome:

  ```sql
  CREATE TABLE probe(id int);
  SELECT 1 AS é$tag$;
  COMMIT;
  SELECT 1 AS é$tag$;
  CREATE TABLE probe(id int);
  ```

  **Observed:** “failed and was rolled back,” ledger `applied=false, failed=true`, but `probe` still exists.

  Recognize PostgreSQL identifier boundaries, including non-ASCII characters, before interpreting dollar quotes.

- **critical: A carriage return ends PostgreSQL’s line comment but not the scanner’s.** [migrations.ts:145](D:/Kar/Gandom/KarNama/apps/api/src/database/migrations.ts:145)

  The scanner searches exclusively for `\n`. PGlite also ends a line comment at a bare carriage return. These exact JavaScript strings reproduce both failures; `\r` means one U+000D character:

  ```js
  "CREATE TABLE probe(id int); -- comment\rABORT;"
  ```

  **Observed:** APPLIED ledger row, absent table, retry skipped.

  ```js
  "CREATE TABLE probe(id int); -- comment\rCOMMIT; CREATE TABLE probe(id int);"
  ```

  **Observed:** FAILED ledger row and “was rolled back,” with the table still committed.

  The scanner consumes the command as comment text while PostgreSQL executes it. Recognize both line terminators and plant both outcomes.

- **major: The waiting test still does not prove waiting.** [migrations.guards.test.ts:467](D:/Kar/Gandom/KarNama/apps/api/src/database/migrations.guards.test.ts:467)

  The fake denies acquisition twice, then grants it regardless of elapsed time. Deleting the delay at [migrations.ts:260](D:/Kar/Gandom/KarNama/apps/api/src/database/migrations.ts:260) preserves its assertions. The harness mutation removes retrying altogether, which tests a different guarantee.

  Without the delay, production can exhaust all 30 attempts before the other deploy releases its lock. Add a controlled-timer assertion that acquisition cannot repeat before the configured interval, then plant removal of only the delay.

I read the harness without executing it. Reproductions used the actual runner transpiled in memory and fresh in-memory PGlite databases. No repository files were changed; I did not rerun the full gate. The documented `BEGIN ATOMIC` limitation remains deferred under KN-145.

VERDICT
score: 4.0
criticals: 2
one-line: Fix non-ASCII identifier boundaries and carriage-return comments; both still permit false migration ledger states.