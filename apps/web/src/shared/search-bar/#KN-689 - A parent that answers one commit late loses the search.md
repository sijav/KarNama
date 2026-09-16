# KN-689 · A parent that answers a change one commit late loses the search, where KN-016 promises the final keystroke is never dropped

high, 2 points, web, OKR-1. A child of KN-016, filed by the whole-task round of KN-016 with KN-314,
KN-315 and KN-380, and raised from medium after KN-690's roast found the same gap from the other side.

## The card, quoted

**Why.** "The exit condition is what the next caller trusts about the component. A page that keeps its
search text in a store that commits a tick later, which is an ordinary shape and one this product may
well grow, would find the bar silently never searching, and the sentence that told them it would is
the parent task's own exit."

**Exit.** "The promise is made exact in one place and true in both: either the contract is narrowed,
stated in the story docs in both languages and in DESIGN.md as the decided behaviour, that a search
runs only where the parent answers the reader's change in the same commit; or the bar gains a way to
attribute a late answer. Either way a story drives a parent that echoes one commit late and asserts
the decided behaviour, and it fails if the other behaviour is implemented."

## The mechanism, re-derived from the code a third time

`SearchBar.tsx` marks an attempt judged BEFORE the equality check. So:

1. The reader types. `change()` records the attempt and calls `onChange`.
2. On that commit a controlled page that has not yet echoed still shows the old text, so
   `text === attempt.before`, the attempt is marked judged, and the effect returns having started
   nothing.
3. The page supplies the new value one commit later. The effect re-runs, finds `judged.current ===
attempt`, and returns again. **No search ever runs.**

The same holds for the clear. **This is deliberate**: marking judged before the equality check is what
stops an attempt the page IGNORED being taken up later by an unrelated change, which is KN-380's third
finding and what `ClearIgnored` and `IgnoredKeystrokes` assert.

**The two cannot be told apart.** A page that answers late and a page that ignored the change produce
the identical sequence of commits. Nothing the bar can observe separates them.

**A third option I talked myself out of, so nobody re-derives it:** record what the reader TYPED, and
accept a later commit whose text equals it. That fails on `RestoredAfterReset` — a page that puts that
exact value back for its own reasons is indistinguishable from one answering late — and re-opens the
defect KN-380 closed. The card is right that guessing cannot settle this.

## The decision: narrow the contract

Of the two the exit allows, **narrow**, and record it as the author's decision rather than as
something the design settled.

**Why not the protocol.** Attributing a late answer means the bar hands the page a token with each
change and the page echoes it back. That is a new prop and a new obligation on every caller of a
shared component, added for a parent shape **the product does not have**. Measured rather than
assumed: `JobsScreen.tsx` line 88 and `NetworkScreen.tsx` line 73 are both `const [search, setSearch]
= useState('')` passed straight to `onChange`, so each echo lands in the same commit. Narrowing costs
nothing today and the protocol would cost every caller.

**Narrowing is not a scope cut**, so it does not belong in `PHASE-NEXT.md`. Nothing is being deferred:
the behaviour is what it has always been, and what changes is that the promise stops overstating it.
If a page ever does need late attribution, that is a new card with a real caller behind it.

**Where it goes in DESIGN.md, which took some finding.** Section 2 is the table of states the file
draws. Section 3 is decisions written into the Figma annotations, "settled, and reopening one is a
decision for the owner". Section 6 is questions flagged in the file itself. **None of them is a home
for a runtime contract**, and Figma says nothing about debounce semantics. But section 3 already
carries a precedent at the history-tab entry: an **author proposal, labelled as such**, "recorded here
so it can be argued with rather than inherited as settled". This follows that shape: a short
subsection, plainly marked as the author's contract decision and not the design's, naming the
alternative it did not take so the owner can overrule it in one read.

**KN-016's own exit is left exactly as written.** It is a closed card, and the same boundary KN-685's
review drew for KN-306 applies: correct a false record, never rewrite a requirement to match what was
built. Its exit stands as the history of what was promised; this card is where the promise is made
exact.

## The review: the analysis stands, the CHOICE is the owner's

The plan review agreed the technical analysis is correct and then overruled the part I had flagged as
my own biggest doubt. **Choosing between "late controlled parents are unsupported" and "add provenance
support" changes the component's public contract and the promise KN-016 carries. The card permits
either and selects neither, so it is a product decision for the owner rather than an author decision
to ratify alone.** I asked precisely so I would be told, and ratifying my own preference against that
would be bad faith, so the question went to the owner.

