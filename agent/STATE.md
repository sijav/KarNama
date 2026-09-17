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
**KN-698** (9a0454e), **KN-697** (fc06954), **KN-700** (e5cf4a9), **KN-693** (6ac6aeb), **KN-696** (ff0c445), **KN-701** (b5c9491), **KN-706** (19587b9), **KN-707** (df31739), **KN-708** (6454eb9), **KN-389** (5c5b31a), **KN-710** (996653f), **KN-711** (3c2df74), **KN-407** (7b0ca8d), **KN-426** (1a8fc05), **KN-468** (9422275, board cea8450). **Dropped**: KN-657, and **KN-663**
(de6157c), filed on a false premise its own plan review caught.

## KN-697, the search in the address

Both screens read the search from the address with `useSearchParams`, and their story metas carry a
**`MemoryRouter` decorator**, never the global one, because `App.stories` renders the whole `App`, which
builds its own `BrowserRouter`, and a router refuses to nest in a router.

**`searchStep` in `routes.ts` owns the history rule**: starting a search PUSHES so Back returns the
unsearched page, refining REPLACES so a word leaves no entry per pause, clearing PUSHES, and a settled
value that changes nothing REPLACES rather than returning early. It is a function because both screens
held identical copies and the no-change case is reachable only through the 300 ms pause, which no story
can time; `routes.test.ts` proves six cases with no clock. The add flow carries the query and its close
still PUSHES, which is KN-579's history, not this card's.

## What fails, measured 2026-09-17

The unit and storybook projects are **1958 of 1964**, where 1964 is the old 1958 plus KN-697's six new
`routes.test.ts` cases. Six failures, **none in a file KN-697 touched**:

- **Two are KN-551's** `session.test.ts` pair, matching the messages that card recorded word for word.
- **Four are KN-699's moving storybook set**, and across four runs on one tree its membership changed
  three times: `NavItem > Hover` appeared once and left, which is pointer-driven and may belong to
  KN-365 rather than KN-699; the `Input` family has grown from one story to three, `Multiline` timing
  out at 15000 ms on the story's own declaration rather than on any assertion in it.

The full e2e is **107 passed, 9 skipped**, the four above 103 being KN-700's two new tests across both
projects. Screen stories 39 of 39, `App.stories` 14 of 14, and the story-docs guard 12 of 12.

**Coverage is measured with `--coverage.reportOnFailure=true`**, because vitest prints no report at all
when a run fails, so a red suite hides the verdict rather than reporting it badly. `coverage/lcov.info`
is on disk from the last run: `DA:<line>,0` is an uncovered line, `BRDA:<line>,…,0` an uncovered
branch. Today: `routes.ts` has **none of either**, and `App.tsx` is down to **one**, line 155, the
pre-existing `{error ? (` branch — KN-700 took line 79's `?? ''` away with the hand-split, and 146 became
155 because that change added nine lines. **Uncovered line numbers SHIFT when lines are removed**, so
compare the set and not the numbers, or open the line and read it.

**"A fresh build" means `CI=1`**, and the e2e webServer runs `tsc --noEmit` first, so **a mutation that
leaves a symbol unused stops the server rather than failing a test**. The API's gate fails on
`extraction.service.ts`, KN-486.

**eslint runs from `apps/web`**; the root has no config, and `agent/` is not a workspace, so **nothing
lints `agent/scripts`**. **Drift is PRETTIER drift**, HEAD's copy against the worktree's; a NEW file
must measure 0 before it is committed, and `prettier --write` is safe only where the committed copy
already measures 0. **Read the drift, never chain it.**

## Open children, and what is waiting

