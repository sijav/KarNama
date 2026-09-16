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

## Where things stand, 2026-09-16

**Codex's work of 2026-09-12 stays on main**, KN-477: login mocked at the owner's word, Groq
extraction on Render, Settings, drag and drop, collapse, date validation, the growing paste field,
the job modal's form. It waits on twenty-five children. **KN-496 landed the dark `color-scheme` fix
by hand**, so `git stash@{0}` duplicates committed code; left for the owner to drop.

**Closed 2026-09-16**: KN-514, KN-524, KN-535, KN-543, KN-544, KN-559, KN-658, KN-542, KN-564,
KN-565, **KN-589** (d4b86c0), **KN-665**, **KN-667**, **KN-591** (874d4ce), **KN-601** (b5498ed),
**KN-669**, **KN-670**, **KN-618** (4be8a8e), **KN-675** (23e188e), **KN-626** (4c099cb),
**KN-678** (6b32e24), **KN-651** (c083050), **KN-679** (7bc88a7), **KN-680** (3e5c29e), **KN-666** (739df0c).
**Dropped**: KN-657, and **KN-663** (de6157c) — filed on a false premise, found by its own plan
review before anything was built: `i18n.test.ts` line 7 has asserted the English identity map over
every entry since 2026-09-08, `e3150cc`, eight days before the card. Its account of KN-565 was wrong
the same way: 484 is `catalog.test.ts`'s own count, that file was run ALONE, and a full unit run
would have failed. **A partial run tells you what it ran, never what exists** — in `AGENTS.md` now,
and the seventh of the day's overclaims, the only one that manufactured work.

**THE E2E SUITE IS GREEN**: 93 passed, 0 failed, 9 skipped over 102 tests, from 92 and 1. KN-651
was the last red.

**Six overclaims in one day, all mine, all one shape**, and this is the thing to watch: KN-667,
KN-669, KN-670, KN-675, KN-679, KN-680. Absolute coverage language on a partial mechanism. The last
two are the instructive pair: **KN-679 wrote the rule down and KN-680 was that same rule broken in
the sentence that wrote it** — the entry recording what the story-docs guard cannot do itself said
the guard checks "every callback", which it cannot. Writing the lesson is not applying it.

**What KN-626 and KN-651 taught about proof, now in `AGENTS.md` section 7.**

- The runner names a story's test by its **display name, spaced**, so `-t ReportsABlankTitle` matched
  nothing, vitest said `Tests 6 skipped (6)`, exited 0, and the control read it as a pass. **A run
  that skipped everything or ran none is a failure to run.** The same wrong name then made the
  script's own regex miss a real failure the summary line was reporting two lines above it.
- **A negative asserted after an interaction can pass because the interaction never happened.** A
  dialog missing after a press is what an unpressed trigger leaves behind too. Hand the component
  the state that must be refused and watch it refuse.
- **`locator.check()` CLICKS even where the context has touch** — read in `playwright-core`'s bundle:
  `_setChecked` calls `this._click(...)`. So a phone test that checks a box proves the desktop's
  gesture, and it passes: KN-651's spec went 6 of 6 across both projects that way before the review
  caught it. `tap()` is the touch path. Playwright 1.62 has no long press, so a held press is CDP
  `Input.dispatchTouchEvent` with a wait on what the hold produces between start and end.
- **The story-docs guard checks structure, never prose.** It would pass a sentence and its opposite
  identically, so it is no evidence that a docs claim is true.

**Open and worth knowing**: **KN-668**, the code step's notice at 4.3929 on `bg/surface-secondary`;
**KN-664**, the resend controls presuppose a send; **KN-666**, the sidebar's «فضای کار» label;
**KN-662**, the two Empty State bodies; **KN-671**, the two-tabs spec's Persian locators;
**KN-627**, widened to BOTH shells, since `PanelModal` now carries Modal's `trim()` predicate and so
its zero-width gap — two separate predicates that merely match, so each must be changed explicitly;
**KN-672**, **KN-673**, **KN-674** from KN-618; **KN-676** and **KN-677** from KN-675.

**Still waiting on the owner**: KN-515, KN-516, KN-517; the Search Bar and Sort Control taking
KN-275's `border/control`; **KN-486**, the `fetch`-stubbing tests of `extraction.service.ts`. The
Codex log the owner pasted holds the Groq key; never repeat that key anywhere.

**Roasts run on Codex terra, pinned**: every roast and plan review passes `--model gpt-5.6-terra`.
`roast.py` takes the work as `--did`, the file list as `--files`, the diff as `--diff`; a plan goes
in `--did` too, and omitting `--fresh` resumes that mode's session so a re-review sees its own
earlier round. `todo roast` needs `--file`, the reviewer's answer file, and `--filed none` when a
round finds nothing.

## What fails, measured 2026-09-16

