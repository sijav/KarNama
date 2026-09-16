# KN-695 · The product never waits: the screens filter on every keystroke and never use the Search Bar's 300 ms debounce

high, 5 points, web, OKR-1. **Filed as "onSearch is used by no page"**, and retitled when the owner
ruled the wait mandatory: the finding stopped being that the code was dead and became that the product
never runs it. The file name keeps the original wording, since the id is what ties it to the card.

## What the search actually does today

Checked in the code, not remembered:

1. **You press a key.** The bar calls `onChange` straight away. The board keeps that text in state,
   `JobsScreen.tsx` line 88, and filters the records it already has in memory,
   `jobsIn(records.jobs, id, search, order)` at line 167. The contacts page does the same at lines 73
   and 81 through `contactMatches`.
2. **No network call. No database. No AI. No autocomplete.** Everything being searched is already in
   the browser.
3. **A word that matches**: matching cards stay and the rest disappear, on every keystroke. It matches
   title, company, location, description and note, ignoring case. Contacts match on name, role,
   company, email and phone.
4. **Enter does nothing.** There is no key handler and no form. The phone keyboard's search key does
   nothing either, which is KN-547.

**And `onSearch` is never passed.** `JobsScreen` passes `value`, `onChange` and `layout`.
`NetworkScreen` passes those plus `label` and `placeholder`. Nothing else in the product uses the
Search Bar. So the 300 ms wait, and all the code deciding when it fires, runs for nobody.

Four cards have gone into that code: KN-314, KN-380, KN-690, and the planning of KN-689.

## The owner decided, and it reverses this card

**2026-09-16, in chat: "I definetly do not want to remove that that 300ms looks like a debounce to me,
and it is mendatory to have!"**

So the wait stays. That is the owner's decision, not the author's, and it changes what this card is
about. **The finding is no longer that the code is dead. It is that the product never waits.** The
board and the contacts page filter on every keystroke, so the 300 ms the owner calls mandatory does
not happen anywhere a reader can reach.

**The code is right. The screens are wrong.**

My earlier plan, to keep the code and document that nothing uses it, is withdrawn. Documenting a gap
the owner has just called mandatory would be writing down a defect as though it were a decision.

## The test that should have caught this, and why it did not

`apps/web/e2e/board.spec.ts` line 63: **"a search narrows the board and says so when nothing
matches"**. It fills the real search box on the real board and asserts the board narrows, that a
search matching nothing says so, and that clearing restores it. It passes, and it has always passed,
**without the debounce ever running**.

That is the whole lesson in one file. The scenario exercises what the product does; it never asserts
what the product should WAIT to do. Nothing in the suite says "typing fast must not re-filter on every
key", so the product quietly did the opposite of the component's documented behaviour and every test
stayed green.

## What changes

**Two values on each screen**, which is the plan review's shape:

- `typedSearch`, passed as `value` and updated by `onChange`, so the field shows every key at once.
- `appliedSearch`, updated by `onSearch`, so it moves once after the pause, and at once after a clear
  the page accepts.

- `apps/web/src/screens/JobsScreen.tsx` — `cardsOf` at line 167 reads `appliedSearch`. **That is the
  whole change**, and it is smaller than the review's list suggests: `shown` (176), `found` (177) and
  `held` (183) are all DERIVED from `cardsOf`, so they follow it without being touched, and so do the
  bulk count, select-all and the empty-state message that read them. `sizeOf` (171) stays as it is,
  because it deliberately counts every record in a status rather than the visible ones. **One trap:
  there is a second, unrelated `held` at line 589**, a contact lookup in another scope.
- `apps/web/src/screens/NetworkScreen.tsx` — `shown` at line 81 reads `appliedSearch`. `shownIds`
  (85), `chosen` (86), the bar's `count` (238) and `remember` (94, used at 227, 243, 272) all derive
  from it. The raw selected-id state is untouched.

**Why they must move together**: if the cards filter on the pause while the selection counts on the
immediate text, a reader can have cards showing one set and the bar counting another. That is exactly
the KN-422 and KN-431 class of mismatch, and KN-422 lost data.

**Counted rather than claimed, because "only one place reads it" is the shape of sentence this
repository keeps getting wrong.** Every occurrence of the word `search` in each screen was listed, not
just the lines the review named. There are **exactly two reads on each screen**, and the rest are
comments or a message string:

- `JobsScreen.tsx`: line 167, `cardsOf`, which filters; and line 369, `value={search}`, the field.
- `NetworkScreen.tsx`: line 81, `shown`, which filters; and line 177, `value={search}`, the field.

So the two-value split is not a design imposed on the screens, it is already the shape of the code: the
filtering read becomes `appliedSearch` and the field's read stays `typedSearch`. There is no third
reader to leave behind, which is what I wanted to be sure of before writing "one substitution".

