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
**KN-685** (43898ec), **KN-690** (db6f4e6), **KN-691** (fb0e32b), **KN-695** (e29b86e).
**Dropped**: KN-657, and **KN-663** (de6157c), filed on a false premise its own plan review caught.

## KN-695, and it is the one to read first

**The Search Bar's 300 ms wait ran for nobody.** No screen passed `onSearch`; the board and the
contacts page filtered on every keystroke through `onChange`. Four cards had refined that dead path:
KN-314, KN-380, KN-690, and the planning of KN-689. The owner ruled the wait mandatory, so the code
was right and the screens were wrong.

**Both screens now keep two values**, `typedSearch` for the field and `appliedSearch` for filtering.
Counted rather than claimed: each screen reads the search text in exactly TWO places, the filter and
the field, so it was one substitution each, and `shown`, `found`, `held`, `shownIds`, `chosen`, the
bulk count, select-all and the empty state all derive from the filter. `sizeOf` deliberately counts
every record in a status and is untouched.

**The proof is `apps/web/e2e/search-waits.spec.ts`**, its own file because `board.spec.ts`'s search
test uses `fill()`, which can never show a debounce, and its `beforeEach` navigates before a clock can
be installed. The board's seeding moved into `e2e/session.ts` as `prepareBoard`, with `addJob`,
`addContact` and `prepareNetwork`. **The control holds: 0 passed and 4 failed on the old wiring, 4
passed and 0 failed with the wait.**

**It took three attempts and both failures were mine**, which is the part to carry:

- The first **could not run**. The mutation orphaned a symbol, the e2e webServer runs `tsc` before
  anything, so no test executed at all. "Could not run" is not "does not hold".
- The second **failed both ways**, 4 failed mutated and 4 failed restored, which is a spec that cannot
  tell them apart. **`clock.install()` does NOT stop time**: it installs fake timers that keep
  flowing, and only `pauseAt` or `fastForward` stops them. I theorised for paragraphs before reading
  the installed Playwright's own typings, which answered it in one line.

Both lessons are in `AGENTS.md` at cac5a56. **KN-422's test was repaired, not clocked**: it now awaits
the filtered card's absence before opening the column menu. **One screen story genuinely broke**,
`ActingWhileSearching`, on a bare assertion after a `waitFor`, which the plan had predicted and my own
conclusion overrode.

**Its roast found one defect, KN-696, and the rest are clean bills worth keeping**, because they are
what the card most needed checked. **No KN-422-style mismatch**: both screens derive cards, empty
states, visible counts, select-all, bulk delete and bulk status changes from the applied value, so
during the 300 ms gap the field alone changes while actions still apply to exactly the cards shown.
**The clear assertions are real** rather than passing on a retry that outlasts the pause: after
`pauseAt` the page's timers cannot advance during Playwright's retries, so restoration cannot come
from the debounce. **The control genuinely restores the old behaviour**, filtering in the same React
batch as the controlled field. And one inaccuracy of mine, recorded: the account I gave the reviewer
described a `settle()` helper running the clock forward after seeding, which the `pauseAt` rewrite had
removed. It never reached the repository, but **an account handed to a reviewer must be re-read
against the diff it describes.**

## Open children, and what is waiting

**KN-016 waits on two**: **KN-689**, now in progress, and **KN-692**, that no story pins that a layout
change leaves a pending search alone.

**KN-062 waits on five**: KN-686, KN-687, KN-688, and from KN-685's roast **KN-693**, the verifier
still prints a sentinel on its FAILURE paths, and **KN-694**, nothing re-checks that each sentinel is
still held only by its own locale JSON.

**KN-695 waits on one**: **KN-696**, from its own roast. KN-695 updated the BOARD docs in both
languages to say the search waits, and never touched `Screens-Network.md` in either, which still says
only that a search narrows the page. KN-695's exit said "the screen docs in both languages", which is
plural and covers both screens, so it is a miss against its own exit rather than a new requirement,
and the contacts page has its own clocked e2e test proving the wait its documentation omits.

**Also open**: KN-681 and KN-682 from KN-666; KN-684 from KN-668; KN-673 and KN-674 from KN-618;
KN-676 and KN-677 from KN-675. **KN-683 IS FOR THE OWNER**: walking `text/secondary` to a readable
value touches a Figma-defined token across 43 sites.

