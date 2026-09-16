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
the job modal's form. It waits on twenty children. **KN-496 landed the dark `color-scheme` fix by
hand**, so `git stash@{0}` duplicates committed code; left for the owner to drop.

**Closed 2026-09-16**: KN-514, KN-524, KN-535, KN-543, KN-544, KN-559, KN-658, KN-542, KN-564,
KN-565, **KN-589** (d4b86c0), **KN-665**, **KN-667**, **KN-591** (874d4ce), **KN-601** (b5498ed),
**KN-669**, **KN-670**, **KN-618** (4be8a8e; board fc7c952). **Dropped**: KN-657.

**Three comment overclaims in one day, all mine, all one shape** — KN-667, KN-669, KN-670 — and the
rule is now `AGENTS.md` section 7: absolute coverage language on a partial mechanism, traced through
the exact iterable, branch, scheme and use sites before it is committed.

**KN-618 is the most recent and its lesson is sharper than its diff.** The sample-data confirmation
now lands in a region that was already in the page. Two of my own answers were wrong on the way:
the gap under the button is 8px and I had written 16 from the `gap: 2` shorthand, this theme's
spacing unit being 4; and asserting the filled state after the press failed, which I misdiagnosed as
a stale node before finding the real cause — **`updateArgs` re-renders in a real Storybook, KN-563,
and does NOT under the Vitest runner**. Seven story files call it and not one asserts a rendered
consequence. So the proof is two stories: `Preferences` for the empty region, `Loaded` for the
filled one.

**Open and worth knowing**: **KN-668**, KN-591's last child — the code step's notice draws
`text/secondary` on `bg/surface-secondary`, 4.3929, and the light guard asserts tokens against
`bg/surface` alone so it cannot see it; **KN-663**, the catalog test never compares an English
message with its id; **KN-664**, the resend controls still presuppose a send; **KN-666**, the
sidebar's «فضای کار» label is the same 2.54 defect; **KN-662**, the two Empty State instances draw
different bodies; **KN-671**, the two-tabs spec's Persian locators name no English id.

**Still waiting on the owner**: KN-515, KN-516, KN-517; the Search Bar and Sort Control taking
KN-275's `border/control`; **KN-486**, the `fetch`-stubbing tests of `extraction.service.ts`. The
Codex log the owner pasted holds the Groq key; never repeat that key anywhere.

**Roasts run on Codex terra, pinned**: every roast and plan review passes `--model gpt-5.6-terra`.

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

**KN-626 is in progress**, medium, 1 point, web, and its plan is written beside the work at
`apps/web/src/shared/modal/`. It copies KN-345, which did the same for `Modal` and whose evidence
ends "PanelModal's same gap is KN-626", so the design is settled and the plan's value is the
differences. Measured and not yet in the repository:

- `PanelModal.tsx` runs FOUR hooks before its return, `useLingui`, `useId` and `useSyncExternalStore`
  twice, so the early return must follow all of them or the hook count changes between renders.
- `console-guard.ts` is a FILE, not a directory; `report` writes a marked line to `console.error`.
- `PanelModal.stories.tsx` imports no `spyOn`, no `passOnUnmarked` and no `body()` helper, all of
  which `Modal.stories.tsx` has, its `body` a one-liner at line 88.
- **`DISSOLVE_MS` is exported from `Modal.tsx` and is a bare `const` in `PanelModal.tsx`**, so the
  template's dissolve wait cannot be imported. That is the card's one real decision, put to the plan
  review.

Then: send the plan for review, build, and run the new story against the component as it is, since
KN-345's own control was that its story "failed alone against the shell as it was".

**KN-618's roast** was launched and has not landed; judge it, file survivors with
`--parent-task KN-618`, record the round, relay it.

## What to read first

`AGENTS.md` section 7, `agent/RALPH.md`, the head of `agent/TODO_BOARD.md`, `todo show KN-626`, and
`apps/web/src/shared/modal/Modal.tsx` lines 107 to 120. **Never chain a check through a pipe into a
commit or a close, write long scripts with the Write tool, and keep apostrophes out of
single-quoted strings in scripts.** A backgrounded run's "exit code 0" is the shell line's, not the
runner's: read the summary out of the file. When a script edits several files, compute them all in
memory and write only if every count matches. A story proves a rendered line only where the story
itself pins the global. And check a path before asserting it: two guesses were wrong this iteration,
`panel-modal/` and `console-guard/`, both of which cost a round.
