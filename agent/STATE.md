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
KN-565, KN-589, KN-665, KN-667, KN-591, KN-601, KN-669, KN-670, KN-618, KN-675, KN-626, KN-678,
KN-651, KN-679, KN-680, KN-666, KN-668, KN-672, **KN-306** (d8c9d9f), **KN-380** (17472be),
**KN-685** (43898ec), **KN-690** (db6f4e6), **KN-691** (fb0e32b). **Dropped**: KN-657, and **KN-663**
(de6157c), filed on a false premise its own plan review caught.

**THE E2E SUITE IS GREEN**: 93 passed, 0 failed, 9 skipped over 102 tests.

**KN-016 was roasted as a WHOLE TASK** with KN-314, KN-315 and KN-380, the round the board calls for
when the last child closes. Four survivors filed, **KN-689** to **KN-692**, of which KN-690 and
KN-691 are now closed. Two clean bills worth keeping: KN-314's invariant holds by derivation,
`onSearch` is never called with a string the field did not show; and the two handlers are not
duplication, since extracting them would hide the difference between typing and clearing.

## What the last three cards established

**KN-685**: the fixtures' two sentinels are values **held by no other file in the repository**,
measured over `git ls-files -z --cached --others --exclude-standard`, 1281 files, as bytes. **The
values are named nowhere**, this file included, because `todo render` writes every description into
the board and the database is committed, so **naming a value is what puts it in the repository**.
Read them from the two JSON files. **NOT established: that they stay unique.** A search settled it
once; KN-694 is the guard that would keep it true, and KN-693 is that the verifier still prints a
sentinel on its FAILURE paths, which is the output most likely to be pasted into evidence.

**KN-690**: the docs said clearing searches "at once", unconditionally, in five sentences across
FOUR files. The fourth was the `Clearing` story's own comment, contradicting a correct comment four
lines below it. Two "at once" sentences are TRUE and were left: `onChange` really is synchronous.

**KN-691**: the docs said `placeholder` follows `label`, which the component has never done.
`GivenOnlyAName` now renders two bars, one bare and one given only a name, asserting the bare hint is
non-empty, the two hints are identical, and the names differ. The non-empty clause is the review's
and it closed a vacuous pass: two EMPTY hints would also be identical.

## Open children, and what is waiting

**KN-016 waits on two**, and **both are parked behind KN-695**: **KN-689**, that a page answering a
keystroke late loses the search, and **KN-692**, that no story pins that a layout change leaves a
pending search alone. Neither can affect a reader until the screens actually use the wait, so neither
is dropped and neither is built yet.

**KN-062 waits on five**: KN-686, KN-687, KN-688, KN-693, KN-694.

**Also open**: KN-681 and KN-682 from KN-666; KN-684 from KN-668; KN-673 and KN-674 from KN-618;
KN-676 and KN-677 from KN-675. **KN-683 IS FOR THE OWNER**: walking `text/secondary` to a readable
value touches a Figma-defined token across 43 sites.

**Still waiting on the owner**: KN-515, KN-516, KN-517; the Search Bar and Sort Control taking
KN-275's `border/control`; **KN-486**, the `fetch`-stubbing tests of `extraction.service.ts`. Owner
decided and still to build: KN-588, KN-630, KN-590, KN-616. The Codex log the owner pasted holds the
Groq key; never repeat that key anywhere.

**Roasts run on Codex terra, pinned**: every roast and plan review passes `--model gpt-5.6-terra`.
`roast.py` takes the work as `--did`, the file list as `--files`; a plan goes in `--did` too, and
omitting `--fresh` resumes that mode's session. `todo roast` needs `--file`, and `--filed none` when
a round finds nothing, which is an honest record rather than an empty one.

## What fails, measured 2026-09-16

The unit project is **1529 of 1531 over 42 of 43 files**, measured four times today and identical
every time: the two are `session.test.ts` under load, KN-551, by name, `keeps demo authentication
separate from a stored server token` and its live twin, and they pass alone. The storybook project
loses whichever pointer-driven stories run beside each other, KN-365. **The e2e suite passes whole**;
**"a fresh build" means `CI=1`**. `App.tsx` line 107 uncovered, KN-491. The API's gate fails on
`extraction.service.ts`, KN-486, so the api workspace's database tests are run directly,
`npx vitest run src/database`, 68.

**eslint runs from `apps/web`**, which is where the config is; the root has none, and the root `lint`
script runs per workspace while `agent/` is not one, so **nothing lints `agent/scripts`**: a
verifier's cover is Prettier drift and `node --check`. **Drift is PRETTIER drift**, lines a format
would change, HEAD's copy against the worktree's; `prettier --write` is safe only where the committed
copy already measures 0, and a NEW file must measure 0 before it is committed.

