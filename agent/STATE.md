# Compressed head

The only memory of earlier iterations that may be relied on. Rewritten at the
end of every iteration. When this file and the repository disagree, the
repository is right and this file is stale.

**This file does not restate anything the board already knows.** Numbers that
live in `board.json` are read from there:

```bash
npm run todo -- next            # what to work on
npm run todo -- show KN-035     # a card, its roast rounds and its notes
npm run todo -- list            # everything, with blockers marked
```

---

## The task spec

Build **KarNama** (کارنما), a job application tracker, and drive it with a Ralph
loop.

A job seeker adds a posting themselves, by link or by text, the product
structures it into a record, and the record carries a status through the search.
**The value is the trail, not the listing.**

**Scope is closed.** Searching boards and showing aggregated ads were cut.
**Crawling job sites is permanently out.** Two owner additions: third parties can
leave comments or suggested changes, stored for later evaluation rather than
applied, and an admin panel over what users submit.

Stack and standing decisions:

- Monorepo, npm workspaces. `apps/web`, `apps/api` and `packages/graphql` exist.
- React 19, TypeScript, MUI, Storybook, Playwright, Vitest, 100 percent
  coverage. **Components first with their stories, then screens.**
- GraphQL with NestJS. Render free tier, Supabase Postgres, cold start about 50
  seconds which the UI must handle honestly.
- GitHub Pages for the web app.
- lingui, **English is the source**, Persian is the translation.
- **Match the design exactly**, not approximately.
- **Auth is phone OTP**, mobile number then a five digit code, email as a
  fallback behind the same interface, **provider mocked for the MVP**.
- **The Documentation canvas beats the Components canvas**: a kanban board, not
  a list, and three nav destinations, not two.

## Where things stand

`sijav/KarNama` is live and pushed. **No open criticals.** Both are closed:
KN-123, the migration runner, and KN-128, the GraphQL chain.

**`apps/web`**: 222 tests across 14 files, 100 percent on all four coverage
metrics, 8 Playwright tests on the two drawn viewports. The unit project alone is
208 tests in 11 files, which is worth knowing because a suite-wide count cannot
tell you the unit project ran. The token set, a light theme and a DERIVED dark
one, the RTL emotion cache, lingui with English source ids, a persisted
preference store, and a working `LanguageSwitch`.

**`apps/api`**: 60 tests, 100 percent on all four. NestJS 12, GraphQL code first,
the full Prisma data model with two migrations, and a seed. The migrations run
against PGlite, which is Postgres in process, so the SQL is executed by the
engine Supabase runs.

**`packages/graphql`**: 4 tests. Types AND operations generated from
`apps/api/schema.gql`, validated against the schema at generation time.

Every verifier here has been mutation tested. Nothing is trusted because it
passed; it is trusted because it was made to fail. **But the mutation cases are
written to a scratch directory and thrown away**, so no count in a commit message
can be re-run by anyone, including the next iteration. Filed as KN-136.

## The two facts that shape what to do next

**`validate` reporting that 133 of 134 open tasks have no `verify` command is
NOT a blocker, and reading it as one is a trap this file fell into once.** A card
gets its verifier when it is worked, because `move done` refuses without one, so
the count is supposed to be high and falls one card at a time. KN-054's original
framing, backfill a verifier onto every card, is superseded ON THE CARD: writing
sixty verifiers up front means writing each check before its work exists, which
produces checks describing what is easy to assert. What is actually left of
KN-054 is flipping that report into a failure, and it must NOT be picked up until
the count is already zero, or it fails the board on work nobody has done yet.
Read the card before believing a validate message.

**Severity has stopped discriminating.** 88 high, 35 medium, 11 low. The
selection law orders by severity first, so it is effectively choosing by points
and id. Filed as KN-117.

## What the roasts keep proving, one line each

**An unchecked claim replaced by another unchecked claim is not a fix.** KN-002
spent four rounds on it. Derive the number from a committed artefact.

**A test that measures the wrong quantity passes while the thing is broken.**
KN-005's dark palette had every HSL assertion green while eight of nine status
chips sat at 1.0 to 1.5 contrast. Lightness is not contrast.

**"It is written" is not "it works".** KN-006 wrote the language preference,
read it back and discarded it on the next mount. Only a reload test found it.

**An ABSENCE proves nothing without a positive control on the same instrument.**
A listing that fails, collects nothing, or names its files differently produces
exactly the result a correct run produces. KN-100 pairs every absence with a
run that must SHOW the thing, and requires every listing to be non-empty first.

