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

## Where things stand, 2026-09-15

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

**Closed on 2026-09-14**, roasts recorded: KN-483, KN-401, KN-403, KN-405,
KN-423, KN-428, KN-352, KN-356, KN-431, KN-532, KN-419, KN-437, KN-438, KN-440,
KN-446, KN-464, KN-465, KN-466, KN-467, KN-469, KN-472, KN-495, KN-522, and
**KN-206** (ff46de3): the Checkbox requires `aria-label` or `aria-labelledby`,
refuses a name that comes to nothing, and its 28 by 28 target is tested; its
roast filed KN-556 to KN-558.

**KN-226, taken on 2026-09-14 and put back on 2026-09-15**, blocked by KN-494,
KN-554 and KN-560 to KN-563. Its plan, `apps/web/e2e/storybook/#KN-226 - ....md`,
measured a production Storybook of d3f9fce under `/KarNama/storybook/`: 423
entries, 372 stories and 51 docs pages, 115 seconds six at a time; eleven fail
bare and inside the manager, KN-494's five, IconButton `BlankName` and its Docs
page (KN-554), App/Shell `SignedInInAnotherTab` (KN-560), Button `States`
(KN-561), Input `ControlsMatchTheCanvasInEnglish` (KN-562) and SettingsDialog
`Preferences` (KN-563). Codex's review ruled out letting them through on a list:
the exit condition fails on any console error, so wiring the check before Pages
publishes would stop every deploy, the app's too, until they pass. The replan
weighs `@storybook/test-runner` with `--failOnConsole` (a new dependency, the
owner's yes to install), a `webServer`, no Docs pages, an explicit test timeout
and the channel hooked by a property setter; the plan's review section has it.
Also filed from the measurement: **KN-559**, AddJobModal `Review`'s 606 tall
assertion, which the manager's canvas cannot hold; a note on **KN-063** listing
34 entries whose accessibility checks fail in production, colour contrast on 31.
`e2e/settings.spec.ts` passes against the app's production build.

**How to measure the published Storybook**, since the scratch scripts are this
session's: build with `KARNAMA_STORYBOOK_BASE` set in Node's own `env`, never on
a Git Bash command line, which rewrote it to `/Program Files/Git/...` and cost 35
minutes; serve the build under that base; fetch the scripts `iframe.html` names
before opening anything; open `iframe.html?id=<id>&viewMode=story`; hear the end
on `window.__STORYBOOK_ADDONS_CHANNEL__`, `storyFinished` after the play and
`playFunctionThrewException` for a thrown one, whose `storyFinished` still says
`success`. React's production bundle prints no dev warnings.

**KN-551**: `core/api/session.test.ts` fails both its cases when the unit project
runs straight after storybook browser runs, and passes alone; on 2026-09-14
evening it passed, 1383, after browser runs.

**What fails in a full run, and why**: the storybook project fails the five modal
stories KN-494 carries and the Job Card's `Pressed` in parallel only, KN-365's
kind. The API's 156 tests pass and its coverage gate fails on auth and
extraction files, KN-486. Of the e2e suite, `two-tabs.spec.ts` passed on
2026-09-14 and `settings.spec.ts` on 2026-09-15, both on desktop.

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

**KN-554** (bb953c8), closed on 2026-09-15: IconButton's `BlankName` captures
with `passOnUnmarked(through)` and waits for the report, as the Checkbox's refusal
stories do; on a production Storybook it and IconButton's Docs page end with no
error, and each half was shown to carry weight by a plant. A production canvas
renders without React's `act`, so a passive effect can run after a play has
started. Its roast filed nothing: the replaced console after leaving the Docs page
did not reproduce. **KN-379** was dropped as its duplicate. **KN-090** carries a
note that the Docs page keeps `lang="fa-IR"` under English prose.

**KN-560** (481b66c), closed on 2026-09-15: App/Shell's `SignedInInAnotherTab`
dispatched another tab's `karnama.session` at 330 ms with no storage listener on
the window, the providers adding theirs in passive effects at 341 ms, timed by
wrapping the window's listener and dispatch methods in an init script. The story's
decorator now wraps its `AuthProvider` in `ListeningAround`, whose own effect hides
a span, and the play waits for it: on a production build the dispatch came at 356
ms after the listeners at 355 ms, and it passes bare and inside the manager.
Codex's roast found no defect. **KN-564** carries `SignedOutInAnotherTab` and
JobsScreen's `ChangedInAnotherTab`, which win the same race by 9 and 23 ms.
**KN-565**, filed on the way: the empty board's title calls the reader's records
«آگهی», against the terminology rule.

## The next step

**KN-561 is in progress**: Button's `States` counts no forced cells in the first
frame of the published Storybook. Measured on a production build with a frame
counter and a `MutationObserver`: at frame 7 the 75 buttons arrived with 45 already
carrying `data-state`, and every frame callback after saw 45, so KN-454's fix holds
and nothing flashes; the story's single frame callback, scheduled in `beforeEach`,
ran before any button existed. The plan, beside the story, counts in the first
frame that has the buttons, proved by a plant that moves the ref callback back into
an effect; Codex was reviewing it. `Button.stories.tsx` was not formatted at HEAD,
64 lines of drift; the `States` docs entries do not mention the count.

## What to read first

`AGENTS.md` (section 7 is what keeps going wrong), `DESIGN.md`,
`agent/RALPH.md`, the head of `agent/TODO_BOARD.md`, then `todo next` and
`node agent/scripts/verify/contract.mjs`.