**KN-698 waits on two**, KN-701 being closed and its own roast having filed another: **KN-704**, from KN-700's roast — the new
routing tests run at base `/`, so the production basename is argued from the router's implementation rather than
browser-tested, and the defect KN-700 fixed lived precisely under that basename. KN-700 itself is closed, and the board
flattened KN-704 onto KN-698 by the one-level rule rather than hanging it off a child. And **KN-708**,
from KN-701's roast: the module note in `routes.ts` still says "the three things it has no opinion
about" when KN-697 made it five, adding `QUERY` and `searchStep`; and the `PATH` comment KN-701 itself
wrote says an unrouted destination "draws the board", which holds only past the auth gate, since `Shell`
returns `AuthScreen` before `<Routes>` exists. **The lesson is how both survived**: KN-701's close
asserted that note was UNCHANGED, and that decision was right about the clause the card named while
neither I nor the review read the rest of the paragraph it sits in.

**KN-697 waits on one**: **KN-703**, its plan's section 3 still saying only `src/app` imports the router and that the
screen stories render bare — both true when written and both made untrue by that card's own change.

**KN-016 waits on two**: KN-689, blocked on the owner, and KN-692. **KN-062 waits on five**: KN-686,
KN-687, KN-688, KN-694, and **KN-705** from KN-693's roast — the verifier echoes its build environment
at startup, `VITE_API_URL` included, so a value supplied through the environment that contains a
sentinel prints before any check runs, which falsifies KN-693's own universal claim. **KN-695 has NO
open children left**, so the board asked for a round on the PARENT together with every child, on whether
KN-695 was actually finished. **That round ran and said it is NOT**, filing two. **KN-706 is closed** and
deliberately edited nothing, taking its exit's record why branch: the four entries are scenario
itineraries where timing is incidental, while `Debounced` and `CountsDownToAResend` exist to demonstrate
timing, and its own roast upheld that and closed the last hole, since `DocsPage.tsx` renders the
introduction before all story prose so no reader meets an entry without the contract. **KN-707 is closed too**, the Search Bar docs having claimed the contacts page gives no accessible label
while `NetworkScreen` passes one and both `ItsOwnSearch` stories assert it. Its label entry keeps the
example and keeps KN-430 as history, in two sentences, with the Persian borrowing its own placeholder
phrase. **So all three children are finished, and the SECOND parent round has now run and found NOTHING**,
which is the terminating condition the board asks for: KN-695 is finished, after three children and three
rounds. That round judged the factoring right, `searchStep` holding the one decision that must not drift
while the remaining screen glue owns each screen's local field, and reported no false current claim in the
comments, documentation, names or commits. The first round had already confirmed the behaviour and
`searchStep` are right, and that KN-697 changed where the applied value is stored rather than the wait.

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

## Recently closed, and the one durable thing each settled

**KN-389** (5c5b31a). The owner ruled, 2026-09-17: a column a search emptied changes its MESSAGE, not its
count. KN-422 had closed critical on the count being the status's OWN after a searched zero enabled Delete
and took hidden records, so the count stands and the sentence moves. **The rule is in `DESIGN.md`** under
the kanban column. The signal is `sizeOf(id) > 0 && cardsOf(id).length === 0`, carried by two call sites,
the column and `JobsScreen` 549 where the phone renders `EmptyColumn` directly. Figma did not settle it:
`305:1547` is a structural copy of `305:1696`, and `241:2` already draws count `1` beside the empty frame.
**Still owed**: `JobsScreen` 414 gives the phone's Filter Chips the SEARCHED count, which is KN-712.

**KN-710** (996653f). `AGENTS.md` line 461 now records that a regex comment stripper cannot prove a change
is comments only, being no lexer, and that `git diff` does not settle it either, being line based; reading
the changed lines does, and NEITHER IS A GATE. **The card corrected its own exit**, which had asked for a
check that refuses, against rule zero and the owner's 2026-09-11 retirement of per-task verifier scripts.
Its roast then found my KN-685 justification backwards, since KN-685 DID correct closed board evidence
through the database and only refused to rewrite an exit condition; that is KN-713.

**KN-711** (3c2df74). The module note says "which path each destination answers to" again, not "the paths
this app answers to": `/jobs` has no route of its own and the wildcard answers everything, so the old
phrase described the route table while the module owns the map. Fifth in that chain and the first where
the neighbouring clauses checked out clean.

