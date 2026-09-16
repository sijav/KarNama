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

**Codex's work of 2026-09-12 stays on main**, KN-477. It waits on twenty-five children. **KN-496
landed the dark `color-scheme` fix by hand**, so `git stash@{0}` duplicates committed code; left for
the owner to drop.

**Closed 2026-09-16**: KN-514, KN-524, KN-535, KN-543, KN-544, KN-559, KN-658, KN-542, KN-564,
KN-565, KN-589, KN-665, KN-667, KN-591, KN-601, KN-669, KN-670, KN-618, KN-675, KN-626, KN-678,
KN-651, KN-679, KN-680, KN-666, KN-668, KN-672, **KN-306** (d8c9d9f), **KN-380** (17472be),
**KN-685** (43898ec), **KN-690** (db6f4e6), **KN-691** (fb0e32b), **KN-695** (e29b86e),
**KN-698** (9a0454e, board 1f431f6). **Dropped**: KN-657, and **KN-663** (de6157c), filed on a false
premise its own plan review caught.

## KN-698, the router, and it is the one to read first

**react-router 7.18.3 owns the ROUTES**, though not yet every reading of the address — see KN-700
below — and it is pinned EXACTLY rather than `^7.18.3`, because the caret
admits 7.18.4, which the owner's seven-day `min-release-age` refuses. Four facts fix the version and
each cost a probe: 8.4.0 needs react `>=19.2.7` and the app is on **19.0.8**; 8.4.0 also needs node
`>=22.22` while the root declares `>=22.12.0`, and this machine's node 24 is exactly how that goes
unnoticed; `min-release-age` refuses 8.4.0, a day old; and it refuses 7.18.4 the same way, leaving
**7.18.3, 19 days old**, as the newest that installs. A react bump card is still owed, and it now
carries the node floor with it.

**What `src/app/` is now.** `App.tsx` resolves `BASE` with `siteBase`, migrates a legacy hash in a
`useState` initialiser, and only then renders `<BrowserRouter basename={BASE}>`. **That ordering is
the whole trap**: `replaceState` fires no `popstate`, so a router that had already read its location
would route `/` while the address said `/network`. `routes.ts` keeps `pathForHash`, `siteBase` and now
**`PATH`, a mapped type tying each destination to its own path**; `destinationIn` and `addressOf` are
gone. `Shell` reads `useLocation`, writes with `useNavigate`, and `<Route path="*">` renders the board
so a mistyped address still shows the archive rather than redirecting.

**The one real regression was mine, and the test this card rewrote caught it.** The rewrite dropped
the guard the hand-rolled shell had, _push unless the path is already current_, **which the plan file
had inventoried at line 30**. react-router pushes whatever address it is handed, so clicking the page
already shown added an entry and Back would return to the same page once per click. `Navigating`
failed with four entries where it expected three. The guard is back, comparing the **path** rather
than the current destination, so a mistyped address is still fixed by pressing the page nearest it.
**The spy it replaced could not have caught this**: a router calls its own history implementation, so
a spy on `window.history.pushState` goes silent for reasons unrelated to the guarantee.

**Deleting a helper exposed five literals to lingui**, because `addressOf`'s parameter was a
`Destination` union and **`useTsTypes` skips a literal typed as a union of string literals**. The fix
is a TYPE, not an exemption: adding `path` to the config's `structuralProps` would exempt the NAME in
every file, which is the hole KN-095 closed for `title`. So nothing is silenced and `TECH-DEBT.md`
gains no entry. **`eslint.config.js` is worth reading before touching**: its comments record which
exemptions were holes and why each was removed.

**Its roast found two, both filed as children, and both are real.** **KN-700**: `Shell` still splits
`pathname` by hand to decide which destination is current, and at `/network/anything` that says
`network` while react-router matches no `/network` route — a route path matches the whole remaining
pathname unless it ends in a wildcard — so the wildcard draws the BOARD with the network tab marked
current. Reachable, because Pages answers that address with `404.html`, which is the app. **This is
the hand-rolled routing the card set out to delete, surviving where the card did not look.**
**KN-701**: two comments of mine claim more than the code does — `PATH`'s mapped type forces an ENTRY
for every destination, never a matching `<Route>`. **Clean bills worth keeping**: the modal
arrangement and the Pages 404 behaviour are right; the hash migration is idempotent under StrictMode,
though it stays a render-time side effect resting on that idempotence; and the `pathname`-versus-`PATH`
guard is correct for `/`, `/nowhere` and canonical routes alike.

## What fails, measured 2026-09-16, after KN-698

