# Tech debt

Nothing gets silenced, pinned, widened or routed around without an entry here:
what it is, what causes it, what would fix it, and **the check that tells you it
can be removed**.

A suppressed warning with no record is a decision nobody can revisit, because
the reason is the first thing lost. "Nothing to do about it right now" is the
reason to write it down, not the reason to skip it.

Deliberate scope cuts are decisions rather than debt, and go in
[PHASE-NEXT.md](./PHASE-NEXT.md).

---

## 1. A recorded roast score is still the agent's own claim

**What.** `npm run todo -- roast <id> --score N --criticals N` writes numbers the
agent types. The board then lets the task close when those numbers clear the bar.

**Why it is like that.** The recorded numbers are deliberately the *adjudicated*
ones, not Codex's. Adjudication is the point of step 5 of the loop: reviewers do
misread code, and a finding that is wrong has to be droppable. A script cannot
tell a correct dismissal from a convenient one.

**What is done about it.** The round is now bound to an actual harness run:

- The harness writes a `.meta.json` beside every reply holding the task id, the
  round, the model, the reviewed commit, a digest of the task card and a digest
  of the reply. `roast` requires it, and refuses a reply whose digest no longer
  matches, a reply belonging to another task, or one whose round does not follow.
- `*.prompt.md` is refused outright. Round 2 of KN-001 demonstrated the exploit:
  the harness writes the verdict TEMPLATE into its own prompt file, so before
  this, `--file <the prompt>` recorded a fabricated clear round with one flag.
- The reviewer's own numbers are parsed from the **last** verdict block and
  stored alongside the adjudicated ones, so the two are visible side by side.
  Recording kinder numbers requires `--dismissed`.

**What is still true, and the threat model this gate is actually for.**

The manifest is ordinary JSON in a repository the author can write to. An author
who wants to fake a clear round can write a reply, write a matching sidecar,
commit both, and close the task. Three roast rounds found three different
versions of that path, and a fourth would find a fifth, because the property
being asked for is unobtainable: **nothing running locally under the author's
own hand can prove the author was honest.**

So the gate is scoped deliberately. It defends against **carelessness and
drift**, which are the failures that actually happen in a loop:

- closing a task nobody reviewed, because it felt finished
- recording a round against the wrong file, or a stale one
- letting a clear round outlive the code it reviewed
- softening a verdict while reading it, and forgetting that you did
- typing a flag wrong and silently changing what the board picks next

It does **not** defend against deliberate fraud, and no claim anywhere in this
repository should say that it does. Earlier versions of this entry and of
`RALPH.md` implied it, which was the more dangerous error, because a guard
believed to be stronger than it is stops being checked.

**What would actually fix it.** A verdict the author cannot produce: a signed
reply from the model provider, a CI job that runs the roast on a machine the
author does not control, or a human sign-off on close.

**The check that retires this.** When `done` requires a verdict artifact
produced outside the author's own working copy.

## 2. Task exit conditions are not machine-checked yet

Codex was right that the earlier version of this entry overclaimed. It said
prose exit conditions "cannot" be machine-checked, which was too broad and was
hiding a tractable problem behind a debt note.

**What.** Every task carries an `exit` field naming the condition under which it
may be called done. A task may also carry an optional `verify` field holding a
command, and `move <id> done` now runs it and refuses to close on a non-zero
exit. **Most tasks do not have one yet.**

**Why it is not finished.** The exit conditions were written before `verify`
existed. Backfilling them is real work and it is on the board as its own task
rather than done half-heartedly here.

**What is done about it.** `verify` runs where it is set. `move done` also
refuses when the worktree is dirty, or when HEAD has moved since the round that
cleared the task, so a passing check cannot be recycled across a later change.
`--evidence` is required for the part no command covers.

**The check that retires this.** When every task on the board has a `verify`
command, and `validate` fails on a task that has none.

