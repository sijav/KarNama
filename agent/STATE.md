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
date validation, the growing paste field, and the job modal's form. What
survived four Claude reviews of its diff is its children, KN-484 to KN-503 and
KN-521 still open; the dark `color-scheme` fix waits in `git stash@{0}` as KN-496.

**The owner's asks of 2026-09-14, done**: KN-479 language flags; KN-480 the
language Select in Settings; KN-478 the shell's controls as Icon Buttons.
**KN-481** matched the board and network to their frames (198a36f). **Blocked
on the owner, asked 2026-09-14 in chat**: KN-515 a phone board header's add
button, KN-516 a phone board's sort row, KN-517 history's place among the modal's
tabs.

**Closed today, earlier**: KN-483, KN-401, KN-403, KN-405, KN-423, KN-428,
KN-352, KN-356, KN-431 and KN-532, their roasts filing KN-527 to KN-537; KN-419,
KN-538 and KN-539; KN-437 and KN-438, KN-540 and KN-541; KN-440, KN-542 to
KN-545; KN-446, KN-546; KN-464, KN-547 and KN-548; KN-465, KN-549; KN-466,
KN-550; KN-467, nothing; KN-469 (6e2a16d), KN-552 and KN-553; KN-472 (f0b0702),
nothing; KN-495 (c6172c3), nothing; KN-522 (b0f6984), stories no longer take
KN-401's guard off, nothing, with KN-554 and KN-555 filed on the way.

**KN-206 (ff46de3)**: `CheckboxProps` requires `aria-label` or
`aria-labelledby` and takes an `id`; a blank `aria-label`, or an
`aria-labelledby` whose elements hold no text when the input attaches, is
refused and reported, as IconButton's blank name is; every Checkbox story finds
its control through `namedBox`, which asserts a name; `TargetIsLargerThanTheSquare`
asserts the 28 by 28 input over the 20 by 20 square by its box, `elementFromPoint`
at its corners and a real click. Codex's roast filed **KN-556** (a label that
renders after the checkbox refuses it for good), **KN-557** (a name of only
zero-width characters passes the Checkbox's and IconButton's `trim()`; `isBlank`
in `shared/input/blank.ts` is the product's rule) and **KN-558** (no card story
hit-tests the target where the cards place it). Dismissed on Chromium 151's own
accessibility tree: a nonblank `aria-label` beside an `aria-labelledby` that
comes to nothing is named by the `aria-label`.

**KN-551**: `core/api/session.test.ts` fails both its cases when the unit project
runs straight after storybook browser runs, and passes alone and in a quiet
full run; on 2026-09-14 evening it passed, 1383, after browser runs.

**What fails in a full run, and why**: the storybook project fails the five modal
stories KN-494 carries, four of them in `JobModal.stories.tsx`, and the Job
Card's `Pressed` in parallel only, KN-365's kind. The API's 156 tests pass and
its coverage gate fails on auth and extraction files, KN-486. Of the e2e suite,
only `two-tabs.spec.ts` was run on 2026-09-14, on desktop, and it passes.

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
- **A finding is a CHILD of its task**, one level: `todo add --parent-task`,
  always with `--area`.
- **Plans live beside the work**, `#<id> - <title>.md`, checked by
  `roast.py plan` before building, and they stay. Run `roast.py` from the
  repository root, or it leaves a `.claude/` wherever it ran. Write any long
  script with the Write tool: this shell refuses long here-documents on quotes.

## The next step

**KN-226 is in progress**: nothing committed opens the published Storybook's
stories. Its plan is written beside the work,
`apps/web/e2e/storybook/#KN-226 - ....md`, uncommitted, and goes to Codex before
anything is built. What it measured on 2026-09-15, on a production build of
d3f9fce under `/KarNama/storybook/`:

- 423 entries, 372 stories and 51 docs pages, took 115 seconds six at a time.
  Eleven fail, bare and inside the manager alike: KN-494's five, KN-554's two
  (IconButton `BlankName` and its Docs page), and four filed as KN-226's
  children, **KN-560** App/Shell `SignedInInAnotherTab`, **KN-561** Button
  `States` (0 forced cells in the first frame), **KN-562** Input
  `ControlsMatchTheCanvasInEnglish`, **KN-563** SettingsDialog `Preferences`; and
  **KN-559**, AddJobModal `Review`'s 606 tall assertion, which the manager's
  canvas cannot hold. `Multiline` needs 24 seconds alone, 57 inside the manager.
- 35 entries end with Storybook's status `error` and a clean console: the
  accessibility addon's failed checks, a note on KN-063.
- `e2e/settings.spec.ts` passes against the app's production build, so the
  Settings language switch works in the app.
- The plan's choice: one step in the Pages build job, before the artifact, that
  fails on any console or page error, with a committed list of the eleven known
  failures, each naming its card, that fails when an entry on it passes.

The first probe measured nothing: Git Bash rewrote the base passed on its command
line into `/Program Files/Git/...`, `AGENTS.md` section 7 now says so, uncommitted
with the plan. The scripts are in the session scratchpad: `kn226-build.mjs`
builds with the base set in Node, `kn226-probe.mjs` opens entries (`ONLY`,
`MANAGER`, `TIMEOUT`, `STATIC_DIR`), and `kn226-plan-roast.mjs` sends the plan.
React's duplicate key warning for `job-10`, noted on the card, is dev-only; a
production build carries none of its text.

## What to read first

`AGENTS.md` (section 7 is what keeps going wrong), `DESIGN.md`,
`agent/RALPH.md`, the head of `agent/TODO_BOARD.md`, then `todo next` and
`node agent/scripts/verify/contract.mjs`.
