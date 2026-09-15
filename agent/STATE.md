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

**Closed 2026-09-16**: **KN-514** (ebd4f57), the job modal's footer giving its delete a row of its
own, DESIGN.md recording it (3bb60c1); roast filed **KN-653**. **KN-524** (a43bb15), the story-docs
parser's fences as CommonMark's at the top level; roast found nothing. **KN-535** (74d9239),
`ActingWhileSearching`; roast filed **KN-654**. **KN-543** (f5ab9f5), the API's seed in the design's
order; roast filed **KN-655**. **KN-544** (962fd07), a column folding by which status it is, with
`REJECTED` in `records.ts`; roast filed **KN-656** and raised **KN-542** to medium. **KN-559**
(16b8034), the add modal's `Review` asserting the height the room allows, proved in a production
Storybook's manager; roast filed **KN-657**. **KN-658** (247d8b9), the px literal KN-559 left in a
story, which had the theme's literal guard failing the unit project on main: the cap's number is
written once and its text built from it, and **KN-657 was dropped**, the comment it named being
gone. **KN-542** (5c3989c; board 56fad43), the sample loader matching a default by its id alone;
its roast is running, as is KN-658's. KN-551 was given the messages its card asked for.

**Closed 2026-09-15, each roast recorded**: KN-348 (KN-628, KN-629); KN-349; KN-358; KN-359
(KN-632); KN-362 (KN-633 to KN-635); KN-370; KN-385 (KN-636); KN-413 (KN-637, KN-638); KN-432;
KN-434 (KN-639, KN-640); KN-435; KN-439 (KN-641, KN-642); KN-444; KN-448 (KN-643); KN-449
(KN-645); KN-455; KN-461 (KN-646 to KN-648); KN-470 (KN-649); KN-489 (KN-650); KN-490 (KN-652);
KN-496. **Dropped**: KN-387, KN-474, KN-657.

**Rounds waiting**: KN-013 on twelve, KN-219, KN-232, KN-556 to KN-558, KN-564, KN-566, KN-568,
KN-569, KN-609, KN-644 and KN-658; KN-440 on KN-545; KN-431 on KN-536 and KN-654; KN-543 on KN-655;
KN-544 on KN-656; KN-514 on KN-653; KN-007 on KN-407 and KN-408; KN-018 on KN-621 and KN-622;
KN-024 on KN-623; KN-025 on KN-620; KN-020 on KN-339, KN-383 and KN-624; KN-026 on KN-384, KN-385
and KN-625; KN-027 on KN-651 among its five; KN-028 on KN-346, KN-626 and KN-627; KN-031 on KN-628
and KN-629; KN-439 on KN-641 and KN-642; KN-448 on KN-643; KN-449 on KN-645; KN-461 on KN-646 to
KN-648; KN-470 on KN-649; KN-477 on twenty-one. **Still open from earlier**: KN-009 waits on
KN-614; KN-022 on KN-327, KN-615, KN-616 and KN-619; KN-012 on KN-333, KN-334 and KN-357; KN-029 on
its other children.

**What fails in a full run**: the Job Card's `Pressed`, and at times ContactCard's
`Full On A Phone`, in parallel only, KN-365's kind. `session.test.ts` fails under load, KN-551:
its demo case times out at 5 seconds and its live case then sees the request spy called twice; rerun
the file alone, then read the unit project. In the e2e suite, the two-tabs test of a tab part way
through signing in, KN-601, and the phone network selection, KN-651, fail every run. `App.tsx` line
107 uncovered, KN-491. The API's gate fails on `extraction.service.ts`, KN-486, so the api
workspace's database tests are run directly, `npx vitest run src/database`, 68 of them.

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

1. **Two roasts are running**, `kn658-roast.mjs` and `kn542-roast.mjs`, writing their `.txt` files:
   judge each finding against the code, file survivors with `--parent-task KN-658` or
   `--parent-task KN-542`, `--area web --okr OKR-1`, record each round through `todo roast`, naming
   the file it wrote, what was filed and what was dismissed, and relay both to the owner.
2. **KN-564 is in progress**, medium, 1 point, web, from KN-013's roast: App/Shell's
   `SignedOutInAnotherTab` dispatched its first storage event 9 ms after the providers' listeners
   were added and JobsScreen's `ChangedInAnotherTab` 23 ms after, measured by KN-560 on a production
   Storybook, where `SignedInInAnotherTab`, dispatching 11 ms before its listeners, failed. Exit:
   neither dispatches before the listeners are on the window, shown by the same timing on a
   production Storybook, and both still pass under Vitest and in the production build. KN-560 added
   a mark the play waits for, which these two reuse.

## What to read first

`AGENTS.md` (section 7), `agent/RALPH.md`, the head of `agent/TODO_BOARD.md`, `todo show KN-564`,
KN-560's plan and the mark it added, `App.stories.tsx`'s `SignedOutInAnotherTab` and
`SignedInInAnotherTab`, and `JobsScreen.stories.tsx`'s `ChangedInAnotherTab`. **Never chain a check
through a pipe into a commit or a close, write long scripts with the Write tool, keep apostrophes
out of single-quoted strings in scripts, find a story's controls inside `#storybook-root`, and read
an accessibility claim from the browser's own tree.** Keep a failing run's full output in a file
before filtering it; give a `-t` filter a positive control, since a run that matches nothing exits 0
with every test skipped; and **when a story changes, run the unit project too**, which is where the
story guards live: KN-559 closed without it and left the literal guard red, KN-658.