## 3. `npm run roast` shells out through cmd.exe on Windows

**What.** `agent/scripts/roast.mjs` spawns `codex` with `shell: true` on win32
and quotes the arguments itself.

**Why.** `codex` on Windows is a `.cmd` shim, and Node refuses to spawn one
without a shell. Without this the harness failed with `spawnSync codex ENOENT`
before ever reaching the model, and because the call was piped through `tail`
the pipeline still exited 0, so it looked like a completed run that produced no
reply.

**The risk.** Shell quoting is done by hand, so a repository path containing a
quote or a shell metacharacter could still break the invocation.

**The check that retires this.** When Node can spawn a `.cmd` directly, or when
the harness resolves and invokes the underlying `node` entry point rather than
the shim.

## 4. Codex cannot run `npm` inside its sandbox on Windows

**What.** The reviewer shells through PowerShell, where `npm.ps1` is blocked by
execution policy: "File C:\Program Files\nodejs\npm.ps1 cannot be loaded because
running scripts is disabled on this system." Every `npm run todo -- ...`
instruction it reads is therefore unrunnable for it.

**Why it matters.** A reviewer that cannot execute the tool it is reviewing
falls back to reading, and a roast that only reads finds a different, smaller
class of defect. It showed up as six failed commands in one round, and one of
them made the reviewer report a false problem.

**What is done about it.** The roast prompt now tells the reviewer to call
`node agent/scripts/todo.mjs <command>` directly, and says outright that the npm
failure is an environment limitation rather than a finding.

**The check that retires this.** When the reviewer can run the documented
commands as documented, either because the sandbox stops using PowerShell or
because the execution policy allows the npm shim.

## 5. The Figma original is unreadable, we work from a copy

**What.** `DESIGN.md` points at file `EITM6CbJY33dMY8IsMFR4R`, which is a copy.
The original, `K1EP8GCOmelU8o4vPR7a9f`, refuses every MCP call with "you don't
have edit access".

**The risk.** The copy can drift from the original. If the designer keeps working
in the original, we build against a snapshot without knowing it.

**The check that retires this.** When the account the Figma MCP authenticates as
has edit access to the original, and `DESIGN.md` points at it.

---

## 6. Three dependency pins where "latest" is wrong

**What.** `apps/web` and the root pin versions rather than tracking latest, and
each pin is load bearing:

| Pin                              | Why                                                                                            |
| -------------------------------- | ---------------------------------------------------------------------------------------------- |
| `typescript` at `6.0.3`, root and web | `typescript-eslint` peers `<6.1.0`, so TypeScript 7 breaks linting entirely. Declared at the ROOT too, because `prettier-plugin-organize-imports` peers `typescript >=2.9` non-optionally and would otherwise pull 7 in |
| the whole vitest line at `4.1.11` | `@vitest/browser-playwright` peers vitest at an EXACT version, and `@storybook/addon-vitest` peers `@vitest/browser-playwright` at `^4`. Taking the latest of any one of the four pulls in 5 and breaks the Storybook test project |
| `stylis` at `4.2.0`, root `overrides` | `@emotion/cache` depends on exactly 4.2.0 while `@mui/stylis-plugin-rtl` peers `4.x`, so a plain install resolves two copies and emotion throws on every `::placeholder` rule |

**Why it is like that.** All three are upstream peer ranges, not choices. Each
was checked against the registry rather than guessed, and the stylis one was
verified by rendering CSS through the plugin and confirming the `::placeholder`
rule survives.

**The check that retires each one.** TypeScript: `typescript-eslint` widening its
peer range past 6.1. Vitest: `@vitest/browser-playwright` peering a range rather
than an exact version. Stylis: `@emotion/cache` depending on `^4` rather than
`4.2.0`, or the RTL plugin moving to the same version.

---

## 7. npm install scripts are blocked, and Playwright browsers need a separate step