**What happened next, recorded because this plan would otherwise read as still waiting.** The question
put to the owner was unreadable, and they said so: jargon, and a decision asked for before anything was
explained. Answering their questions plainly meant checking the code, and that turned up something
neither this plan nor its review had seen: **no screen passes `onSearch` at all.** Both callers filter
on every keystroke through `onChange`, so the scenario this card describes, a page answering one commit
late, cannot happen to any reader today. The owner then ruled the 300 ms wait mandatory, which became
KN-695: the screens must use it.

So this card is parked behind KN-695 rather than behind the owner, and the reason changed. Its analysis
stands and its decision is still open, but it becomes answerable only once a screen really passes the
callback. **Replan from this point when KN-695 lands**, because "both callers pass direct `useState`
setters" will no longer be the argument it is above.

What it confirmed, so none of it needs re-deriving:

- **A parent holding `pending` in the handler and copying it to `value` from an effect really does
  answer on a LATER commit.** Effects run after the first committed render, and React's automatic
  batching does not merge an effect's state update back into the commit that caused it.
- **Narrowing is the smallest correct choice for today**, both callers pass direct `useState` setters,
  and no heuristic can separate a late echo from an unrelated restore. Matching later text by its
  value reintroduces `RestoredAfterReset`, which is the third option I had already talked myself out
  of. The only correct alternative is explicit provenance, a token the parent echoes, and that is a
  protocol rather than an internal tweak.
- **`DESIGN.md` section 3 is the right home** for the labelled author decision, because the exit
  requires it and the precedent fits. **A product-specific runtime contract does NOT belong in
  `AGENTS.md`.**
- **KN-016's closed exit stays untouched.** This card is the corrective record; rewriting the original
  requirement would erase the fact that its completion overstated the behaviour.

Two corrections to take into the build:

- The harness uses `pending: string | null` and tests `pending !== null`, **not truthiness**, so it
  stays valid if it is later used to test a delayed CLEAR, where the pending value is the empty string.
- The story **`waitFor`s the field's delayed value BEFORE waiting past `DEBOUNCE_MS`**, then asserts
  `onChange` happened and `onSearch` did not. That proves the delayed echo actually occurred rather
  than proving an absent callback, which is the trap below.

And for the other branch, if the owner chooses provenance: the story uses the protocol and expects ONE
search, because a parent that does not echo the token stays intentionally unattributable.

## The replan, now that KN-695 has landed

KN-695 closed at e29b86e, so the note above is answered: **both screens now pass `onSearch`.** The
board's `cardsOf` and the contacts page's `shown` filter on an `appliedSearch` the bar hands over once
typing pauses, and a clocked end-to-end spec proves the wait, failing 4 of 4 on the old wiring and
passing 4 of 4 with it.

**What that changes for this card, and what it does not.**

- **The scenario is reachable at last.** Until KN-695 there was no caller at all, so a page answering a
  keystroke late was a shape nothing in the product could even occupy. Now the callback is wired on
  two real screens.
- **But no reader meets the gap today, and the reason is unchanged.** Both screens pass **direct
  `useState` setters**, `onChange={setTypedSearch}` and `onSearch={setAppliedSearch}`, so every echo
  lands in the same commit as the reader's change. The argument above, that narrowing costs nothing
  today, survives KN-695 with better evidence than it had: it is no longer "nothing calls this" but
  "the two things that call it both answer immediately".
- **The decision is still the owner's**, on the plan review's reading, because it changes a shared
  component's public contract and the promise KN-016 carries. That has not moved.

**How to put it to them, which is the part I got wrong.** The first attempt asked the owner to choose
between "late controlled parents are unsupported" and "add provenance support", in those words, before
explaining anything. They could not read it, and were right not to. The rule they gave in reply is now
in `STATE.md` and `AGENTS.md`: explain what actually happens first, walking it the way a reader meets
it, then the problem, then the suggestion, in short plain sentences with no jargon.

And check before asking. Last time the question was about a case that could not happen, which one
search would have shown. The equivalent check here: **before asking, confirm that no screen answers
late**, so the question is honestly "should the bar support a page that does not exist yet", which is a
different and much cheaper question than "is the bar broken".

## Round two of the review, after the replan, and it corrects me

**Still the owner's call.** KN-695 changed reachability, not ownership.

**And my argument was partly wrong.** I wrote that both screens now pass `onSearch`, so the scenario is
reachable. But `onSearch` is **not the controlled-value echo** this card is about: the value comes back
through `onChange={setTypedSearch}`, in the event's normal React batch, and `onSearch` is deliberately
later. So the right conclusion, that no reader meets the gap today, follows from the `onChange` setters
being direct, exactly as it did before KN-695. Reaching a true conclusion by a wrong route is worth
recording, because the route is what the next reader would reuse.

