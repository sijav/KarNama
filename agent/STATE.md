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

## Where things stand, 2026-09-17

**Codex's work of 2026-09-12 stays on main**, KN-477. It waits on twenty-five children. **KN-496
landed the dark `color-scheme` fix by hand**, so `git stash@{0}` duplicates committed code; left for
the owner to drop.

**Closed 2026-09-16 and 17**: KN-514, KN-524, KN-535, KN-543, KN-544, KN-559, KN-658, KN-542, KN-564,
KN-565, KN-589, KN-665, KN-667, KN-591, KN-601, KN-669, KN-670, KN-618, KN-675, KN-626, KN-678,
KN-651, KN-679, KN-680, KN-666, KN-668, KN-672, **KN-306** (d8c9d9f), **KN-380** (17472be),
**KN-685** (43898ec), **KN-690** (db6f4e6), **KN-691** (fb0e32b), **KN-695** (e29b86e),
**KN-698** (9a0454e), **KN-697** (fc06954, board 14bd09f). **Dropped**: KN-657, and **KN-663**
(de6157c), filed on a false premise its own plan review caught.

## KN-697, the search in the address, and it is the one to read first

**The owner asked for it directly**: after the pause, the address changes along with the results. Both
screens now read the search from the address with `useSearchParams`, and their two story metas gained
a **`MemoryRouter` decorator** — never the global one in `.storybook/preview.tsx`, because
`App.stories` renders the whole `App`, which builds its own `BrowserRouter`, and a router refuses to
nest in a router.

**Props were the alternative and one of my reasons against them was false**, which the plan review
caught: a story passing no `onSearch` would NOT force a story-only fallback, since `JobsScreen`'s meta
already supplies its callbacks through args. The choice stands on the smaller true reason, that
`JobsScreen` sets `component:` so the docs guard checks props in both directions and both languages.

**`searchStep` in `routes.ts` owns the history rule**: starting a search PUSHES so Back returns the
unsearched page, refining REPLACES so a word leaves no entry per pause, clearing PUSHES so Back undoes
the clear, and a settled value that changes nothing REPLACES with the same address rather than
returning early. **The first plan said replace always, and that cannot hold**: replacing turns `/jobs`
into `/jobs?q=…`, so the unsearched board leaves history and Back leaves the board entirely. The card
says replaced WHILE TYPING, which is about refinements.

**It is a function, and that was forced by measurement**: both screens held identical copies, and the
no-change case is reachable only through the 300 ms pause, which no story can time — it measured
uncovered at `JobsScreen.tsx:120` and `NetworkScreen.tsx:93`. `routes.test.ts` now proves six cases
with no clock.

**The add flow carries the query, and its close still PUSHES.** `/add` is a modal over the board,
`DESIGN.md` line 791, with the board visible behind it, so cancelling must not land the reader on a
board they never searched. Replacing on close was in the plan until round two showed it trades one
defect for another — it stops Back reopening the modal but leaves two identical board entries, so Back
appears to do nothing. **That history is KN-579's**, and that card now records why the first of its own
two proposed fixes does not work alone.

**The control held**: against the code as it was, with these specs in place, the two spec files are 10
failed and 12 passed — the 10 are exactly the five new or extended tests across both projects, the 12
are every pre-existing addresses test, and `search-waits` fails at the address assertion after the
pause with Expected «مدیر محصول» and Received null.

## What fails, measured 2026-09-17

The unit and storybook projects are **1958 of 1964**, where 1964 is the old 1958 plus KN-697's six new
`routes.test.ts` cases. Six failures, **none in a file KN-697 touched**:

- **Two are KN-551's** `session.test.ts` pair, matching the messages that card recorded word for word.
- **Four are KN-699's moving storybook set**, and across four runs on one tree its membership changed
  three times: `NavItem > Hover` appeared once and left, which is pointer-driven and may belong to
  KN-365 rather than KN-699; the `Input` family has grown from one story to three, `Multiline` timing
  out at 15000 ms on the story's own declaration rather than on any assertion in it.

The full e2e is **103 passed, 9 skipped**, run before and after the `searchStep` refactor, identical.
Screen stories 39 of 39, `App.stories` 14 of 14.

