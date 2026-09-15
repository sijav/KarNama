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

**Codex's work of 2026-09-12 stays on main**, KN-477: login mocked at the owner's
word, Groq extraction on Render, Settings, drag and drop, collapse, date
validation, the growing paste field, the job modal's form. Its surviving review
findings are KN-484 to KN-503 and KN-521; the dark `color-scheme` fix waits in
`git stash@{0}` as KN-496.

**The owner answered four questions on 2026-09-15**, through the question tool; see the rules
below. KN-358 is closed on it; **KN-588** is to build the skip; **KN-590** waits on **KN-630**, the
pages; **KN-616** is to build the arc, medium, 3 points. DESIGN.md records three of them; section
4's "required there" is corrected when KN-588 is built. **Still waiting on the owner**: KN-515,
KN-516, KN-517 (asked 2026-09-14); the Search Bar and Sort Control taking KN-275's
`border/control`, and **KN-486**, the `fetch`-stubbing tests of `extraction.service.ts` (both asked
in chat 2026-09-15). **Filed and not yet asked**: KN-589 and KN-591. The Codex log the owner pasted
holds the Groq key; never repeat that key anywhere.

**Roasts run on Codex terra, pinned**: every roast and plan review passes
`--model gpt-5.6-terra`, AGENTS.md section 7.

**Closed today, each roast recorded**: KN-348 (filed KN-628, KN-629); KN-349 (nothing); KN-358
(nothing); KN-359 (KN-632; KN-631 dropped as a duplicate of KN-413); KN-362 (KN-633, KN-634,
KN-635); KN-370 (nothing); KN-385 (KN-636); KN-413 (KN-637, KN-638); KN-432 (nothing); KN-434
(KN-639, KN-640); KN-435 (nothing); KN-439 (KN-641, KN-642). KN-387 is dropped: the language
switch it would have styled is the flag Icon Button of KN-478 and KN-479. Earlier: KN-345 (KN-626,
KN-627), KN-343 (KN-625), KN-338 (KN-624), KN-336, KN-335 (KN-621, KN-622), KN-332, KN-331
(KN-620), KN-024's round (KN-623).

**Rounds waiting**: KN-018 on KN-621 and KN-622; KN-024 on KN-623; KN-025 on KN-620; KN-020 on
KN-339, KN-383 and KN-624; KN-026 on KN-384, KN-385 and KN-625; KN-028 on KN-346, KN-626 and
KN-627; KN-031 on KN-628 and KN-629; KN-439 on KN-641 and KN-642. **Still open from earlier**:
KN-009 waits on KN-614; KN-022 on KN-327, KN-615, KN-616 and KN-619; KN-012 on KN-333, KN-334 and
KN-357; KN-029 on its other children.

**What fails in a full run**: the Job Card's `Pressed`, and at times ContactCard's
`Full On A Phone`, in parallel only, KN-365's kind. `session.test.ts` overruns its 5 seconds while
the machine is loaded, KN-551, as it did in the full runs of KN-435, KN-439 and KN-444: rerun the
file alone, then read the unit project. `App.tsx` line 107 uncovered, KN-491. The API's gate fails
on `extraction.service.ts`, KN-486.

## The owner's rules, most recent first

- **2026-09-15, answered through the question tool.** The phone's add form keeps the title first,
  KN-358. The first sign-in may skip the name, as Figma's «بعداً کاملش می‌کنم» draws it, "As
  Figma", KN-588. KarNama writes terms and privacy pages and the sign-in note links to them,
  KN-590 and KN-630. The Loading State turns an arc instead of the dots, KN-616.
- **2026-09-15.** GitHub Pages deep links: real paths, a page per destination, `404.html` for the
  rest.
- **2026-09-14.** The board is the todo skill's database. The shared skills serve ALL projects: a
  change only adds. A model's work is never roasted by that model. "It should look like the figma."
  The owner reads on a phone: literal truth, no excuses. An instruction carries its date; a later
  one overrides.
- **2026-09-12, to Codex, still standing.** Mock the login. Keep the sample data and the AI
  extraction. Commit and push after work. Never ask the owner to redeploy when nothing changed.
- **2026-09-11.** Push after every close: commit, close, push, then roast. Only new component cards
  and their blockers are `critical`. No proof at the close. Roasts stay. A finding about the loop is
  `low`. 100 percent coverage. **Do not invent gates.**
- **A finding is a CHILD of its task**, one level, with `--area` and `--okr`. **Plans live beside
  the work**, checked by `roast.py plan` before building, and they stay.

## The next step

1. **KN-444 is closed** (9062dbb; board 3ecf3dd): `isTheFiles` in `SearchBar.stories.tsx` reads the
   input's top, its 22 and the icon's top against the file's 7 and 8 in the 36 bar and 11 and 12 in
   the 44, and Filled reads its clear control at 12. Three changes to `SearchBar.tsx` passed the
   old stories and fail the new; the plan review approved. **Its roast is running**,
   `kn444-roast.mjs` writing `kn444-roast.txt`: judge, file with
   `--parent-task KN-444 --area web --okr OKR-1`, record, relay.
2. **KN-448 is in progress**, medium, 1 point, web: the Icon Button spreads a Tooltip's props
   before its own, so an `onFocus` or `onMouseOver` of its own would one day replace MUI's composed
   handlers and the tip would stop opening. Exit: the injected props are spread last, and the
   comment says what that protects. Measure first.

## What to read first

`AGENTS.md` (section 7), `agent/RALPH.md`, the head of `agent/TODO_BOARD.md`, `todo show KN-448`,
`IconButton.tsx` and its stories, and the KN-448 plan beside them once written. **Never chain a
check through a pipe into a commit or a close, write long scripts with the Write tool, keep
apostrophes out of single-quoted strings in scripts, find a story's controls inside
`#storybook-root`, and read an accessibility claim from the browser's own tree.** The Persian
catalog is `apps/web/src/i18n/locales/fa-IR.ts`.
