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
**KN-669**, **KN-670**, **KN-618** (4be8a8e), **KN-675** (23e188e), **KN-626** (4c099cb; board
8380ddb). **Dropped**: KN-657.

**Three comment overclaims in one day, all mine, all one shape** — KN-667, KN-669, KN-670 — and the
rule is `AGENTS.md` section 7: absolute coverage language on a partial mechanism, traced through the
exact iterable, branch, scheme and use sites before it is committed. **KN-675 was the fourth of that
shape and the first in prose**, and its own roast then found two more sentences of it left in the
settings docs and comments: **KN-676** and **KN-677**.

**KN-626's lesson is about proof, not about dialogs**, and it is in `AGENTS.md` at e0ddfca. Two
readings of one run were wrong for one reason. The runner names a story's test by its **display
name, spaced** — `ReportsABlankTitle` runs as `Reports A Blank Title` — so the control's
`-t ReportsABlankTitle` matched nothing, vitest reported `Tests 6 skipped (6)`, exited 0, and the
script called that a pass: an absence in a pass's clothes. The same wrong name then made the script's
own regex miss a real failure the summary line was reporting two lines above it. **A run that
skipped everything or ran none is a failure to run.** And the plan review caught the second half:
**a negative asserted after an interaction can pass because the interaction never happened** — a
dialog missing after a press is what an unpressed trigger leaves behind too, and no `waitFor` mends
an absence that passes on its first poll. So the story hands the panel `open: true` and watches it
refuse, which fails against the old component on the report that was never made.

**Open and worth knowing**: **KN-668**, KN-591's last child — the code step's notice draws
`text/secondary` on `bg/surface-secondary`, 4.3929, and the light guard asserts tokens against
`bg/surface` alone so it cannot see it; **KN-663**, the catalog test never compares an English
message with its id; **KN-664**, the resend controls still presuppose a send; **KN-666**, the
sidebar's «فضای کار» label is the same 2.54 defect; **KN-662**, the two Empty State instances draw
different bodies; **KN-671**, the two-tabs spec's Persian locators name no English id; **KN-627**,
widened 2026-09-16 to **both** shells, since `PanelModal` now carries Modal's `trim()` predicate and
so its zero-width gap as well; **KN-672**, **KN-673**, **KN-674** from KN-618.

**Still waiting on the owner**: KN-515, KN-516, KN-517; the Search Bar and Sort Control taking
KN-275's `border/control`; **KN-486**, the `fetch`-stubbing tests of `extraction.service.ts`. The
Codex log the owner pasted holds the Groq key; never repeat that key anywhere.

**Roasts run on Codex terra, pinned**: every roast and plan review passes `--model gpt-5.6-terra`.
`roast.py` takes the work as `--did`, the file list as `--files` and the diff as `--diff`; the plan
goes in `--did` too, and omitting `--fresh` resumes that mode's session so a re-review sees its own
earlier round. `todo roast` needs `--file`, the path the reviewer wrote its answer to.

## What fails, measured 2026-09-16

The unit project is 1529 of 1531: the two are `session.test.ts` under load, KN-551, which passes
alone 2 of 2 every time. The storybook project loses whichever pointer-driven stories run beside
each other, KN-365. The e2e suite is 92 passed, 1 failed, 9 skipped, the one KN-651; **"a fresh
build" means `CI=1`**, since the config reuses an existing server otherwise. `App.tsx` line 107
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

**KN-651 is in progress**, medium, 1 point, web, and its plan is NOT yet written. It is the last red
in the e2e suite. `e2e/network.spec.ts` lines 63 to 67 select two people by hovering each card and
checking its checkbox; in the mobile project, a Pixel 7 with touch, `locator.check` times out after
30 seconds, because since KN-533 a phone's contact card keeps its `Checkbox` folded away until a
**held press** starts a selection, which is DESIGN.md's Contact Card section. It fails the same way
against `main.tsx` and `RemoteAuthProvider.tsx` as HEAD has them, so it predates KN-490.

Its exit condition names the shape of the fix: the test chooses the two people **as a phone does**
in the mobile project, a held press on the first card and a tap on the second, and still hovers and
checks on the desktop, and it passes in both projects. So the plan's work is finding how the spec
tells the two projects apart and what actually starts a selection by touch.

**KN-626's roast** was launched and has not landed; judge it, file survivors with
`--parent-task KN-626`, record the round with `--file`, relay it.

## What to read first

`AGENTS.md` section 7, `agent/RALPH.md`, the head of `agent/TODO_BOARD.md`, `todo show KN-651`, and
`apps/web/e2e/network.spec.ts`. **Never chain a check through a pipe into a commit or a close, write
long scripts with the Write tool, and keep apostrophes out of single-quoted strings in scripts.** A
backgrounded run's "exit code 0" is the shell line's, not the runner's, and a vitest run that
skipped every test exits 0 as well: **read the summary line, and refuse it on "skipped" or a zero
total.** When a script edits several files, compute them all in memory and write only if every count
matches. A story proves a rendered line only where the story itself pins the global. And check a
path before asserting it: two guesses were wrong on 2026-09-16, `panel-modal/` and `console-guard/`,
both of which cost a round.
