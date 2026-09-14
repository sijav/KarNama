# Compressed head

The only memory of earlier iterations that may be relied on. Rewritten at the
end of every iteration. When this file and the repository disagree, the
repository is right and this file is stale. The board is the todo skill's
database, `.claude/todo.db`: `node ~/.claude/skills/todo/todo.mjs next`,
`show <id>`, `list`, `okr`. What keeps going wrong is `AGENTS.md` section 7.

## The task spec

Build **KarNama** (کارنما), a job application tracker, driven by a Ralph loop. A
job seeker adds a posting by link or text; the product structures it into a
record that carries a status through the search. **The value is the trail, not
the listing.** Scope is closed; crawling is permanently out. Owner additions:
third-party comments stored rather than applied, and an admin panel over them.

Monorepo, npm workspaces. React 19, TypeScript, MUI 9, Storybook 10, Vitest,
Playwright, 100 percent coverage. NestJS, GraphQL code first, Prisma, Postgres
on **Neon**. GitHub Pages for web, Render for the API with a 50 second cold
start the UI must handle honestly. lingui, **English ids**. **Components first
with their stories, then screens. Match the design exactly.**

## Where things stand, 2026-09-14

**Codex's work of 2026-09-12 stays on main**, KN-477: login mocked at the
owner's word, Groq extraction on Render, Settings, drag and drop, collapse,
date validation, the growing paste field. What survived four Claude reviews of
its diff is its children, KN-484 to KN-503 and KN-521 still open; the dark
`color-scheme` fix waits in `git stash@{0}` as KN-496. KN-482 moved the board
into the skill's database.

**The owner's asks of 2026-09-14, done**: KN-479 (e058e19) language flags;
KN-480 (c0685be) the language Select in Settings; KN-478 (ce97840) settings,
sign out, language and add contact as Icon Buttons in one `ShellControls` row.

**KN-481, "it should look like the figma", done (198a36f).** The board and the
network open on the Header band their frames draw, `apps/web/src/screens/band.ts`,
the gutters are the file's 32 and 16, and `App/Shell`'s `LaidOutAsTheFrames`
asserts it in both languages; DESIGN.md section 8 records the page's frame. Its
roast filed KN-519 (network cards fixed at 556, wrapping) and KN-520 (a phone's
last card). Its audit filed KN-512, KN-513, KN-514, KN-518. **Blocked on the
owner, asked 2026-09-14 in chat**: KN-515 a phone board header's add button,
KN-516 a phone board's sort row, KN-517 history's place among the modal's tabs.

**KN-483 done (bab5444, a186a87)**: `postingText` takes linear time on a hostile
page, its output unchanged; KN-521 is the unclosed-script question.

**KN-401 done (fd9338e)**: the console guard was checked on main, and its full
runs found two regressions of this session's own, fixed in 723610d. Its roast
filed KN-522, two stories replace `console.error` with a mock that takes the
guard off, and KN-523, nothing committed proves the wiring.

**KN-403 done (a264964)**: `runSchemaCommand` lives in
`apps/api/src/graphql/schema-command.ts`, covered in process by four cases; the
built entry's test starts only an unknown and an absent command, about 160 ms
each; `HUNG_AFTER_MS`, the budget of 0 and TECH-DEBT 20 are gone. The first
in-process check timed out until the test imported `schema.ts` at its top, as
`schema.test.ts` does. Its roast is with Codex.

**What fails in a full run, and why**: the web unit project passes whole, 1348
tests. The storybook project fails the five modal stories KN-494 carries, the
board's `Adding`, which calls the live API, KN-495, and the Job Card's `Pressed`
in parallel only, KN-365's kind. The API's 156 tests pass and its coverage gate
fails on auth and extraction files, KN-486.

**Found on the way and filed**: KN-505, clean paths rather than `#/`, the
owner's question; KN-507, the Settings dialog's Theme and sample-data parts.

## The owner's rules, most recent first

- **2026-09-14.** The board is the todo skill's database, and `agent/board.json`
  is its archive. The shared skills serve ALL projects: a change only adds, and
  is checked against a copy of every board on the machine. A model's work is
  never roasted by that model. A suggestion is not a directive (the CSV diff).
  Flags come from a package, not a political choice. Settings and a phone's sign
  out do not exist in Figma, so they are invented, as icons. "It should look like
  the figma." The owner reads on a phone: literal truth, no excuses.
- **2026-09-12, to Codex, still standing for the product.** Mock the login for
  now. Keep the sample data and the AI extraction. Do not change a layout nobody
  asked to change; a drag wrapper belongs in the correct spot. Commit and push
  after work. Never ask the owner to redeploy when nothing changed.
- **Push after every close, 2026-09-11.** Commit, close, push, then roast.
- **New components first, 2026-09-11**: only new component cards and their
  blockers are `critical`; a finding on a built component is `high` or lower.
- **No proof at the close, 2026-09-11**: test what changed, stories, unit tests,
  lint, tsc, look at it, close with one line of evidence. Roasts stay.
- **A finding about the loop rather than the product is `low`** unless it is
  actively breaking the work.
- **100 percent coverage is a product rule**: `apps/*`, `packages/*`, not
  `agent/scripts/**`, and markdown has no tests.
- **Do not invent gates.** Rule zero of `agent/RALPH.md`.
- **A finding is a CHILD of its task**, one level: `todo add --parent-task`.
- **Plans live beside the work**, `#<id> - <title>.md`, checked by
  `roast.py plan` before building, and they stay.

## The next step

Relay KN-403's roast when it lands and file what survives; KN-403 is a child of
KN-167, so its findings hang off KN-167. KN-405 is in progress: the story-docs
parser, `parseStoryDoc`, still takes a `#` or `####` heading, a fence left open
and an entry with no prose without a problem. Read the parser and its tests and
KN-202's plan beside them, write KN-405's plan there, roast it with Codex, then
make each shape a problem with its line, a unit test asserting each message, the
guard still passing on every docs file, and AGENTS.md section 3's sentence on
the format saying exactly what fails.

## What to read first

`AGENTS.md` (section 7 is what keeps going wrong), `DESIGN.md`,
`agent/RALPH.md`, the head of `agent/TODO_BOARD.md`, then `todo next` and
`node agent/scripts/verify/contract.mjs`.