**Still waiting on the owner**: KN-515, KN-516, KN-517; the Search Bar and Sort Control taking
KN-275's `border/control`; **KN-486**, the `fetch`-stubbing tests of `extraction.service.ts`. Owner
decided and still to build: KN-588, KN-630, KN-590, KN-616. The Codex log the owner pasted holds the
Groq key; never repeat that key anywhere.

**KN-685's discipline still binds**: the fixtures' two sentinels are held by their own locale JSON and
by no other file, and **the values are named nowhere**, this file included, because `todo render`
writes every description into the board and the database is committed. Read them from the JSON.

## What fails, measured 2026-09-16

The unit project is **1529 of 1531 over 42 of 43 files**, identical across five runs today: the two
are `session.test.ts` under load, KN-551, by name, `keeps demo authentication separate from a stored
server token` and its live twin, and they pass alone. The storybook project loses whichever
pointer-driven stories run beside each other, KN-365; the two screen story files are 39 of 39. **"A
fresh build" means `CI=1`**, since the config reuses a running server otherwise, and its webServer
runs `tsc --noEmit` first, so **a mutation that leaves a symbol unused stops the server rather than
failing a test**. `App.tsx` line 107 uncovered, KN-491. The API's gate fails on
`extraction.service.ts`, KN-486, so the api workspace's database tests are run directly.

**eslint runs from `apps/web`**, which is where the config is; the root has none, and `agent/` is not
a workspace, so **nothing lints `agent/scripts`**. **Drift is PRETTIER drift**, lines a format would
change, HEAD's copy against the worktree's; `prettier --write` is safe only where the committed copy
already measures 0, and a NEW file must measure 0 **before** it is committed. **Read the drift, do not
chain it**: the script prints its verdict and exits 0 either way, so `drift && git commit` enforces
nothing, and KN-689's plan was committed at drift 2 that way.

## The owner's rules, most recent first

- **2026-09-16, in chat, and it is a general rule not a one-off.** "Create your own tools for it then
  don't hard code things common! What the hell? Why not routing library? It is react!" **Do not
  hand-roll what the ecosystem already solves.** There is no routing dependency in this app at all:
  `App.tsx` calls `pushState`, listens for `popstate` and splits paths itself, and KN-697 was about to
  bolt a hand-written query string onto that. **KN-698** replaces it with a router. The version facts,
  from `npm view` rather than memory: react-router **8.4.0** needs react >= 19.2.7 and the app is on
  **19.0.8**; react-router **7.18.4** needs react >= 18 and works as-is; and **nothing in the toolchain
  blocks a react bump**, since MUI 9.4.0, `@storybook/react-vite` 10.5.10 and the Vite plugin all
  accept react 19.x.
- **2026-09-16, in chat.** "When user write something on search after denounce url changes along with
  search results and what not, does that make sense? I mean how hard could it be to do like this."
  **The search belongs in the ADDRESS**, KN-697, filed at high and 3 points. Debounce, and yes it makes
  sense: a searched board today cannot be shared, bookmarked or reloaded. Not hard, because the shell
  already routes by hand in `App.tsx`: `destinationIn` reads the page from the path, `navigate()`
  pushes it, a `popstate` listener follows Back, and **no query is ever written**. Two things decided
  with it rather than left implicit: the address is **replaced** while typing, or one search adds a
  history step per pause; and changing page **drops** the search rather than carrying `?q=` onto
  another page. Note `navigate()` writes base plus destination and nothing else, so it would drop a
  query silently today.
- **2026-09-16, and KN-689's question went UNANSWERED.** It was put in plain words, after explaining
  what happens, using the shape the plan review drafted; the owner replied by asking for KN-697
  instead. So the choice, whether the bar supports a page that hands the typed text back later, is
  still open and **KN-689 is parked**, not merely waiting its turn.
- **2026-09-16, in chat.** "I definetly do not want to remove that that 300ms looks like a debounce to
  me, and it is mendatory to have!" **The Search Bar's 300 ms wait STAYS**, and KN-695 made the
  screens use it.
