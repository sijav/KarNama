1. **Yes, the implicit-transaction conclusion is correct for this CLI.** The installed `pg` implementation sends `client.query(sql)` through the simple-query protocol when there are no parameters or preparation options. PostgreSQL executes multiple statements in that message within one implicit transaction, unless transaction-control statements divide it. This covers ordinary `CREATE TABLE` and `CREATE TYPE` DDL. Extended-query parsing rejects multiple statements in one Parse message; it does not silently execute this batch independently. [PostgreSQL protocol documentation](https://www.postgresql.org/docs/current/protocol-flow.html#PROTOCOL-FLOW-MULTI-STATEMENT)

   **The ONE-BATCH assertion is useful but insufficient.** One batch can contain multiple transactions, which your guard currently permits. The behavioral guarantee should also be tested by making the ledger INSERT fail after successful DDL. I planted that case against the actual runner in PGlite: the DDL rolled back and the failure row was recorded correctly.

2. **No, ledger initialization before the lock is not concurrency-safe.** Two sessions can both observe the table as absent, then one fails creating its catalog entries after the other commits, despite `IF NOT EXISTS`. PostgreSQL explicitly documents this behavior in its bug discussion. [PostgreSQL explanation](https://www.postgresql.org/message-id/CA%2BTgmoZAdYVtwBfp1FL2sMZbiHCWT4UPrzRLNnX1Nb30Ku3-gg%40mail.gmail.com)

   The listed ALTERs on an existing table acquire exclusive locks and serialize; those statements alone do not imply a deadlock. However, they can block before your bounded advisory-lock retry starts. Advisory locks are independent of user tables. Take the lock **before all ledger DDL**. [PostgreSQL locking documentation](https://www.postgresql.org/docs/current/explicit-locking.html)

3. **A process kill after the batch commits is handled correctly for a normal migration.** DDL and the successful ledger row, including checksum, are already committed. The next deployment compares the checksum and skips the migration. Session termination releases the advisory lock. A kill before commit rolls back the transaction, but cannot guarantee a failure row because the process never reaches the catch.

   Losing the connection after commit also prevents subsequent failure-recording queries on that connection; it does not inherently overwrite the committed success row. The recovery problem I reproduced instead comes from transaction-control statements escaping your guard, detailed below.

4. **NULL adoption is an integrity limitation, not a meaningful defense against someone who can freely update the ledger.** Such a writer could replace the checksum directly anyway. Adoption is a reasonable compatibility baseline, but cannot establish that today’s SQL matches what an older deployment executed. An already-edited legacy migration will be silently adopted. Describe that limitation explicitly; I would not reject this change solely for that tradeoff.

Findings:

- **critical — Transaction-control detection permits partial commits and false successful migrations.** [migrations.ts:78](D:/Kar/Gandom/KarNama/apps/api/src/database/migrations.ts:78)

  I executed these inputs through the actual `applyMigrations` against PGlite:

  ```sql
  CREATE TABLE probe_inline (id int); COMMIT;
  CREATE TABLE probe_inline (id int);
  ```

  The guard misses the inline `COMMIT`. The runner reports “failed and was rolled back,” but `probe_inline` remains and the ledger records failure. Retrying hits the existing table.

  Replacing the inline commit with a standalone `END;` produces the same result. Worse:

  ```sql
  CREATE TABLE probe_abort (id int);
  ABORT;
  ```

  This returns success and records an applied checksum although the table does not exist. The next deployment skips it permanently.

  The regex also rejects a valid multiline `DO $$ BEGIN ... END $$` block. Replace line-based matching with SQL-aware recognition of top-level transaction commands, including aliases, and plant these cases. The ONE-BATCH test passes despite these failures.

- **critical — Concurrent first deployments race before acquiring the migration lock.** [migrations.ts:170](D:/Kar/Gandom/KarNama/apps/api/src/database/migrations.ts:170)

  Both runners execute `CREATE TABLE IF NOT EXISTS` before either takes the advisory lock. On an empty database, the losing runner can fail with a catalog uniqueness violation instead of waiting and then checking the ledger. The comment asserting that both succeed is wrong.

  Move initialization inside the acquired lock’s `try/finally`. The [concurrency test at migrations.guards.test.ts:100](D:/Kar/Gandom/KarNama/apps/api/src/database/migrations.guards.test.ts:100) cannot expose this: its fake always accepts ledger DDL and merely returns `got: false`. It proves retry counting, not concurrent database behavior or the stated PGlite concurrency exit condition.

I ran focused, in-memory PGlite probes, not the full gate. Normal ledger-failure rollback, checksum rejection, repeat-deploy skipping, and lock release passed. I read but did not execute the mutation harness.

VERDICT
score: 5.0
criticals: 2
one-line: Replace the transaction-control regex; it permits committed partial DDL and successful ledger rows for rolled-back migrations.