**What.** The user's npmrc sets `allow-scripts`, so `@swc/core` and `esbuild`
postinstall scripts do not run. Nothing here adds a project `.npmrc` to widen
that.

**Why it is like that.** It is deliberate supply-chain protection and it is the
owner's setting, not this project's to override. On this platform it costs
nothing: both packages ship their binary as an optional platform package, and
`@esbuild/win32-x64/esbuild.exe` and `@swc/core-win32-x64-msvc` were both
present and working after a blocked install.

**What it does cost.** Playwright downloads browsers in a postinstall, so a
fresh clone needs `npx playwright install chromium` before `npm test` or
`npx playwright test` can run. The Storybook test project runs in real Chromium,
so this is not optional.

**The check that retires this.** A `postinstall` step in CI that runs
`playwright install --with-deps chromium` explicitly, at which point the manual
step exists only for a fresh local clone and belongs in the README.

---

## 8. lingui runs through its runtime API, not its macros

**What.** Strings go through `<Trans id="English sentence" />` and `i18n._()`
rather than the `<Trans>` macro that reads the English out of the JSX. The
catalogs in `src/i18n/locales/` are hand written rather than produced by
`lingui extract`.

**Why it is like that.** The macro transform needs `@lingui/swc-plugin` wired
into `@vitejs/plugin-react-swc`, and the swc plugin is compiled against a
specific swc ABI, so a mismatch fails at build time in a way that is unrelated
to anything the scaffold is trying to prove. The runtime API needs no transform
and enforces the same rule: `eslint-plugin-lingui` rejects a bare literal either
way, which is the half that makes the rule mechanical.

**What it costs.** Message ids are written twice, once in the JSX and once in
the catalog, and nothing yet checks that a used id exists. `i18n:extract` is
wired but has nothing to extract from.

**The check that retires this.** `@lingui/swc-plugin` building against the swc
version `@vitejs/plugin-react-swc` resolves, `lingui extract` producing the
catalogs, and the hand written ones deleted.

---

## 9. Two ESLint suppressions in the API tests

**What.** `apps/api/src/database/cli.test.ts` and
`apps/api/src/database/migrations.guards.test.ts` each disable
`@typescript-eslint/prefer-promise-reject-errors` on one line, so a fake client
can reject with a string.

**Why it is like that.** `main` has a branch for an error that is not an
`Error`, because real database drivers do reject with strings and objects, and
the only way to cover that branch is to be a driver that does it. The rule is
right about production code and wrong about a test whose entire subject is the
badly behaved case. The migration runner grew the same branch for the same
reason: it records the failure text in the ledger, and a driver that rejects
with a string would otherwise put `[object Object]` or nothing where the cause
should be.

**What it costs.** Nothing, as long as it stays on those lines. The risk is
that the disable gets copied to a place where the rule was correct, and there
are two of them now rather than one, which is how that starts.

**The check that retires this.** A helper that produces a non-`Error` rejection
without a suppression, or the rule gaining an option for test files.

**Why this entry exists at all.** A roast found two unrecorded escape hatches in
this workspace and filed KN-121 for them. This one was written after that, so
it is recorded before it is committed rather than after someone finds it.

---

## 10. Two Vitest projects, because graphql and @nestjs/graphql want opposite inlining

**What.** `apps/api/vitest.config.ts` runs two projects. The `schema` project
sets `resolve.dedupe: ['graphql']` and `ssr.noExternal: ['graphql',
'@nestjs/graphql']`; the `api` project sets neither.

**Why it is like that.** Building a GraphQL schema in process under Vitest
throws `Cannot use GraphQLScalarType "Boolean" from another module or realm`
unless both are inlined: Vite's transform pipeline and the CommonJS interop
inside `@nestjs/graphql` each resolve their own copy of `graphql`, and graphql
compares scalars by identity. Inlining `@nestjs/graphql` then breaks the test
that boots the whole application, because Nest cannot resolve `graphQlFactory`
out of the inlined module. Neither problem exists in the built server, which
loads one copy through Node's own resolution.