- **`apps/web/e2e/search-waits.spec.ts`, a new spec, is where the wait is proved.** The existing search
  test in `board.spec.ts` is left ALONE: it uses `fill()`, which sets the whole value in one shot and
  fires one change rather than one per key, and Playwright's assertions auto-retry, so it goes green
  with or without a pause and can never fail on its absence. Rewriting it in place would also have
  meant fighting its `beforeEach`, which navigates before a clock can be installed. The new spec types
  key by key with `pressSequentially`, holds the clock, and asserts the board has NOT narrowed after
  the last key, still has not a tick before the pause is up, and has on the tick that completes it,
  then presses the clear control and asserts restoration with the clock never advanced. It covers the
  contacts page too, which had no search scenario of its own at all.
- `apps/web/e2e/session.ts` — the board's seeding moved here as `prepareBoard`, with `addJob`,
  `addContact` and `prepareNetwork`, because the new spec is the third caller and `network.spec.ts`
  already records that a third caller is when a helper moves into `./session`. `board.spec.ts`'s
  `beforeEach` now calls it, so the real add flow is shared rather than duplicated.
- `apps/web/e2e/board.spec.ts` — **KN-422's test is repaired, not clocked.** It filled the search and
  opened a column menu in the next breath; with a pause the cards are not hidden yet at that moment, so
  it would have passed for the wrong reason. It now awaits the filtered card's absence first, which
  keeps its real claim, that hidden records do not make a column deletable.
- **The SCREEN docs, not the component's.** `story-docs/en/Screens-Jobs.md` said "the search and the
  sort control act on every column at once", which reads as instantly and is now wrong; it says the
  sort acts on every column together and so does the search, once typing pauses, and that the field
  shows every key while the cards narrow after the pause. The Persian was already accurate, saying
  «با هم», together across columns, rather than instantly, so it gains the pause rather than losing a
  false claim. The Search Bar's own docs are untouched: the component never changed.
- `apps/web/src/screens/JobsScreen.stories.tsx` — one comment that said searching narrows every column
  "at once", **and one story that genuinely broke.** `ActingWhileSearching` failed at line 970 on a
  BARE assertion that the hidden card is back in its column after `userEvent.clear(search)`. Clearing
  the field by keyboard is typing, so the restore now waits the pause, and the `waitFor` above it
  waited for the card the search had SHOWN, which never left and so proved nothing about the restore.
  The restore assertion moved inside that wait.

  **This is the sweep's own prediction, and I overrode it.** The plan says in as many words that what
  rots is "a bare assertion straight after a `waitFor`", and then I concluded the stories were all safe
  eventual-state tests needing no change. The run disagreed: 38 passed, 1 failed. The other stories
  are left alone, and that is now a measured claim rather than an argument.

- **KN-689 and KN-692 stop being about unreachable code** once the screens wire it up, so they are
  unparked rather than dropped. KN-689's question, what happens when a page answers late, becomes a
  real question about a real caller.

## Every test I LOCATED that drives a search control

The review asked for this sweep, and its wording is the review's correction: grep and reading
establish **scope candidates**, not runtime semantics, so this is every test found by searching for the
search control, not a proof that no other test depends on the timing.

**End to end.** `board.spec.ts` 63 to 73, the search test, and 161 to 163, KN-422's, which fills the
box and **immediately** opens a column menu expecting delete to stay disabled. Both use `fill()`, so
both keep passing, and 161 stops testing what it says: with a pause, the cards are not hidden yet at
the moment it clicks, so delete is disabled for the wrong reason.

**Screen stories**, all using `userEvent.type`, which types key by key:

- `JobsScreen.stories.tsx` 273 and 277, searching and clearing; 837, 854 and 861, KN-431's selection
  story.
- `NetworkScreen.stories.tsx` 104 and 108, a search matching nobody; 319 and 342, KN-431's contacts
  twin.

**Most of these survive, and that is the problem.** Their assertions sit inside `waitFor`, which
retries past 300 ms, so they go green either way. What actually breaks or rots:

- **Bare assertions straight after a `waitFor`**, such as `NetworkScreen.stories.tsx` 324, that the
  bulk bar is gone, and the `barCounts` calls that are not guarded by a wait on the applied result.
- **The prose.** `JobsScreen.stories.tsx` 271 says "Searching narrows every column **at once**". That
  becomes false, which is KN-690's defect a second time, in a comment nobody would think to check.

So the work is not "fix the broken tests". It is to find the ones that quietly stop meaning what they
say, which is the same failure this whole card is about.

## The clock and the seeded board, read from the spec

