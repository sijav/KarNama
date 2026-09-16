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

**Codex's work of 2026-09-12 stays on main**, KN-477: login mocked at the owner's
word, Groq extraction on Render, Settings, drag and drop, collapse, date
validation, the growing paste field, the job modal's form. Its surviving review
findings are KN-484 to KN-503 and KN-521. **KN-496 landed the dark `color-scheme`
fix by hand**, so `git stash@{0}`, which parked the same change, now duplicates
committed code; it is left for the owner to drop.

**Closed 2026-09-16**, each roast recorded: KN-514, KN-524, KN-535, KN-543, KN-544, KN-559, KN-658,
KN-542, KN-564, KN-565 (e9c53b0), **KN-589** (d4b86c0), **KN-665** (d739f36), **KN-667** (12791df),
**KN-591** (874d4ce), **KN-601** (b5498ed), **KN-669** (eebd8ee), **KN-670** (e5ee496; board
0826170). **Dropped**: KN-657.

**Three comment overclaims in one day, all mine, all the same shape**: KN-667 said a body assertion
proved overflow where it measured width; KN-669 called a live exception settled; KN-670, written
while repairing KN-669, said a token's pairs were checked where that check is dark only. AGENTS.md
section 7 now carries the rule that came out of it: absolute coverage language on a partial
mechanism, traced through the exact iterable, branch, scheme and use sites before it is committed.

**KN-601** fixed the two-tabs e2e, which had timed out at 30 seconds every run since it was written,
so every line below its third had NEVER executed; they all pass. The suite is now 92 passed, 1
failed, 9 skipped, the one being KN-651.

**Open and worth knowing**: **KN-668**, KN-591's last child — the code step's mock notice draws
`text/secondary` on `bg/surface-secondary`, 4.3929, and the new light guard cannot see it because it
asserts tokens against `bg/surface` alone; **KN-663**, the catalog test never compares an English
message with its id; **KN-664**, the resend controls and the mock provider's naming still presuppose
a send; **KN-666**, the sidebar's «فضای کار» label is the same 2.54 defect; **KN-662**, the two Empty
State instances draw different bodies.

**Still waiting on the owner**: KN-515, KN-516, KN-517; the Search Bar and Sort Control taking
KN-275's `border/control`; **KN-486**, the `fetch`-stubbing tests of `extraction.service.ts`. The
Codex log the owner pasted holds the Groq key; never repeat that key anywhere.

**Roasts run on Codex terra, pinned**: every roast and plan review passes `--model gpt-5.6-terra`.

## What fails, measured 2026-09-16

The unit project is 1529 of 1531: the two are `session.test.ts` under load, KN-551, which passes
alone 2 of 2 every time. The storybook project loses whichever pointer-driven stories run beside
each other, KN-365 — JobCard's `Pressed`, NavItem's `Hover`, Input's `Multiline` and `Latin In A
Persian Page` in one run, each passing alone. The e2e suite is 92 passed, 1 failed, 9 skipped, the
one KN-651. `App.tsx` line 107 uncovered, KN-491. The API's gate fails on `extraction.service.ts`,
KN-486, so the api workspace's database tests are run directly, `npx vitest run src/database`, 68.

## The owner's rules, most recent first

- **2026-09-16, through the question tool.** The sign-in note and the resend timer take a colour at
  4.5 to one or better, KN-591. Asked in the same breath which wording the mocked sign-in steps
  should use, the owner answered "Is that really important that you stopped working for? Who
  cares!" **So a question of that kind is not asked again.** Where a rule already decides a thing,
  the rule decides it, the decision and its reasoning are recorded where the next reader will find
  them, and the work goes on.
- **2026-09-15, through the question tool.** The phone's add form keeps the title first, KN-358. The
  first sign-in may skip the name, "As Figma", KN-588. KarNama writes terms and privacy pages and
  the sign-in note links to them, KN-590 and KN-630. The Loading State turns an arc, KN-616.
- **2026-09-15.** GitHub Pages deep links: real paths, a page per destination, `404.html` for the rest.
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

**KN-618 is in progress**, medium, 1 point, web: `SettingsDialog.tsx` line 88 renders
`{loaded ? <Box role="status">…</Box> : null}`, so the region is inserted WITH its line inside it,
which not every screen reader announces. Measured already, and none of it is in the repository yet:

- The region sits inside `<Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>`, so an
  always-mounted empty `Box` would open 16px under the button. **That is the real design question**,
  not the conditional itself.
- The two precedents disagree, deliberately: `Input.tsx` line 364 keeps `<span role="alert">` in
  flow, which collapses when empty, KN-287; `BulkActionBar.tsx` line 128 and `JobsScreen.tsx` line
  336 keep theirs mounted but absolutely positioned and clipped, out of flow. **The clipped pattern
  cannot simply be copied here: this message is visible copy a sighted reader is meant to read.**
- `WithTrigger` in the stories, line 41, calls `updateArgs({ loaded: true })` on `onLoadSamples`, and
  the meta's args start `loaded: false`. So `Preferences`, which already presses «Load sample data»,
  moves from not-loaded to loaded — two assertions inside its existing play would meet the exit with
  **no new story and no new docs entries in either language**. Confirm the meta's `render` uses it.
- `Loaded` is args-only and proves nothing about announcement. Drift: dialog 0, stories 0, both
  `Shared-SettingsDialog.md` 14.

**KN-601's roast** was launched and its findings must be judged, filed as children with
`--parent-task KN-601`, recorded through `todo roast`, and relayed to the owner.

## What to read first

`AGENTS.md` section 7, `agent/RALPH.md`, the head of `agent/TODO_BOARD.md`, `todo show KN-618`, and
`apps/web/src/shared/settings/SettingsDialog.tsx`. **Never chain a check through a pipe into a
commit or a close, write long scripts with the Write tool, keep apostrophes out of single-quoted
strings in scripts, and read an accessibility claim from the browser's own tree.** A backgrounded
run's "exit code 0" is the shell line's, not the runner's: read the summary out of the file. When a
script edits several files, compute them all in memory and write only if every count matches. A
story proves a rendered line only where the story itself pins the global. And Playwright reuses an
existing server outside CI, so "a fresh build" means `CI=1`.