**What it costs, and the risk nobody has measured.** The split is a workaround
for the test runner, and it is NOT evidence that production is safe. The
lockfile currently resolves exactly one `graphql@16.14.2`. If a future
dependency ever pulls a second physical copy, the built server would hit the
same identity failure at schema construction, which is startup rather than a
request, so it would be loud rather than silent. Nothing checks for that today.

**The check that retires this.** A single `graphql` in the tree asserted by the
gate, plus either Vitest resolving one copy without help or `@nestjs/graphql`
surviving inlining. `npm ls graphql` reporting one version is the cheap half and
belongs in the API verifier.

---

## 11. Generated GraphQL documents carry a double assertion

**What.** `packages/graphql/src/generated.ts` ends with

```ts
export const HealthDocument = {"kind":"Document", ...} as unknown as DocumentNode<HealthQuery, HealthQueryVariables>
```

`as unknown as` is the escape hatch AGENTS.md bans, and the comment in
`codegen.ts` says generated code is held to that rule, so the file and the
policy describing it currently disagree.

**Why it is like that.** `@graphql-codegen/typed-document-node` emits the parsed
AST as a JSON object literal and then asserts it into `DocumentNode<TResult,
TVariables>`. It is not a claim about the data, which is a real parsed document
generated from the schema-validated operation; it is a claim about the *type
parameters*, which a plain object literal cannot carry. There is no config
option that removes it: `documentMode: 'string'` drops the AST, and
`documentMode: 'graphQLTag'` reintroduces the runtime `gql` parse this card
existed to remove.

**What it costs.** Much less than the assertion it replaced, and the difference
is the point. The old `TypedDocumentNode<HealthQuery>` in the web app asserted a
hand-written type onto a hand-written query with nothing comparing either to the
schema. This one asserts a generated type onto a generated document, both
produced in the same pass from an operation codegen validated against
`apps/api/schema.gql`. The assertion cannot make the two disagree, because
nothing writes either half. The residual risk is that a future codegen version
changes the emitted shape without changing the asserted type.

**The check that retires this.** `typed-document-node` emitting a
`DocumentNode<TResult, TVariables>` without an assertion, or a check that parses
the emitted literal and compares its selection set against the operation file,
which would make the assertion redundant rather than trusted. Not written: the
byte comparison in `check-generated.mjs` already fails if the emitted shape
changes at all, so a silent drift is not the failure mode here.

---

## 12. The migration guard refuses a SQL-standard `BEGIN ATOMIC` function body

**What.** `applyMigrations` refuses a migration containing

```sql
CREATE FUNCTION f() RETURNS integer LANGUAGE SQL BEGIN ATOMIC SELECT 1; END;
```

Postgres 14 and later accept it. The scanner reads the `BEGIN` as transaction
control and the migration is rejected before it reaches the database.

**Why it is like that.** The scanner splits on semicolons and judges each
statement by its first keyword. A `BEGIN ATOMIC` body contains semicolons of its
own and terminates with `END`, so telling it apart from a transaction means
tracking function-definition context, which is a parser rather than a scanner.

**What it costs, and why this is the right side of the trade.** The two kinds of
mistake here are not equal. A false NEGATIVE, missing an `ABORT` or a `COMMIT`,
costs a database: the runner has recorded migrations as applied that never ran,
and as failed when they had committed, and a roast reproduced both. A false
POSITIVE costs a clear error at deploy time telling the author to write the body
as a dollar-quoted block, which is the form Prisma emits and the form almost
every migration already uses. So the guard is deliberately biased towards
refusing, and the error message names this case and says what to do.

**The check that retires this.** Recognising `BEGIN ATOMIC` as a function body
rather than a transaction, with a planted case for both the body and a real
`BEGIN` in the same migration. Filed as KN-145.