**A proxy for the exit condition is not the exit condition.** KN-100 first proved
its second clause with `vitest list` instead of running the verifier the card
names. A config can branch on how it was invoked and a resolved file set is not
an executed one, so that proof sat next to the claim rather than on it. The cheap
checks earn their place by localising a failure, not by standing in for the run.

**A source grep cannot establish "no way around it".** `spawnSync(cmd, {cwd})`
with no `env` option inherits the parent environment by default: it spreads
nothing and removes nothing, so a grep for `...process.env` passes it. Count the
launches against the guard instead, and read the launcher names out of the import
so `/pattern/.exec(s)` is not miscounted as a child process.

**A grep for a banned construct finds the prose explaining the ban.** KN-128's
check reported the defect it had just fixed. Strip comments before every such
grep, and assert the stripped file is not empty.

**A substring survives negation, and independent matches pass on coincidence.**
KN-072's verifier accepts "status history does not render in its own tab; it
renders in the Info tab", because the contrast strip ate the clause and the final
check read the UNSTRIPPED text. Bind the assertion to one entry and one sentence.

**The suite can CERTIFY the bug rather than miss it.** KN-112's existing test
asserts the stale write as the expected value, so fixing the defect means
rewriting an assertion, not adding one beside it. Read the existing expectations
before assuming a bug is merely uncovered.

**Fixing a finding costs a roast round; filing one costs nothing.** KN-128 took
SIX rounds for a three point card. Read RALPH step 5 before adjudicating.
**But step 5 has a second clause and it is not optional**: a finding that the
verifier PASSES DISHONESTLY, reporting success without establishing the exit
condition, is fixed in-task. "Does the verifier fail" cannot catch a verifier
that succeeds while checking nothing.

**A tool's REPORT is not a diagnosis.** `validate` says how many open cards lack
a verifier, and this file previously read that as "the board cannot close
anything" and called KN-054 the thing standing in the way. The card says the
opposite in as many words. One `todo -- show` would have settled it, and the
inference felt so obvious it did not seem to need checking, which is the whole
failure mode.

**Attach `--verify` BEFORE the roast.** The card digest includes it, so setting
it afterwards invalidates the round that cleared the task. Filed as KN-139.

**A gate that names the tool is not a gate that runs it.** KN-131's verifier
accepted `tsc --noEmit --noCheck`. Prove a workspace-level claim with that
workspace's own command.

**The mutation that must SURVIVE is the strongest evidence you can produce.**

**Shell heredocs eat backslashes**, and in this session a `cat > file <<'EOF'`
also aborted mid-write. Use the Write and Edit tools for code, every time.

**Do not mutate the worktree while a roast is reading it**, and do not edit
source while a mutation harness is running: its cases would test the edit.

## Roasts now run in the BACKGROUND

The owner's standing instruction: fire the roast, take the next card, and
adjudicate when it lands. Consequences already felt:

- **Unrelated work lands between a roast and its close.** The close gate refuses
  that and offers only `--fixed-since`, which is worded "this change IS the fix
  the round asked for". That is now the abnormal case. Filed as KN-156.
- **The exception is a finding that BLOCKS the task in hand**: cancel it, revert
  what was built for it, do the blocking card first, then replan.

## Next step

`npm run todo -- next` picks it. Do not choose by hand.

**KN-100 is done.** The gate-fixtures flag is hermetic in both directions and,
more usefully, its verifier was made to prove the clause the card names rather
than something adjacent to it. `agent/scripts/verify/lib/child-env.mjs` is the
shared scrub, and it is the place to reach for when a verifier spawns a child.
Its round is worth reading before writing another verifier: all three findings
were "passes without establishing the exit condition", which is the failure a
passing test can never report about itself.

**KN-112 is planned and the plan has been checked**, and the plan sits beside
the work it describes, `apps/web/src/core/preferences/`.
Two setters built over one render's snapshot lose the first update when both are
called before the next render. The fix composes onto a ref rather than onto the
snapshot. The plan check corrected two things: the setters do NOT become stable,
because `contextValue` is a `useMemo` over the two fields and is rebuilt anyway,
and a new story owes Persian and English variants. The trap to avoid is proving
the easy case: two calls after `renderToString` returns are not a React batch, so
the story's probe needs ONE button whose handler calls both.

## What to read first

`AGENTS.md`, `DESIGN.md`, `agent/RALPH.md`, `agent/TODO_BOARD.md`. In that
order, every iteration, before touching anything. Then `npm run contract`, which
is the only trustworthy answer to "do the cards still agree with the design".
