1. **Only the lock critical is closed.** Taking the advisory lock before ledger DDL is correct. I verified acquisition against PGlite while the ledger did not exist, and verified release afterward. Advisory locks do not depend on user tables. [PostgreSQL locking documentation](https://www.postgresql.org/docs/current/explicit-locking.html#ADVISORY-LOCKS)

   **The transaction critical remains.** The original inline cases are caught, but `withoutNoise` is not a SQL lexer. Its independent replacements can erase executable transaction commands.

2. **Both incorrect ledger outcomes remain reproducible.** Against the actual `applyMigrations`, I produced:
   - APPLIED with the table absent, followed by a retry returning `[]`.
   - FAILED with the table still present, despite the error claiming rollback.

   Reproductions appear below.

3. **The nine mutations do not establish all the claimed guarantees.**
   - Mutation 6’s designated test uses a fake that never grants the lock. Removing the guard makes that test fail through lock acquisition or timeout, without executing transaction SQL. Other PGlite tests provide stronger evidence.
   - Mutation 1 establishes batch composition, not atomicity when the ledger INSERT fails.
   - Removing the retry delay would escape the current assertions: the contention test uses `lockRetryMs: 0` and only counts attempts.
   - No test covers contention followed by successful acquisition.
   - The harness checks whether a name occurs in output, not whether that named test failed.

   I read the harness; I did not execute it or modify files.

4. **Fix the transaction escape and the missing waiting proof within KN-123.** The verifier’s failure-attribution weakness deserves a separate tooling card. NULL-checksum adoption deserves the separate legacy-integrity card you requested. Valid quoted identifiers being rejected belongs with the transaction lexer fix.

Findings:

- **critical: Transaction commands still escape the guard and corrupt the ledger’s account of what ran.** [migrations.ts:98](D:/Kar/Gandom/KarNama/apps/api/src/database/migrations.ts:98)

  Executed against PGlite:

  ```sql
  CREATE TABLE probe (id int);
  SELECT '$tag$'; ABORT; SELECT '$tag$';
  ```

  Result: success, `applied_at` populated, `failed_at` null, and **no `probe` table**. Retrying skips the migration. The dollar-quote regex treats delimiters inside two separate ordinary strings as one quoted body and removes the intervening `ABORT`.

  This variant produces the opposite lie:

  ```sql
  CREATE TABLE probe (id int);
  SELECT '$tag$'; COMMIT; SELECT '$tag$';
  CREATE TABLE probe (id int);
  ```

  Result: “failed and was rolled back,” FAILED ledger row, and **`probe` remains committed**.

  Additional independently reproduced false successes:

  ```sql
  CREATE TABLE probe (id int); SELECT '--'; ABORT;
  ```

  ```sql
  CREATE TABLE probe (id int);
  /* outer /* inner */ tail */ ABORT;
  ```

  ```sql
  CREATE TABLE probe (id int);
  SELECT E'\''; ABORT; SELECT 'x';
  ```

  The same implementation rejects valid SQL:

  ```sql
  CREATE TABLE "probe; COMMIT; x" (id int);
  ```

  PGlite accepts that statement directly; the runner rejects it as transaction control. Ordinary nested dollar quoting, a Unicode string followed by `ABORT`, and `COMMIT /* comment */;` behaved correctly in my probes.

  **Required fix:** recognize tokens in their actual lexical context, including quoted identifiers, escape strings and nested comments. Reordering regex passes is insufficient. These distinctions are part of [PostgreSQL’s lexical rules](https://www.postgresql.org/docs/current/sql-syntax-lexical.html). Plant the actual schema and ledger outcomes above.

- **major: The contention test does not prove waiting or eventual progress.** [migrations.guards.test.ts:108](D:/Kar/Gandom/KarNama/apps/api/src/database/migrations.guards.test.ts:108)

  The fake always returns `got: false`, the delay is zero, and the assertions require two requests and rejection. Removing `await wait(retryMs)` at [migrations.ts:146](D:/Kar/Gandom/KarNama/apps/api/src/database/migrations.ts:146) would preserve those assertions while exhausting production retries immediately.

  This concerns **KN-123’s explicit waiting exit condition**. Test a denied lock that later becomes available, verify no ledger or migration work occurs beforehand, and verify the configured delay and subsequent successful application. The current mock is not a two-session PGlite proof.

- **major: The verifier does not actually require failure through the named test.** [KN-123.mjs:162](D:/Kar/Gandom/KarNama/agent/scripts/verify/KN-123.mjs:162)

  A nonzero suite status plus `output.includes(regression.expect)` accepts output containing a passing named test alongside an unrelated failure. It does not inspect that test’s status. Mutation 6 also illustrates why even a named failure can have an unrelated cause.

  **Separate tooling card:** consume structured test results and check the expected assertion failure, rather than membership in console output.

- **minor: NULL-checksum adoption silently blesses potentially edited legacy SQL.** [migrations.ts:224](D:/Kar/Gandom/KarNama/apps/api/src/database/migrations.ts:224)

  If the old runner applied SQL A and the file now contains B, adoption records B’s checksum without executing B. Subsequent deployments accept that baseline. This is the acknowledged compatibility limitation, **a separate card**, not another rejection of the chosen migration policy.

VERDICT
score: 5.0
criticals: 1
one-line: Replace the regex-based SQL stripping; it still permits false APPLIED rows and committed DDL recorded as FAILED.