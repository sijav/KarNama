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

- Monorepo, npm workspaces. `apps/web` and `apps/api` exist; `packages/graphql`
  does not.
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

`sijav/KarNama` is live and pushed.

**`apps/web`**: 222 tests, 100 percent on all four coverage metrics, 8 Playwright
tests on the two drawn viewports. The token set, a light theme and a DERIVED dark
one, the RTL emotion cache, lingui with English source ids, a persisted preference
store, and a working `LanguageSwitch`. A user can switch language and it survives
a reload, proved end to end.

**`apps/api`**: 60 tests, 100 percent on all four. NestJS 12, GraphQL code first,
a health query answering from a cold-started build, an environment that fails in
two lines before the server listens, the full Prisma data model with two
migrations, and a seed. The migrations run against PGlite, which is Postgres in
process, so the SQL is executed by the engine Supabase runs.

**`packages/graphql`**: 4 tests. Types AND operations generated from
`apps/api/schema.gql`. The operation documents live in `src/operations/*.graphql`
so codegen validates them against the schema at generation time, and
`typed-document-node` emits each document with its type so a consumer cannot pair
the wrong two. `codegen:check` regenerates into a temp dir and byte-compares; it
never writes into `src`.

**`apps/api/schema.gql` is committed and checked.** `npm run build` refuses a
stale schema; `npm run schema:update` regenerates it with no server, no
environment and no database. `GraphqlModule` registers the same array the
generator reads, so a resolver reaches the server and the contract together.

Every verifier here has been mutation tested. Nothing is trusted because it
passed; it is trusted because it was made to fail. **But the mutation cases are
written to a scratch directory and thrown away**, so no count in a commit message
can be re-run by anyone, including the next iteration. Filed as KN-136, and two
reviewers declined to certify a count for exactly this reason.

## What the roasts keep proving, one line each

**An unchecked claim replaced by another unchecked claim is not a fix.** KN-002
spent four rounds on it. The cure is to derive the number from a committed
artefact and make the document match.

**A test that measures the wrong quantity passes while the thing is broken.**
KN-005's dark palette had every HSL assertion green while eight of nine status
chips sat at 1.0 to 1.5 contrast. Lightness is not contrast.

**"It is written" is not "it works".** KN-006 wrote the language preference,
read it back and discarded it on the next mount. Only a reload test found it.

**A build that repairs the evidence cannot check it.** KN-120's build ran
`schema:generate` before comparing, so a stale schema always passed.

**Shell heredocs eat backslashes.** Four times now a regex arrived with its
escapes stripped and passed while matching nothing. Use the Edit tool for code.

**Do not mutate the worktree while a roast is reading it.**

**A grep for a banned construct finds the prose explaining the ban.** KN-128's
check reported the defect it had just fixed, because the doc comment names what
was removed. Strip comments before every such grep, and assert the stripped file
is not empty or the grep passes by having nothing to read.

**Fixing a finding costs a roast round; filing one costs nothing.** KN-128 took
SIX rounds for a three point card. Rounds 3 to 5 were fixes the mechanical test
in RALPH.md says should have been cards, and each fix changed the work after the
review so the close was refused. The fixes for round 5 were reverted and filed.
Read step 5 before adjudicating, not after.

**Attach `--verify` BEFORE the roast.** The card digest includes it, so setting
it afterwards invalidates the round that cleared the task. That alone cost round
6. Filed as KN-139.

## Next step

`npm run todo -- next` picks it. Do not choose by hand.

**KN-128 is done and the GraphQL chain is closed both ways**: resolvers to
`schema.gql` to `generated.ts` to the web app, with a refusal at each step, and
operations validated against the schema rather than asserted by hand.

**The most urgent thing on the board is KN-131**, filed out of KN-128's roast:
`apps/web`'s build is `vite build` and nothing else, so `npm run build`, the
command a deploy runs, never typechecks the web app. Removing a selected field
from an operation and regenerating leaves the consumer reading a property that is
no longer there, the build passes, and the screen renders undefined. It is
critical and it must land before KN-051 wires GitHub Pages.

**Two exit conditions on the board contradict themselves.** KN-120's asked that
the build both PRODUCE the schema and FAIL when it is stale, which cannot both
hold. That was recorded in the evidence rather than resolved by editing the card.
Read the next exit condition for the same shape before building to it.

**Severity has stopped discriminating**: most of the open board is high. Filed as
KN-117. The selection law orders by severity first, so it is effectively choosing
by points and id.

Clusters worth taking together: **KN-111, KN-114, KN-115** are all "the catalog
test or the lingui rule is incomplete". **KN-092, KN-109** are both "nothing
enforces a convention AGENTS.md states" and both touch every file, so they are
cheaper before the component queue than after. **KN-137, KN-138** are both
"KN-128's verifier is narrower than it reads". **KN-123** is still the one that
would cost real data: the migration runner has no transaction, lock, failure
state or checksum.

## What to read first

`AGENTS.md`, `DESIGN.md`, `agent/RALPH.md`, `agent/TODO_BOARD.md`. In that
order, every iteration, before touching anything. Then `npm run contract`, which
is the only trustworthy answer to "do the cards still agree with the design".
