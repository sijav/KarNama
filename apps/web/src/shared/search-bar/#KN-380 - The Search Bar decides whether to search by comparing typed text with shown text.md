# KN-380 - The Search Bar decides whether to search by comparing typed text with shown text

## The card

**Why.** KN-314's invariant, a search only for text the field showed and never for a change the user
did not make, holds for a parent that stores the value as typed and fails for the other parents a
controlled bar exists to serve.

**Exit.** Stories, each failing on KN-314's code: a parent ignoring the clear gets no search and no
late one; a parent lowercasing input gets one search for the lowercased text; a parent restoring a
reset value gets none; and the Search Bar's existing stories still pass.

A child of KN-016, from the KN-314 roast. Four findings of one cause, filed as one card because one
change answers all four.

## All four confirmed by reading `SearchBar.tsx`, not taken from the card

The mechanism, lines 62 to 98: `text` is `value ?? own`; `typed` is a ref holding the last typed
string; the search effect is keyed on `[text]` and returns early unless `typed.current === text`;
`change()` sets `typed.current = next`; `clear()` sets `typed.current = null`, empties, and calls
`onSearch('')` **immediately**; and `search.current = onSearch` is written in a passive `useEffect`.

1. **A parent that ignores `onChange('')`.** `clear()` fires `onSearch('')` at once. The parent
   ignores it, so `text` never changes, so **the effect never re-runs and its cleanup never
   cancels** — the timer started for «foo» survives and fires later. The parent gets `''` and then
   «foo», for a field still showing «foo».
2. **A parent that normalises.** Typing `F` sets `typed.current = 'F'`; the parent shows `f`; the
   guard `typed.current !== text` returns and **no search ever runs**. The code before KN-314 did
   search here.
3. **A parent that resets and later restores.** `typed.current` still holds «foo» from earlier
   typing. The parent sets `''`, then restores «foo» with no keystroke: the guard now passes and a
   search runs **for a change the user did not make** — the very thing KN-314 set out to prevent.
4. **The `onSearch` ref is written in a passive effect**, so a timer due between a commit and that
   effect calls the PREVIOUS callback.

**One cause.** The bar decides by comparing two strings, `typed` and `text`, when the question is
whether THIS user change reached the field.

## The design, and it is the card's own

Judge each user change by its own commit. A change records the text shown before it, its kind, and a
count that always differs so the state is never conflated with a repeat:

- `change()` and `clear()` record a FRESH `{ before: text, kind }` and no longer search directly —
  **`clear()` calling `onSearch('')` eagerly is finding 1 and goes.** No counter: a new object
  differs by identity, so `useState` schedules the commit on its own. The review removed that piece
  of machinery I had invented.
- **The handled marker is a ref keyed by that record object, not state**, so marking it can never
  itself restart or cancel the debounce.
- One effect keyed on the record and on `text`. Absent or already handled: do nothing, so a later
  text change **cancels through the cleanup and does not restart**. Otherwise **mark this record
  handled FIRST**, then: if `text === before` the parent ignored the change and nothing is searched;
  else search what the field now shows, at once for a clear and after `DEBOUNCE_MS` for typing.
- **Marking before the equality check is the review's correction and it is a real bug it caught.** I
  had written the ignored branch as "do nothing" and returned before marking. A later unrelated
  parent update would then re-run the effect against a still-unhandled record and search THAT value
  — finding 3 reintroduced through its own fix. Ignored must mean no search ever, for that attempt.
- `search.current = onSearch` moves to `useLayoutEffect`, finding 4: it updates during commit,
  before paint and before passive effects.

Why each finding falls out: (1) the ignored clear leaves `text === before`, so nothing fires, and
the earlier timer is cancelled by the cleanup rather than orphaned; (2) the normalised value differs
from `before`, so one search runs for what is shown; (3) a restore is not a user change, so there is
no unhandled record and nothing starts.

## What I will change

- `apps/web/src/shared/search-bar/SearchBar.tsx`, the decision and the ref
- `apps/web/src/shared/search-bar/SearchBar.stories.tsx`, three fixed-parent stories on the
  `Resetting` precedent
- `apps/web/src/shared/story-docs/en/Shared-SearchBar.md` and `fa/Shared-SearchBar.md`, an entry
  each, in both languages
- this plan

## What I expect to be hard, and what I am unsure of

- ~~**`Clearing` asserts `onSearch` was called with `''`.**~~ **Settled: it takes a `waitFor`, and
  that is a correction rather than a warning.** Once the callback runs from an effect, the UI
  commits first and the effect runs after, so the story should not promise a synchronous call. It
  may well pass as written, because awaited interaction helpers commonly flush React work — which is
  precisely why it should not stay as written: it would be passing by accident of the runner.
- **`Debounced` and `Clearing` already carry `restoreMocks: false`** for KN-584, because their args
  are written while they play. New stories with fixed parents do not write args, so they should not
  need it — but if one flakes, that is the precedent rather than a sleep.
- **The `Held` harness is a controlled parent with an echo protocol.** The new stories deliberately
  use small fixed parents instead, as `Resetting` and `IgnoredKeystrokes` do, so each story states
  one parent behaviour plainly.
- **Three new stories need six docs entries**, and the guard checks names, not prose.
- **A boundary to state rather than let a reader assume away.** This design deliberately treats a
  parent that reflects a change ASYNCHRONOUSLY as indistinguishable from one that ignored it, because
  on the commit after the keystroke both look the same. It answers the card's four cases, which are
  all synchronous fixed parents, and it cannot attribute an arbitrary later prop change to an earlier
  keystroke without an explicit acknowledgement or revision protocol between parent and bar — which
  is what the stories' own `Held` harness does with its revision echo, and which the component does
  not ask of its callers. **Round two put that limit in the story DOCS rather than a component
  comment**, since it is behaviour a caller meets and the documentation rule sends that to markdown.
- **Round two also shortened the ignored-clear story's typed value.** Cancellation is guaranteed by
  React running the previous cleanup before the next setup, for both dependencies — but a timer that
  has ALREADY FIRED before the clear commits is not a timer the clear could have cancelled. Typing
  nine Persian characters risked crossing the pause, so the story types two and clears well inside
  it, and fails for its own reason or not at all.

## How I will know it works

- **Each of the three new stories fails against `SearchBar.tsx` as it is** and passes after — the
  exit says so in those words, and a story for a fix that was never seen to fail proves nothing. Run
  whole-file, read from the summary line, refuse any run that skipped or ran none.
- **Each must be built so that it genuinely fails, which the review made precise.** The ignored
  clear must **type a value first** into a parent that accepts non-empty changes but rejects `''`,
  and clear before `DEBOUNCE_MS` — a prefilled field never creates the old pending timer, so that
  story would pass on the broken code and prove nothing. The lowercasing one types an uppercase
  value and waits for exactly ONE lowercase call. The reset-and-restore one lets the first typed
  search complete, clears the spy, then resets and restores, and asserts no second call after the
  window.
- **The existing stories pass unchanged**, `Clearing` and `Debounced` especially, since they encode
  what KN-314 established and this card must not trade one parent's correctness for another's.
- The unit and storybook projects pass, `tsc` and `eslint` are clean, no changed file's drift grows
  and this plan's is 0.