The unit project is 1529 of 1531: the two are `session.test.ts` under load, KN-551, which passes
alone 2 of 2 every time. The storybook project loses whichever pointer-driven stories run beside
each other, KN-365. **The e2e suite passes whole**; **"a fresh build" means `CI=1`**, since the
config reuses a running server otherwise, and its webServer runs `tsc --noEmit` first, so a mutation
that leaves a symbol unused stops the server rather than failing a test. `App.tsx` line 107
uncovered, KN-491. The API's gate fails on `extraction.service.ts`, KN-486, so the api workspace's
database tests are run directly, `npx vitest run src/database`, 68.

## The owner's rules, most recent first

- **2026-09-16, in chat.** "are you commiting and pushing after fixes" — yes, and the answer given
  was the record rather than a reassurance: every close is a work commit, the card closed with
  evidence, the board rendered and committed, then a push.
- **2026-09-16, through the question tool.** The sign-in note and the resend timer take 4.5 to one
  or better, KN-591. Asked in the same breath which wording the mocked sign-in steps should use:
  "Is that really important that you stopped working for? Who cares!" **So a question of that kind
  is not asked again.** Where a rule already decides a thing, the rule decides it.
- **2026-09-15, through the question tool.** The phone's add form keeps the title first, KN-358. The
  first sign-in may skip the name, "As Figma", KN-588. KarNama writes terms and privacy pages and
  the sign-in note links to them, KN-590 and KN-630. The Loading State turns an arc, KN-616.
- **2026-09-14.** The board is the todo skill's database. The shared skills serve ALL projects: a
  change only adds. A model's work is never roasted by that model. "It should look like the figma."
  The owner reads on a phone: literal truth, no excuses. An instruction carries its date.
- **2026-09-12, to Codex, still standing.** Mock the login. Keep the sample data and the AI
  extraction. Commit and push after work. Never ask the owner to redeploy when nothing changed.
- **2026-09-11.** Push after every close. Only new component cards and their blockers are `critical`.
  No proof at the close. Roasts stay. A finding about the loop is `low`. **Do not invent gates.**
- **A finding is a CHILD of its task**, one level, with `--area` and `--okr`. **Plans live beside
  the work**, checked by `roast.py plan` before building, and they stay.

## The next step

**KN-668 is in progress**, medium, 1 point, web — KN-591's last open child. Its plan is written
beside the work at `apps/web/src/screens/` and is **with the reviewer**; nothing is built yet.

**The card reads as one line and is not.** The notice is `AuthScreen.tsx` 238/239, `text/secondary`
on `bg/surface-secondary`. Computed from the tokens: that pair is **4.3929**, while the same token
is 4.5101 on `bg/page` and 4.8345 on `bg/surface` — `bg/surface-secondary` is the only surface where
it falls short. Searching the product found nineteen uses of that surface and **six real text sites
at 4.3929**: the notice; `JobModal.tsx` 344/345 the skill chips and 547/550 the drop zone; and
`KanbanColumn.tsx` 153, 234 and 263, the empty message, the header title and the count, all inside
the column's own `frame` at 127. Two further paired sites, the job modal's open-link at 317 and its
download button at 521, hold **icons**, so they take WCAG 1.4.11's 3 to one and are not defects.

**So the plan's first question is six site edits or one token walk.** Walking `text/secondary` one
step of lightness from `#6b7280` gives **`#69707d`**: 4.5277 on `bg/surface-secondary`, 4.6485 on
`bg/page`, 4.9829 on `bg/surface`. That is the `border/control` precedent, DESIGN's table line 103.
The risk to weigh is that the token has 43 text sites and `darkMode.ts` derives the DARK palette
from this very value, so dark shifts with it and must be re-run rather than assumed.

**The second question is the exit's own second half**: extend the guard from a list of tokens to
real PAIRS. A hand list would rot; this repository reads the repository instead, as `catalog.test.ts`
scans for ids and `guard.test.ts` defers to Storybook's indexer. Whether a guard can honestly derive
pairs from `sx`, given a text colour inherits through nesting, is the question — and the exit
already permits a card saying why not, which beats a guard that looks thorough and is not.

## What to read first

`AGENTS.md` section 7, `agent/RALPH.md`, the head of `agent/TODO_BOARD.md`, `todo show KN-663`, and
`apps/web/src/i18n/catalog.test.ts`. **Never chain a check through a pipe into a commit or a close,
write long scripts with the Write tool, and keep apostrophes out of single-quoted strings in
scripts.** A backgrounded run's "exit code 0" is the shell line's, not the runner's, and a run that
skipped every test exits 0 too: **read the summary line, and refuse it on "skipped" or a zero
total** — and keep "could not run" distinct from "does not hold". When a script edits several files,
compute them all in memory and write only if every count matches. A story proves a rendered line
only where the story itself pins the global. And check a path before asserting it: `panel-modal/`,
`console-guard/` and `playwright-core` under `apps/web` were all wrong guesses on 2026-09-16, each
costing a round.