**Coverage is measured with `--coverage.reportOnFailure=true`**, because vitest prints no report at all
when a run fails, so a red suite hides the verdict rather than reporting it badly. `coverage/lcov.info`
is on disk from the last run: `DA:<line>,0` is an uncovered line, `BRDA:<line>,…,0` an uncovered
branch. Today: `routes.ts` has **none of either**; `App.tsx` is down to **79 and 146**, where 79 is the
hand-split KN-700 is about and 146 the pre-existing error branch; both screens' remaining uncovered
branches are the old set renumbered by the lines the refactor removed.

**"A fresh build" means `CI=1`**, and the e2e webServer runs `tsc --noEmit` first, so **a mutation that
leaves a symbol unused stops the server rather than failing a test**. The API's gate fails on
`extraction.service.ts`, KN-486.

**eslint runs from `apps/web`**; the root has no config, and `agent/` is not a workspace, so **nothing
lints `agent/scripts`**. **Drift is PRETTIER drift**, HEAD's copy against the worktree's; a NEW file
must measure 0 before it is committed, and `prettier --write` is safe only where the committed copy
already measures 0. **Read the drift, never chain it.**

## Open children, and what is waiting

**KN-698 waits on two**: **KN-700**, in progress, and **KN-701**, the two comments that overclaim.

**KN-697 waits on its roast**, which is running; whatever it finds becomes a child.

**KN-016 waits on two**: KN-689, blocked on the owner, and KN-692. **KN-062 waits on five**: KN-686,
KN-687, KN-688, KN-693, KN-694. **KN-695 waits on one**: KN-696, the contacts screen docs.

**Also open**: KN-681, KN-682, KN-684, KN-673, KN-674, KN-676, KN-677; **KN-699**, the moving storybook
failures; **KN-702**, `todo set` with no id crashing with a raw SQLite TypeError instead of usage.
**KN-683 IS FOR THE OWNER**: walking `text/secondary` to a readable value touches a Figma token across
43 sites.

**Still waiting on the owner**: KN-515, KN-516, KN-517; the Search Bar and Sort Control taking
KN-275's `border/control`; **KN-486**. Owner decided and still to build: KN-588, KN-630, KN-590,
KN-616. The Codex log the owner pasted holds the Groq key; never repeat that key anywhere.

**KN-685's discipline still binds**: the fixtures' two sentinels are named nowhere, this file included,
because `todo render` writes every description into the board and the database is committed.

## The owner's rules, most recent first

- **2026-09-16, global, and it governs every answer.** When they ask WHY, answer with the MECHANISM:
  the line, the file, the command, the condition that fired. Not an excuse, not an apology, not their
  own observation echoed back. **"I don't know" is a correct answer** where there is no log and no
  evidence; a confident guess costs more than silence. **Never invent an authority** — if nothing
  instructed it, say there was no reason; if something did, quote it. **Do not just agree with them.**
- **2026-09-16, global.** When a rule is wrong, or two rules contradict, **STOP and ask through the
  question card**, quoting both rules with file and line and what each would make you do, then wait.
  The contradiction gets REMOVED, not re-decided each time. Note that `prefer-as-const` versus KN-217's
  ban on a bare literal `as const` is NOT such a pair: a named type alias satisfies both, and the
  rule's own message names that way out.
- **2026-09-16, in chat.** "Create your own tools for it then don't hard code things common! What the
  hell? Why not routing library? It is react!" **Do not hand-roll what the ecosystem already solves.**
  KN-698 did it for routing, KN-697 for the query string with `useSearchParams`.
- **2026-09-16, in chat.** The search belongs in the ADDRESS, KN-697. Done.
- **2026-09-16.** KN-689's question went UNANSWERED; it is parked. `move <id> backlog --reason` does
  NOT park a card — `next` offers it again — `move <id> blocked --reason` does.
- **2026-09-16, in chat.** "I definetly do not want to remove that that 300ms looks like a debounce to
  me, and it is mendatory to have!" The Search Bar's 300 ms wait STAYS.
- **2026-09-16, in chat.** **A story is not a caller.** Before filing or accepting behaviour work, name
  the user action, the production screen, the prop path and the observable effect. A roast answers
  "what reaches this code?" BEFORE "is this right?"
