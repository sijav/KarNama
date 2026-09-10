# Compressed head

The only memory of earlier iterations that may be relied on. Rewritten at the
end of every iteration. When this file and the repository disagree, the
repository is right and this file is stale.

Numbers live in `board.json`, not here: `node agent/scripts/todo.mjs next`,
`show <id>`, `list`.

---

## The task spec

Build **KarNama** (کارنما), a job application tracker, driven by a Ralph loop.
A job seeker adds a posting themselves, by link or text; the product structures
it into a record; the record carries a status through the search. **The value is
the trail, not the listing.**

**Scope is closed.** Searching boards and aggregating ads were cut. **Crawling
is permanently out.** Two owner additions: third parties can leave comments or
suggested changes, stored rather than applied, and an admin panel over them.

Monorepo, npm workspaces. React 19, TypeScript, MUI 9, Storybook 10, Vitest,
Playwright, 100 percent coverage. NestJS, GraphQL code first, Prisma, Postgres.
GitHub Pages for web, Render for the API, Supabase for the database, with a 50
second cold start the UI must handle honestly. lingui, **English is the source**.
**Components first with their stories, then screens. Match the design exactly.**
**Auth is phone OTP**, provider mocked for the MVP.

## Where things stand

**43 done, 158 open, 1 blocked, 2 dropped. No open criticals. Nothing in
progress.** `apps/web`: 305 tests over 20 files, 100 percent on all four
metrics. `apps/api`: 96. `packages/graphql`: 4.

**The component library is unblocked and started.** KN-007 built the Storybook
docs infrastructure, which gated KN-008 through KN-030; **KN-013, the Checkbox,
is the first component built on it** and 37 more web cards now have no unmet
blockers.

**KN-196 is BLOCKED on the owner** and is the only thing waiting on a person:
what happens when a card is dragged onto a column collapsed to a count. KN-070
settled that the column collapses, not that. It blocks KN-061, drag and drop.

## The owner's rules, most recent first

**100 percent coverage is a PRODUCT rule.** `apps/*` and `packages/*`, not
`agent/scripts/**`, and **markdown has no tests**. In `AGENTS.md`.

**The loop must not eat itself.** On 2026-09-10 the owner stopped the session:
five cards had gone into a checker for the ordering of two lines in a markdown
file, each filed critical, while 65 component cards sat untouched. A roast of
the agent's own machinery always produces more machinery. **A finding about the
LOOP rather than the PRODUCT is `low` unless it is actively breaking the work.**
18 machinery cards were demoted on that basis; they are still real, they just do
not outrank building KarNama.

**Do not invent gates.** Rule zero, top of `agent/RALPH.md`. **Above all no
gates in the SKILLS**: an agent may use them however it likes. Tests yes,
refusals no.

**Finish, prove, commit, CLOSE, then roast.** `done` is terminal, enforced.

**A finding is a CHILD of the task it came from**, one level. When the LAST open
child closes, roast the parent with all its children. **KarNama's board cannot
express this**, since its `parent` field means BLOCKED BY, so provenance is
recorded in prose as `CHILD OF KN-xxx`. KN-188 carries the work.

**Test scope follows the same line**: no parent closes on the full suite, a
child closes on the tests for the files it changed.

**Plans live beside the work**, `#<id> - <title>.md`, and they STAY.

## What keeps going wrong, one line each

**A check that searches for a string, and contains that string, flags itself.**
Now SIX times. The newest two are the sharpest: KN-155's own EXIT CONDITION had
to be reworded because an exit condition saying "a check must refuse phrase X"
necessarily contains X; and `noLiterals.test.ts` rejected a COMMENT that spelled
out the pixel shorthand it was explaining. **It reads comments too.**

**An ABSENCE proves nothing without a positive control on the same instrument**,
and **this applies to MUTATION testing**. I declared a mutation impossible after
trying only NEGATIVE fixtures, which all fail safe by accident. The isolating
fixture was a POSITIVE one.

**Mutate the CONTRACT, not only the implementation.** KN-149's harness broke the
code eight ways and never touched the registry the code enforces, so dropping a
card from the contract left every check green.

**A verifier built from examples tests the examples.** Go clause by clause
through the exit condition; each guarantee needs a fixture AND a mutation that
makes that fixture fail. In `RALPH.md` step 3.

**Do not reimplement a tool's semantics — ASK THE TOOL.** The docs guard walked
the TypeScript AST to find stories and was wrong twice in one card. Storybook's
own `loadCsf(...).parse().indexInputs` is the oracle, and it corrected both me
and a reviewer: `export { A }` IS indexed, `export class` is NOT.

**A silently ignored prop looks exactly like a working one.** MUI 9 removed
`inputRef` from `SwitchBase`; passing it did nothing and the component still
looked right. Only a test asserting the DOM property caught it.

**`npm run` SILENTLY TRUNCATES every argument at its first newline on Windows.**
Use `node agent/scripts/todo.mjs` directly. KN-195.

**There are TWO roast harnesses.** `roast.py plan` checks a PLAN and records
nothing; `node agent/scripts/roast.mjs <id>` is the TASK roast and is the only
one the board can record, because `todo roast --file` verifies its sidecar.

**Shell heredocs eat backslashes**, and one wrote a literal NUL byte into a
source file this session. **Use Edit for code.**

## The next step

`node agent/scripts/todo.mjs next` picks it. The component library is the work:
KN-008 icons, KN-009 Button, KN-010 Status chip, KN-011 Input, KN-012 Select and
34 more are unblocked. Build the component, its stories, and its story-docs in
both languages; the guard refuses a story with no markdown entry.

## What to read first

`AGENTS.md`, `DESIGN.md`, `agent/RALPH.md`, `agent/TODO_BOARD.md`, in that order,
every iteration. Then `npm run contract`, a regression checker over ten rules and
not a proof that the board matches the design.