The unit project is **1953 of 1958 over 96 files**. Two are `session.test.ts`, **KN-551**, whose notes
record the identical messages: `Test timed out in 5000ms` at line 9 and `expected vi.fn() to be called
1 times, but got 2 times` at line 31. The other three **MOVE BETWEEN IDENTICAL RUNS** — Input
`Multiline` and JobCard `Pressed` in one, those plus Input `Latin In A Persian Page` in the next —
which is a flake rather than a break, and they are filed with their messages as **KN-699**. JobCard's
reads `expected rgb(243, 244, 246) to be rgb(255, 255, 255)`, where the ACTUAL is the pressed grey and
the EXPECTED is white, so what failed is the `computed()` helper that borrows the host's inline style,
not the component. The full e2e is **97 passed, 9 skipped**; `addresses.spec.ts` alone is **12 of 12**
across desktop and mobile.

**"A fresh build" means `CI=1`**, since the config reuses a running server otherwise, and its
webServer runs `tsc --noEmit` first, so **a mutation that leaves a symbol unused stops the server
rather than failing a test**. `App.tsx` line 107 uncovered, KN-491. The API's gate fails on
`extraction.service.ts`, KN-486.

**eslint runs from `apps/web`**, which is where the config is; the root has none, and `agent/` is not
a workspace, so **nothing lints `agent/scripts`**. **Drift is PRETTIER drift**, lines a format would
change, HEAD's copy against the worktree's; a NEW file must measure 0 **before** it is committed.
**Read the drift, do not chain it**: the script prints its verdict and exits 0 either way.

## Open children, and what is waiting

**KN-016 waits on two**: **KN-689**, blocked on the owner, and **KN-692**, that no story pins that a
layout change leaves a pending search alone.

**KN-062 waits on five**: KN-686, KN-687, KN-688, and from KN-685's roast **KN-693** and **KN-694**.

**KN-695 waits on one**: **KN-696**, the contacts screen docs never got the wait in either language.

**KN-698 waits on two**, both from its own roast: **KN-700**, the hand-split `current` that disagrees
with the router, and **KN-701**, the two comments that overclaim.

**Also open**: KN-681 and KN-682 from KN-666; KN-684 from KN-668; KN-673 and KN-674 from KN-618;
KN-676 and KN-677 from KN-675; **KN-699**, the moving storybook failures. **KN-683 IS FOR THE OWNER**:
walking `text/secondary` to a readable value touches a Figma-defined token across 43 sites.

**Still waiting on the owner**: KN-515, KN-516, KN-517; the Search Bar and Sort Control taking
KN-275's `border/control`; **KN-486**, the `fetch`-stubbing tests of `extraction.service.ts`. Owner
decided and still to build: KN-588, KN-630, KN-590, KN-616. The Codex log the owner pasted holds the
Groq key; never repeat that key anywhere.

**KN-685's discipline still binds**: the fixtures' two sentinels are held by their own locale JSON and
by no other file, and **the values are named nowhere**, this file included, because `todo render`
writes every description into the board and the database is committed. Read them from the JSON.

## The owner's rules, most recent first

- **2026-09-16, in chat, and it is a general rule not a one-off.** "Create your own tools for it then
  don't hard code things common! What the hell? Why not routing library? It is react!" **Do not
  hand-roll what the ecosystem already solves.** KN-698 did it for routing; **KN-697 is the same rule
  applied to the query string**, and react-router answers it with `useSearchParams`.
- **2026-09-16, in chat.** "When user write something on search after denounce url changes along with
  search results and what not, does that make sense? I mean how hard could it be to do like this."
  **The search belongs in the ADDRESS**, KN-697. Debounce, and yes it makes sense: a searched board
  today cannot be shared, bookmarked or reloaded.
- **2026-09-16, and KN-689's question went UNANSWERED.** It was put in plain words and the owner asked
  for KN-697 instead, so **KN-689 is parked**: `move <id> backlog --reason` does not park a card, a
  reason there is a comment and `next` offers it again; `move <id> blocked --reason` is what works.
- **2026-09-16, in chat.** "I definetly do not want to remove that that 300ms looks like a debounce to
  me, and it is mendatory to have!" **The Search Bar's 300 ms wait STAYS**, and KN-695 made the
  screens use it.
- **2026-09-16, in chat, on what caused it.** "Only the component's own tests use something is a damn
  red flag... if something only happens because of a test, then an e2e test needs to happen for it not
  just unit". **A story is not a caller.** Every callback prop gets an `fn()` by the working
  agreement, so every prop looks used the moment it exists. **Before taking or filing a card about a
  behaviour, name the user action that reaches it and the screen that passes the prop.** And **a roast
  answers "what reaches this code?" before "is this right?"**
