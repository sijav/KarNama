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

**`apps/web`**: 209 tests, 100 percent on all four coverage metrics, 8
Playwright tests on the two drawn viewports. The token set, a light theme and a
DERIVED dark one, the RTL emotion cache, lingui with English source ids, a
persisted preference store, and a working `LanguageSwitch`. A user can switch
language and it survives a reload, proved end to end.

**`apps/api`**: 60 tests, 100 percent on all four. NestJS 12, GraphQL code
first, a health query answering from a cold-started build, an environment that
fails in two lines before the server listens, the full Prisma data model with
two migrations, and a seed. The migrations run against PGlite, which is Postgres
in process, so the SQL is executed by the engine Supabase runs.

**`apps/api/schema.gql` is committed and checked.** `npm run build` refuses a
stale schema; `npm run schema:update` regenerates it with no server, no
environment and no database. `GraphqlModule` registers the same array the
generator reads, so a resolver reaches the server and the contract together.

Every verifier here has been mutation tested. Nothing is trusted because it
passed; it is trusted because it was made to fail.

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

**Shell heredocs eat backslashes.** Twice this session a regex arrived with its
escapes stripped and passed while matching nothing. Use the Edit tool for code.

**Do not mutate the worktree while a roast is reading it.**

## Next step

`npm run todo -- next` picks it. Do not choose by hand.

It hands back **KN-035, GraphQL codegen wired both ways**: `packages/graphql`
holding the generated types, codegen from `apps/api/schema.gql`, consumed by the
web app, and a check that fails when the checked-in output is stale. It was
blocked by KN-120 and that block is now cleared. **KN-120 had to be raised to
critical for the board to accept the dependency at all**, because the tool
refuses a blocker less severe than what it blocks, which is the right refusal.

**Two exit conditions on the board contradict themselves.** KN-120's asked that
the build both PRODUCE the schema and FAIL when it is stale, which cannot both
hold. That was recorded in the evidence rather than resolved by editing the
card. Read the next exit condition for the same shape before building to it.

**Severity has stopped discriminating**: most of the open board is high. Filed as
KN-117. The selection law orders by severity first, so it is effectively
choosing by points and id.

Clusters worth taking together: **KN-111, KN-114, KN-115** are all "the catalog
test or the lingui rule is incomplete". **KN-092, KN-109** are both "nothing
enforces a convention AGENTS.md states" and both touch every file, so they are
cheaper before the component queue than after. **KN-123** is the one that would
cost real data: the migration runner has no transaction, lock, failure state or
checksum.

## What to read first

`AGENTS.md`, `DESIGN.md`, `agent/RALPH.md`, `agent/TODO_BOARD.md`. In that
order, every iteration, before touching anything. Then `npm run contract`, which
is the only trustworthy answer to "do the cards still agree with the design".