`board.spec.ts`'s shared `beforeEach` at lines 42 to 49 does: `signedIn(page)`, `goto('/')`,
`emptyBoard(page)`, `reload()`, then `add(page, FIRST)` and `add(page, SECOND)`. **It navigates twice
and seeds the board through the ADD FLOW**, deliberately, and the file says why: "Seeded through the
add flow rather than through storage, so what the test drives is what a job seeker drives."

That is the whole difficulty of the clock in one place:

- `clock.install()` has to come **before the first navigation**, KN-587, and this setup navigates at
  line 44, so a clocked test cannot simply reuse it.
- The seeding is not cheap storage-writing: `add()` drives a modal and waits on
  `expect(...).toBeVisible()` twice per record. **Under a frozen clock any of those waits could hang**
  if something in the add flow is on a timer, and the whole point of that setup is that it is the real
  flow rather than a shortcut.
- Installing the clock in the SHARED `beforeEach` would freeze time for every board test, which is a
  change to tests this card has no business touching.

So the choice is between duplicating the seeding inside a clocked `describe`, and finding a way to
install the clock without losing the real add flow. This was written after round two of the review had
already started, so that round did not see it.

## Answered while planning: NO REPOSITORY RECORD of the current wiring

I asked whether the screens were deliberately wired to `onChange`. **No record of such a decision
exists.** Searching every file under `apps/web/src/screens`, the plan markdown beside the screens
included, for `onSearch`, `debounce`, `DEBOUNCE` and `300` returns nothing at all: no plan, no comment,
no card. The review reached the same reading independently.

The wording is the review's correction and it matters: "no record found" is what a search can support.
"Nobody chose it" is a claim about every decision ever made, which no search establishes. What follows
is only that there is no recorded choice to build over.

## What I am unsure about

- **Whether the board should filter on the debounced text or keep both.** Filtering only on `onSearch`
  means the field shows your typing immediately but the cards lag 300 ms behind, which is the point.
  But the empty-state message and the selection counting read the same text, and they may want the
  immediate one.
- **What the clear should do.** The bar searches for empty without the pause, so clearing restores the
  full board at once. That is probably right and should be asserted rather than assumed.
- **Whether 300 ms is the right number now that a reader will actually feel it.** It was chosen when
  nothing used it. The comment in `SearchBar.tsx` says the file draws no timing.
- **Whether this should be one card or two.** Wiring two screens and asserting the wait in e2e may be
  more than 2 points.

## Round two of the review, and what it settled

The two-state wiring is confirmed independently: change `cardsOf` on the board and `shown` on
contacts, and **no remaining direct consumer of either screen's `search` state exists**. `sizeOf`
correctly stays unfiltered.

**The gap it found: `network.spec.ts` has no search scenario at all.** So contacts would be changed and
only incidentally covered. It gets the same clocked, key-by-key test, with two contacts and restoration
on clear.

**How the clock and the real seeding are reconciled**, which was the open question: extract
`board.spec.ts`'s existing seeding into a shared `prepareBoard(page)` helper and call it from both the
ordinary `beforeEach` and the clocked test, installing the clock before navigation in the clocked one.
The real add-flow seed is kept and nothing is duplicated. `pressSequentially` gives one input event per
character, and the clock controls `setTimeout`, which is the Search Bar's own mechanism.

**The timing assertions, in order**: after typing, the matching AND non-matching cards are both still
visible; advance to just before 300 ms and assert the same; advance the final tick and assert the
narrowing. Then clear WITHOUT advancing and assert restoration. That sequence fails under the old
wiring for the intended reason rather than by accident.

**KN-422 is repaired, not clocked.** Its immediate menu click would pass after a debounce for the wrong
reason, but the fix is NOT to advance a clock in its unclocked setup: it first awaits the filtered
card's absence, then opens the menu. That keeps its real claim, that hidden records do not make a
column deletable.

**The `waitFor` screen stories stay as they are.** They are valid eventual-state tests and do not need
rewriting merely because they do not prove timing. Only the Jobs story comment saying searching narrows
every column "at once" is corrected.

## How I will know it worked

- **The e2e test is the proof**, and it must fail on the old behaviour: with the board filtering on
  every keystroke, the new assertion that the board has not narrowed yet must fail. That is the
  control, and it is the one this card exists because nobody had.
- The screens' own stories, the unit project, `tsc`, `eslint`, and both Docs pages in both languages.
- Prettier drift unchanged on every file.

## What I am asking the review

1. Should the board filter on the debounced text only, or keep the immediate text for the field and
   the debounced one for the cards? Name what the empty state and the selection count should read.
2. Is asserting the wait in `board.spec.ts` the right place, or does a wait assertion belong in a
   story where the clock can be held, with e2e only asserting the end state?
3. Is this one card or two? Wiring two screens plus an e2e assertion may exceed 2 points.
4. Is there a reason the screens were wired to `onChange` in the first place that I have not found?