- **2026-09-16, in chat.** **Write in plain words. Short sentences. No jargon.** Explain what actually
  happens before asking for anything, and check what the code really does before asking about it.
- **2026-09-15, through the question tool.** Phone add form keeps the title first, KN-358. First
  sign-in may skip the name, KN-588. Terms and privacy pages, KN-590 and KN-630. Loading State turns an
  arc, KN-616.
- **2026-09-14.** The board is the todo skill's database. Shared skills serve ALL projects: a change
  only adds. A model's work is never roasted by that model. "It should look like the figma." The owner
  reads on a phone: literal truth, no excuses. An instruction carries its date.
- **2026-09-11.** Push after every close. Only new component cards and their blockers are `critical`.
  No proof at the close. Roasts stay. A finding about the loop is `low`. **Do not invent gates.**
- **A finding is a CHILD of its task**, one level, with `--area` and `--okr`. **Plans live beside the
  work**, checked by `roast.py plan` before building, and they stay.

## The next step: KN-700, the shell still parses the path itself

**In progress**, high, 2 points, web, a child of KN-698. Its plan is written at
`apps/web/src/app/#KN-700 - The shell still parses the path itself.md` and is **with Codex for review**;
it is deliberately uncommitted until that round's corrections are in it, which is how KN-697's plan was
handled.

**What is wrong**: `App.tsx` lines 79 and 80 split `pathname` by hand, while a react-router `<Route
path="/network">` matches the WHOLE remaining pathname unless it ends in a wildcard. At
`/network/anything` the split says `network` and lights the Network tab, while the router matches only
`<Route path="*">` and draws the BOARD. Reachable, because Pages answers an unknown path with
`404.html`, which is the app.

**The decision recorded rather than escalated**: that address should show the board with the jobs tab.
There is no page under `/network` — `DESIGN.md` names three destinations and no sub-pages — so the fix
is to stop the tab disagreeing with the page, not to invent a sub-page.

**The fix**: delete `asked` and take `current` from the router's own match against the same `PATH`
values the routes use. `useMatch`, `useMatches`, `matchPath` and `useResolvedPath` are all present in
7.18.3, checked by importing the module. **A second gain**: line 79's `?? ''` is one of `App.tsx`'s two
remaining uncovered branches and goes with `asked`.

**What must not change**: line 110's add→jobs mapping, which `App.stories`'s `Navigating` asserts while
the dialog is open; line 140's `overflowY`; KN-697's guard, which compares the PATH rather than
`current`; and `SidebarProps.current` being a required `Destination`.

## What to read first

`AGENTS.md` section 7, `agent/RALPH.md`, the head of `agent/TODO_BOARD.md`, and for this card
`apps/web/src/app/App.tsx` with the plan beside it.

**An end-to-end test proves behaviour and covers NOTHING**: coverage is counted by the unit and
storybook projects only, so when a change adds a branch, ask which STORY reaches it.

**An argument list has a size limit**, and the command that dies on it reports the shell line's
success: KN-697's first roast printed `Argument list too long` under a notification saying exit 0.
Measure the pieces with `wc -c` before sending them.

**`clock.install()` does NOT stop time** — only `pauseAt` or `fastForward` does. Install at a fixed
time, let the page load, then pause, then `runFor`. **`fill()` cannot show a debounce**;
`pressSequentially` types key by key.

**A line that prints a verdict unconditionally is not a verdict**, and **a substring search cannot tell
an export from a eulogy** — strip comments before searching source for a name. **A plan that
inventories behaviour is a checklist for the END of the build.** **A failure set that MOVES between
identical runs is a flake; one that holds still is a break.** **Uncovered line numbers shift when lines
are removed**, so compare the set, not the numbers.

A backgrounded run's "exit code 0" is the shell line's: read the summary line and refuse it on
"skipped" or a zero total. The runner names a story's test by its DISPLAY name, spaced. A grep of a
barrel `.d.ts` is a false-negative machine; importing the module is the check that works. Write long
scripts with the Write tool, and keep apostrophes out of single-quoted strings.