- **2026-09-16, in chat, after I put a question to them nobody could read.** **Write in plain words.
  Short sentences. No jargon**, and "commit", "provenance" and "contract" are jargon. **Explain what
  actually happens before asking for anything**, walking it as a user meets it. And **check what the
  code really does before asking about it**.
- **2026-09-16, in chat.** "are you commiting and pushing after fixes", yes: work commit, card closed
  with evidence, board rendered and committed, then a push.
- **2026-09-15, through the question tool.** The phone's add form keeps the title first, KN-358. The
  first sign-in may skip the name, KN-588. KarNama writes terms and privacy pages, KN-590 and KN-630.
  The Loading State turns an arc, KN-616.
- **2026-09-14.** The board is the todo skill's database. The shared skills serve ALL projects: a
  change only adds. A model's work is never roasted by that model. "It should look like the figma."
  The owner reads on a phone: literal truth, no excuses. An instruction carries its date.
- **2026-09-12, to Codex, still standing.** Mock the login. Keep the sample data and the AI
  extraction. Commit and push after work.
- **2026-09-11.** Push after every close. Only new component cards and their blockers are `critical`.
  No proof at the close. Roasts stay. A finding about the loop is `low`. **Do not invent gates.**
- **A finding is a CHILD of its task**, one level, with `--area` and `--okr`. **Plans live beside the
  work**, checked by `roast.py plan` before building, and they stay.

## The next step: KN-697, the search in the address

**In progress**, high, 3 points, web. **ITS DESCRIPTION IS STALE AND MUST NOT BE BUILT FROM.** It was
written before KN-698 and describes `destinationIn`, `addressOf`, a hand-rolled `navigate()` and a
`popstate` listener. All four are gone. What is true now is the router section above.

**What the card asks, which still stands**: after the pause the address carries the search text;
opening that address restores both the field and the narrowed board; Back returns to the board as it
was; changing page drops the search. **Two decisions it names explicitly**: the address is **replaced**
rather than pushed while typing, or one search adds a history step per pause; and a search is not
carried onto another page.

**What the code gives you.** Both screens already keep the two values KN-695 built, `typedSearch` for
the field and `appliedSearch` for filtering, and **each reads the search text in exactly TWO places**,
the filter and the field — counted in KN-695, so this is a small substitution rather than a sweep.
The address should be written from `onSearch`, which is the debounced one, never from `onChange`.
react-router's `useSearchParams` is the ecosystem answer the owner's rule demands, and
`setSearchParams(next, { replace: true })` is the replace half. **Dropping the search on a page change
is already the behaviour**, since the navigation writes `PATH[destination]` and nothing else, so that
half is an assertion to add rather than code to write.

**Watch the guard.** `onNavigate` skips navigation when `pathname` already equals the destination's
path, so a reader pressing the page they are on keeps their query. That is deliberate.

**Where the proof lives**: `apps/web/e2e/addresses.spec.ts` already owns what the address says, and
`search-waits.spec.ts` owns the clock. **The assertions must fail against the current wiring, proved
by running them**, and the clock lessons below are not optional there.

## What to read first

`AGENTS.md` section 7, `agent/RALPH.md`, the head of `agent/TODO_BOARD.md`, and for this card
`apps/web/src/app/App.tsx`, `routes.ts`, `e2e/addresses.spec.ts` and `e2e/search-waits.spec.ts` with
the plan beside the work at `apps/web/src/app/#KN-698 …md`.

**`clock.install()` does NOT stop time**: it installs fake timers that keep flowing, and only `pauseAt`
or `fastForward` stops them. Install at a fixed time, let the page load naturally, then pause, then
`runFor`. **`fill()` cannot show a debounce**; `pressSequentially` types key by key.

**A script that prints a verdict must exit on it.** A background check printed `eslint clean` from an
unconditional `echo` after eslint had reported 5 errors and exited non-zero, and it was believed for a
whole step. Read every check from its own exit line. **Never chain a check into a commit.**

**A substring search cannot tell an export from a eulogy.** The close guard refused its own commit
because `routes.ts`'s doc comment names the two functions it deleted, saying they are gone. Strip
comments before searching code for a name.

**A plan that inventories a behaviour is a checklist for the END of the build, not only the start.**
KN-698's plan recorded the push guard at line 30 and the rewrite dropped it anyway.

**A failure set that MOVES between identical runs is a flake; a fixed set is a break.** That one
distinction separated KN-551's and KN-699's noise from the single real regression in this card.

A backgrounded run's "exit code 0" is the shell line's: read the summary line and refuse it on
"skipped" or a zero total, keeping "could not run" distinct from "does not hold". The runner names a
story's test by its DISPLAY name, spaced. A grep of a barrel `.d.ts` is a false-negative machine;
importing the module is the check that works. Write long scripts with the Write tool, and keep
apostrophes out of single-quoted strings.