**There is no third, decision-free path.** "Document the limit accurately" IS the narrow branch, and
the exit requires that branch to be **decided and recorded**, not described as an accidental
limitation. So this card cannot be finished by writing better prose.

**A component STORY is the right proof, not an end-to-end spec.** It tests the bar's public
controlled-parent contract, including a caller that does not exist, and inventing a delayed store in
product code would not prove a real product path. KN-695's real-app coverage already proves the actual
direct callers use the debounce. The story asserts the delayed field value BEFORE asserting no search,
as planned.

**A factual correction, which I asserted twice and got wrong: the "author proposal" precedent is in
`DESIGN.md` SECTION 6, not section 3.** And where the record goes depends on the answer: if the owner
chooses narrowing, it goes in section 3 as an **owner-approved** runtime contract, because the exit
requires `DESIGN.md`; while no answer has been given it belongs in **section 6 as a proposal only**,
and the card cannot close.

**Name the control mutation concretely.** "Implement provenance by hand" is too vague and can fail the
typecheck before the story ever runs, which is precisely what cost KN-695 a whole control run. The
mutation must be a compiling behavioural change that makes the delayed echo search, run the story
against it, then restore byte for byte. The harness keeps `pending !== null` so a delayed empty clear
stays representable.

**Once narrowing is chosen**, the smallest correct work is the delayed-parent story, both
documentation translations, and the approved `DESIGN.md` record. **No `SearchBar.tsx` change and no
extra end-to-end test.**

## The story, and the trap it has to avoid

A story drives a page that echoes one commit late: it holds the value in state, takes `onChange` into
a pending slot, and copies pending into value from an effect, so the echo lands on a later commit than
the reader's change. It types, waits past `DEBOUNCE_MS`, and asserts the decided behaviour.

**It must assert the positive first.** "No search ran" is also exactly what a story whose typing never
happened would show, and `AGENTS.md` records that an absence passes on its first poll. So the story
asserts that the field DOES show the typed text and that `onChange` WAS called, which proves the page
accepted the change late, and only then that `onSearch` was never called. That ordering is the
difference between proof and theatre.

It fails if the other behaviour is implemented, which is what the exit asks: a bar that attributed a
late answer would call `onSearch` and the last assertion would break.

## File by file

- `DESIGN.md` — one short subsection under section 3, labelled as the author's decision.
- `apps/web/src/shared/story-docs/en/Shared-SearchBar.md` and `fa/…` — the paragraph that currently
  records the limit as something "the bar cannot tell" becomes the stated contract, and the `onSearch`
  entry says it in one line.
- `apps/web/src/shared/search-bar/SearchBar.stories.tsx` — one new story and its parent component.
- This plan.
- **Not changed:** `SearchBar.tsx`. The behaviour is the decided behaviour; this card makes the promise
  match it. Nor `KN-016`'s card.

## What I expect to be hard, and what I am unsure about

- **Whether this is mine to decide at all.** I judged it a build decision: no Figma annotation touches
  it, the debounce is internal, and the owner's rule of 2026-09-16 was a rebuke for stopping work to
  ask about internals. But it narrows a promise the board carries, and if the review reads it as the
  owner's call I would rather be told before it is written into `DESIGN.md`.
- **Whether `DESIGN.md` is the right file** for a runtime contract at all, given all three of its
  candidate sections are about what Figma draws or flags. The exit names it, so I am following the
  exit, but the fit is imperfect and a reviewer may see a better home.
- **The story's shape.** Echoing "one commit late" through an effect is my reading of what a deferred
  store does; a real store might batch differently, and a story that defers in a way React coalesces
  back into one commit would prove nothing.

## How I will know it worked

- **The story is the proof and it must fail on the alternative**: implement the attribution by hand,
  see the new story fail, revert, see it pass. A story that cannot fail on the behaviour the exit
  contrasts it with is not evidence.
- `npm run contract`, since `DESIGN.md` changed and it is the checker that stops the board drifting
  from the design.
- The story-docs guard through the unit project, read from the summary line and refused on "skipped".
- `tsc --noEmit` and `eslint --max-warnings 0` from `apps/web`.
- Both Docs pages read in tabs with the locale pinned in the URL.
- Prettier drift unchanged on every file.

## What I am asking the review

1. Is narrowing mine to decide, or does changing a promise the board carries make it the owner's?
2. Is a labelled author subsection in `DESIGN.md` section 3 the right home for a runtime contract,
   given that section is otherwise Figma annotations? Is there a better file?
3. Does a parent that copies pending into value from an effect really echo on a LATER commit, or can
   React coalesce it into the same one and make the story prove nothing?
4. Is there a fourth option between narrowing and a full token protocol that I have not seen?