**KN-407** (7b0ca8d). The coverage exclusion for `DocsPage.tsx` and `useDocsLocale.ts` now gives the reason
that is TRUE, in all three places that stated the untrue one: `vitest.config.ts`, the hook, and
`docs-locale.ts`, which is the file that is actually tested and said it in the present tense. The measured
reasons: the unit project is node with no DOM in either package and all four of its React tests use
`renderToString`, which never runs an effect; a fake `DocsContext` needs 12 of 13 required members and two
Storybook internals faked, with no default to spread since it is `createContext(null)`; and KN-103 discards
a story's coverage of any file the unit project also touches. **It took the exit's second branch**, which
the exit names, and the card was re-estimated 2 points to 1 rather than quietly costing less. The comment
no longer offers a manual look as coverage, and KN-408 is named as the one behaviour known to be missing.

**KN-426** (1a8fc05). **The owner ruled, 2026-09-17: a disabled Icon Button stays REACHABLE, like the Menu.**
It is off by `aria-disabled` with its press refused, so it keeps the tab order, still takes a hover, and its
Tooltip opens on both triggers and says why. It went to the question card because two sets of records
disagreed for analogous controls, the docs and the `Disabled` story against `DESIGN.md` 668 to 670 and
`Menu.tsx`. **The card's stated mechanism was wrong** and its own note said so: not the browser withholding
pointer events, but MUI's native attribute removing focus and `.Mui-disabled` suppressing pointer events,
with `Tooltip` cloning rather than wrapping. **TWO styling traps**, the second found by the review: the drawn
state was keyed on a class MUI would stop adding, and the hover fill would have lit up a disabled button once
its pointer events returned. **Six documentation sites**, not the four first counted; the last two were found
only by opening an entry to use as an anchor. The rule is in `DESIGN.md`.

**KN-468** (9422275). **The modal forms ARE in the accessibility tree**, measured rather than reasoned
about: all four `display: contents` forms, the contact modal, change status, the add flow's review step and
the board's rename, show a `form` node with their fields nested under it in the Chromium the storybook
project drives. Each was attributed rather than assumed, and the rename needed a DESKTOP viewport, since at
phone width the column has no menu, so the first reading found nothing and was not evidence. Naming was
measured to work too, `aria-label` on a live one turning `form` into a named node. **They stay unnamed**,
the exit's second branch and the one the original roast conditioned on intent: KN-463 built these forms for
submission, Enter and autofill, and each sits inside a dialog its heading already names. The rule is in
`DESIGN.md`, narrowed as the review required: the worry DID NOT REPRODUCE in the measured build, which is
what four readings in one engine establish and no more, since the CSS Display specification still warns
that browsers get these semantics wrong.

## The next step: KN-473, the focus fallback is skipped when the modal unmounts

**In progress**, medium, 2 points, web, from the KN-344 roast.

`ConfirmModal` takes an `opener` and a `fallback`, KN-344, and `settle` moves focus to the fallback only
when the opener is gone. It is wired ONLY as `onClosed`, and only when a `fallback` was given; `Modal` 129
maps that to MUI's `onTransitionExited`. **That cannot fire once React has removed the Dialog**, so Back, a
route change, or any parent that stops rendering leaves focus on a detached opener with nothing to catch it.

**Scope is bounded**: exactly two callers pass the pair, `JobsScreen` 786 and 791 and `NetworkScreen` 304
and 309, both falling back to the first surviving landing or the page. No story passes either today.

**TO SETTLE IN THE PLAN**: where the cleanup belongs, since the card says "the shell" while `opener` and
`fallback` live on `ConfirmModal` and `Modal` knows nothing of them; and how a cleanup avoids settling TWICE
on a normal close, or stealing focus from a modal that was never open, which means reading `open` at unmount
rather than closing over a stale prop.

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