## The owner's rules, most recent first

- **2026-09-16, in chat.** "I definetly do not want to remove that that 300ms looks like a debounce to
  me, and it is mendatory to have!" **The Search Bar's 300 ms wait STAYS.** So the defect is not that
  the code is dead, it is that the product never waits: see the next step.
- **2026-09-16, in chat, on what caused it.** "Only the component's own tests use something is a damn
  red flag... if something only happens because of a test, then an e2e test needs to happen for it not
  just unit". **A story is not a caller.** Every callback prop gets an `fn()` by the working
  agreement, so every prop looks used the moment it exists, and coverage and the docs guard are both
  satisfied by a prop no screen passes. **Before taking or filing a card about a behaviour, name the
  user action that reaches it and the screen that passes the prop**; if the only caller is a story it
  is a proposal, not the product. And **a roast answers "what reaches this code?" before "is this
  right?"** — "only its own stories" is the finding, and it outranks the rest of the round. Five cards
  closed correctly inside code no reader runs: KN-314, KN-380, KN-690, and the planning of KN-689 and
  KN-692.
- **2026-09-16, in chat, after I put a question to them nobody could read.** "what the hell are you
  talking about? what do you mean by commit? why are you talking C10 English?... IT IS DAMN SUPER EASY
  TO TALK LIKE THIS RATHER THAN C20 FUCKING ENGLISH NOT EVEN NATIVE ENGLISH LAWYER CAN UNDERSTAND".
  **Write in plain words. Short sentences. No jargon**, and "commit", "provenance" and "contract" are
  jargon. **Explain what actually happens before asking for anything**, walking it the way a user meets
  it: the first keystroke, then a word that matches, then Enter. Then the problem, then the suggestion.
  And **check what the code really does before asking about it**: the question I asked was about a case
  that cannot happen, because no page uses the callback at all, which one search would have told me.
- **2026-09-16, in chat.** "are you commiting and pushing after fixes", yes, and every close is a work
  commit, the card closed with evidence, the board rendered and committed, then a push.
- **2026-09-16, through the question tool.** The sign-in note and the resend timer take 4.5 to one or
  better, KN-591. Asked in the same breath which wording the mocked sign-in steps should use: "Is that
  really important that you stopped working for? Who cares!" **So a question of that kind is not asked
  again.** Where a rule already decides a thing, the rule decides it.
- **2026-09-15, through the question tool.** The phone's add form keeps the title first, KN-358. The
  first sign-in may skip the name, "As Figma", KN-588. KarNama writes terms and privacy pages and the
  sign-in note links to them, KN-590 and KN-630. The Loading State turns an arc, KN-616.
- **2026-09-14.** The board is the todo skill's database. The shared skills serve ALL projects: a
  change only adds. A model's work is never roasted by that model. "It should look like the figma."
  The owner reads on a phone: literal truth, no excuses. An instruction carries its date.
- **2026-09-12, to Codex, still standing.** Mock the login. Keep the sample data and the AI
  extraction. Commit and push after work. Never ask the owner to redeploy when nothing changed.
- **2026-09-11.** Push after every close. Only new component cards and their blockers are `critical`.
  No proof at the close. Roasts stay. A finding about the loop is `low`. **Do not invent gates.**
- **A finding is a CHILD of its task**, one level, with `--area` and `--okr`. **Plans live beside the
  work**, checked by `roast.py plan` before building, and they stay.

## The next step

**KN-695 is in progress**, high, 2 points, web. Its plan is beside the work at
`apps/web/src/shared/search-bar/` and is with the reviewer; nothing is built. KN-689 is parked behind
it.

**What the search really does today, checked in the code because the owner asked:** a keystroke calls
`onChange`, the board keeps the text in state (`JobsScreen.tsx` 88) and filters records already in
memory (`jobsIn(...)` at 167); contacts do the same at 73 and 81 through `contactMatches`. **No network
call, no database, no AI, no autocomplete.** Enter does nothing, KN-547. **And no screen passes
`onSearch`**, so the 300 ms wait runs for nobody.

**The owner ruled the wait mandatory, which REVERSES the card**: the code is right and the screens are
wrong. The work is to route the screens' filtering through `onSearch` and assert the wait end to end.

**The test that should have caught it, and the lesson:** `apps/web/e2e/board.spec.ts` line 63, "a
search narrows the board and says so when nothing matches", fills the real box on the real board and
passes, and always has, **without the debounce ever running**. The scenario proves what the product
does; nothing asserted what it should WAIT to do. It uses `fill()`, which sets the whole value at
once, and Playwright's assertions retry, so it would pass with or without a pause and could never fail
on its absence.

