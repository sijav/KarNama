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
filing KN-538 and KN-539; KN-437 and KN-438, filing KN-540 and KN-541; KN-440,
filing KN-542 to KN-545; KN-446, filing KN-546; KN-464, filing KN-547 and
KN-548; KN-465, filing KN-549; KN-466, filing KN-550; KN-467, nothing; KN-469, F6
measured to reach the page (6e2a16d), filing KN-552 and KN-553; KN-472, focus
after a deletion landing on the card after it (f0b0702), nothing.

**KN-495 (c6172c3)**: `JobsScreen` takes a required `onExtract`, typed from the
add modal's, and `App` fills it with `extractJob`; the Jobs stories hand it a
stand-in that gives back the link, and `Adding` asserts the call. `Adding` failed
at line 516 on the old screen as the checkout is, where `apps/web/.env.local`
points at `localhost:4000`, and with `.env.local` taken away for the run, Vite's
`loadEnv` seeing no `VITE_API_URL`; it passes in both now. A run with the
variable set empty does not count as one without an address: on Windows an empty
variable does not override `.env.local`, which the plan review found. A plant
putting the import back fails at the call assertion, line 517. Its roast found
nothing. The storybook project no longer fails on `Adding`.

**KN-551**: `core/api/session.test.ts` fails both its cases when the unit project
runs straight after storybook browser runs, seen twice today, and passes alone
and in a quiet full run.

**KN-427 re-pointed, not worked**: JobsScreen leaves 52 of its 149 branch arms
to no story; its note lists every arm by line, 5 points in the backlog.

**What fails in a full run, and why**: the web unit project passes whole, 1382,
when nothing else is running, KN-551 otherwise. The storybook project fails the
five modal stories KN-494 carries, four of them in `JobModal.stories.tsx`, and the
Job Card's `Pressed` in parallel only, KN-365's kind. The API's 156 tests pass
and its coverage gate fails on auth and extraction files, KN-486. Of the e2e
suite, only `two-tabs.spec.ts` was run on 2026-09-14, on desktop, and it passes.

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

KN-522 is in progress: stories and a test replace `console.error` with a mock,
which takes KN-401's guard off while they run. Measured on 2026-09-14 with an
unmarked `console.error` planted and each file restored by hash: Tooltip's
`ReportsATriggerThatCannotAttach` passed with it, and so did the guard's own
unit test in `console-guard.test.ts`; IconButton's `InATooltip` failed on it
through its own check. The plan,
`apps/web/src/shared/#KN-522 - Two stories replace console.error with a mock.md`,
adds `passOnUnmarked(through)` to `console-guard.ts`, holding back only the
product's marked reports and passing the rest to the console as it was; Tooltip's
`captureConsoleErrors` and the unit test use it, and `InATooltip` spies without
replacing. The same plants are the positive control. Its plan review with Codex
was running when this was written; the build script is in the session's
scratchpad.

## What to read first

`AGENTS.md` (section 7 is what keeps going wrong), `DESIGN.md`,
`agent/RALPH.md`, the head of `agent/TODO_BOARD.md`, then `todo next` and
`node agent/scripts/verify/contract.mjs`.