- **2026-09-16, in chat, on what caused it.** "Only the component's own tests use something is a damn
  red flag... if something only happens because of a test, then an e2e test needs to happen for it not
  just unit". **A story is not a caller.** Every callback prop gets an `fn()` by the working
  agreement, so every prop looks used the moment it exists. **Before taking or filing a card about a
  behaviour, name the user action that reaches it and the screen that passes the prop**; if the only
  caller is a story it is a proposal, not the product. And **a roast answers "what reaches this code?"
  before "is this right?"**
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

## The next step

**KN-698 is in progress**, high, 3 points, web: routing is hand-rolled and gets a router library. Its
plan goes beside the work at `apps/web/src/app/`. **KN-697**, the search in the address, waits on it,
and **KN-689 is BLOCKED on the owner**, not merely backlogged: a reason on a backlog card is a comment
and `next` offers it again, which it did.

**What exists now**: `src/app/routes.ts` exports `destinationIn(pathname, base)`,
`addressOf(destination, base)`, `pathForHash(hash, base)` and `siteBase(configured, href)`, used by
`App.tsx`, `routes.test.ts` and `App.stories.tsx`. `App.tsx` pushes with `history.pushState` in
`navigate()`, follows Back with a `popstate` listener, and replaces an old hash address once on first
render.

**What a router must live with**: GitHub Pages has no rewrites, so the build writes `jobs.html`,
`add.html`, `network.html` and `404.html` and each answers 200 at its path, KN-505, measured on the
live site. And the base differs between the app and Storybook, which is why `siteBase` resolves a
relative one against the page, so a router's basename is given the same way rather than assumed.

**What the EXISTING TESTS require, read rather than assumed**, after I had cited `addresses.spec.ts`
three times without opening it:

- **`/add` is a MODAL over the board, not a page.** A reload at `/add` still shows the dialog, Back
  from it returns to `/network` with the dialog gone, and `App.tsx` line 85 passes
  `current === 'add' ? 'jobs' : current` so the navigation keeps the board current beneath it.
  **A router that makes `add` an ordinary route satisfies the address and breaks the design**, which
  `DESIGN.md` states as job detail and adding never being pages of their own. This is the one to watch.
- **`pathForHash` is proved END TO END**: `/#/network?from=shared` must land on `/network?from=shared`,
  query kept. It survives; only where it lives is open.
- **`siteBase` survives too**, with four unit cases, two of them Storybook's, including the preview
  after the shell has pushed a page. `destinationIn('/iframe.html')` must fall back to the board.
- **Every destination serves byte-identical `index.html`**, asserted against a Pages-like server, so
  all routing is client-side over one document and nothing may depend on per-route markup.

**KN-689's own plan says to replan from this point**, since it was written when no screen passed
`onSearch` at all.

**The mechanism**, derived from the code three times: `SearchBar.tsx` marks an attempt judged BEFORE
the equality check, so a controlled page that has not yet echoed leaves `text === attempt.before`, the
effect returns having started nothing, and the page's later value finds the attempt already judged and
returns again. **No search ever runs.** That is deliberate, and it is what lets the bar refuse a page
that IGNORED a change, which `ClearIgnored` and `IgnoredKeystrokes` assert. A late answer and an
ignored change are indistinguishable without the page saying which change it is answering.

**What changed for this card**: both screens now pass `onSearch`, so the scenario is reachable at last.
But both still pass direct `useState` setters, so every echo lands in the same commit and no reader
meets the gap today. The card's exit allows narrowing the contract or adding provenance; the plan
review said **that choice is the owner's**, and the previous attempt to put it to them failed because
the question was unreadable. **Ask it in plain words this time**, after explaining what happens, or
find that the answer is already implied by the owner's ruling that the wait is mandatory.

## What to read first

`AGENTS.md` section 7, `agent/RALPH.md`, the head of `agent/TODO_BOARD.md`, and for this card
`apps/web/src/shared/search-bar/SearchBar.tsx` with the plans beside it, `#KN-689`, `#KN-690` and
`#KN-695`. **Never chain a check into a commit**, write long scripts with the Write tool, and keep
apostrophes out of single-quoted strings. A backgrounded run's "exit code 0" is the shell line's: read
the summary line and refuse it on "skipped" or a zero total, keeping "could not run" distinct from
"does not hold". The runner names a story's test by its DISPLAY name, spaced. When a script edits
several files, compute them all in memory and write only if every count matches. A story's globals
seed at the preview iframe's FIRST load, so read a second language in a fresh tab with the locale in
the URL.
