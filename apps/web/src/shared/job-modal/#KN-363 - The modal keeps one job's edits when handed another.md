# KN-363 · The modal keeps one job's edits when handed another

Beside the component, per `agent/RALPH.md` step 2b. Child of KN-030, from its
roast.

## The card

**Why.** Saving one job opportunity's edits onto another corrupts the record the
product exists to keep.

**Exit condition.** The record carries its id, the modal starts over from a
record with a different id while open, keeps edits across new objects of the
same record, and a story swaps the job while open and saves the new one's
fields.

## What is actually wrong

`JobModal` copies the record into state and starts over only when `open` turns
from false to true. A page that swaps the `job` prop while the modal stays open
draws the new record's header, history, people and files over the OLD record's
editable fields, and Save sends those fields as the new record's. `JobRecord`
carries no id, so the modal has nothing to notice the change by.

## The approach

- `JobRecord` gains `id`. The board already passes it: it spreads a `JobEntry`,
  which has one, so the field is arriving and simply is not declared.
- The `seen` state the modal already keeps for `open` and the asked-for tab
  gains the id. The reset runs when the modal opens OR when the id changes while
  it is open.
- Identity is NOT the test. The provider builds new objects on every change, so
  a reset on `job !== seen.job` would throw away what a reader is typing every
  time anything on the board moves. The id is the test, which is why the card
  asks for it.

## What I am unsure about

- Whether the tab should also start over when the record changes, or stay where
  the reader left it. Starting over matches "each opening starts from the
  record"; staying put matches "the reader chose this tab". The card does not
  say, so the smaller change: the tab follows the same rule it already does,
  the one asked for.
- Whether the files and people, which are read from the record rather than held
  in state, need anything at all. I think not.

## How I will know it worked

A story opens the modal on one job opportunity, types into it, swaps the record
for another while it stays open, and saves: what is saved is the second
record's fields, not the first's. And a second story hands the modal a NEW
OBJECT of the same record and finds the reader's typing still there.