**Two facts already measured, so they are not re-derived.** Raised to 5 points; the plan is beside the
work and round two of its review is out.

- **Each screen reads the search text in exactly TWO places**, counted by listing every occurrence
  rather than trusting the review's list: `JobsScreen.tsx` 167 (`cardsOf`, filtering) and 369
  (`value=`, the field); `NetworkScreen.tsx` 81 (`shown`, filtering) and 177 (`value=`). Everything
  else is a comment or a message. So the split is already the code's shape: the filtering read becomes
  the debounced value, the field's read stays immediate, and `shown`, `found`, `held`, `shownIds`,
  `chosen` and the bulk count all follow because they derive from the filter. `sizeOf` (171) never
  reads it. **A second, unrelated `held` sits at `JobsScreen.tsx` 589.**
- **The clock fights the seeded board.** `board.spec.ts`'s shared `beforeEach` (42 to 49) navigates
  twice and seeds through the REAL add flow on purpose, while `page.clock.install()` must precede the
  first navigation, KN-587. So a clocked test cannot reuse that setup, freezing time in the shared one
  would touch every board test, and `add()` waits on visibility twice per record, which a frozen clock
  could hang. Unresolved, and it is the review's open question.
- **Most story assertions survive and that is the danger**: they sit inside `waitFor`, which retries
  past 300 ms. What rots is a bare assertion after one (`NetworkScreen.stories.tsx` 324) and prose
  (`JobsScreen.stories.tsx` 271 says searching narrows every column "at once").

**The plan's decision, for the review to test: NARROW the contract**, rather than give the bar a token
protocol. Attributing a late answer means a new prop and a new obligation on every caller of a shared
component, for a parent shape the product does not have: `JobsScreen.tsx` line 88 and
`NetworkScreen.tsx` line 73 are both plain `useState` setters passed straight to `onChange`, so every
echo lands in the same commit, measured rather than assumed. It is not a scope cut, so not
`PHASE-NEXT.md`: nothing is deferred, and what changes is that the promise stops overstating the
behaviour. **`DESIGN.md` has no natural home for a runtime contract** — section 2 is the table of
states Figma draws, section 3 is decisions written into the Figma annotations, section 6 is questions
flagged in the file — so it follows section 3's own precedent at the history-tab entry, an author
proposal labelled as such and "recorded here so it can be argued with rather than inherited as
settled". **KN-016's exit is left exactly as written**, the boundary KN-685's review drew for KN-306:
correct a false record, never rewrite a requirement to match what was built.

**The mechanism**, re-derived from the code twice: `SearchBar.tsx` marks an attempt judged BEFORE the
equality check, so where a controlled page has not yet echoed the reader's change, that commit still
shows the old text, `text === attempt.before`, and the effect returns having started nothing. When the
page supplies the new value one commit later the effect re-runs, finds the attempt already judged, and
returns again. **No search ever runs.** The same holds for the clear. This is deliberate and it is
what lets the bar refuse a page that IGNORED a change, which `ClearIgnored` and `IgnoredKeystrokes`
assert.

**The defect is that the two cannot be told apart**, and KN-016's exit promises the input is debounced
"without dropping the final keystroke" with no qualification. **It cannot be fixed by guessing.** The
card's exit offers two ways out: narrow the contract, stated in the story docs in both languages and
in `DESIGN.md` as the decided behaviour, that a search runs only where the page answers in the same
commit; or give the bar a way to attribute a late answer. Either way a story drives a page that echoes
one commit late and asserts the decided behaviour, failing if the other is implemented.

**Two cards have already been shaped by this being undecided**, so it is worth deciding properly
rather than quickly: KN-690's corrected sentence frames two cases where there are three.

## What to read first

`AGENTS.md` section 7, `agent/RALPH.md`, the head of `agent/TODO_BOARD.md`, and for this card
`apps/web/src/shared/search-bar/SearchBar.tsx` with both `Shared-SearchBar.md` files and the plans
beside the component, `#KN-380` and `#KN-690`. **Never chain a check through a pipe into a commit or
a close, write long scripts with the Write tool, and keep apostrophes out of single-quoted strings in
scripts.** A backgrounded run's "exit code 0" is the shell line's, not the runner's, and a run that
skipped every test exits 0 too: **read the summary line, and refuse it on "skipped" or a zero total**,
keeping "could not run" distinct from "does not hold". The runner names a story's test by its DISPLAY
name, spaced. When a script edits several files, compute them all in memory and write only if every
count matches. A story proves a rendered line only where the story itself pins the global, and a
story's globals seed at the preview iframe's FIRST load, so read a second language in a fresh tab with
the locale in the URL.
