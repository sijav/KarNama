# KN-347 · The Contact Modal wipes what is typed when its parent passes a fresh copy of the record

Beside the modals. Recorded after the fix, on 2026-09-11, under the owner's
rules of that day.

**Exit condition, from the board.** The form resets on opening and on a change
of the record's identity, an id, not on a new object with the same contents,
and a story rerenders the parent mid-typing and keeps the text.

## What was done

- The modal takes `recordId`, the id of the record being edited, and starts
  its form again only when it opens or that id changes. It used to start again
  whenever `initial` was a different object, so a parent passing
  `{ ...contact }` wiped the typing on every render. Without a `recordId`, as
  in Add, only an opening starts it again.
- KeepsTypingThroughARerender: a parent that hands over a fresh copy of the
  record on every render and renders again through a hidden button only the
  play presses; the name typed over the record survives. It failed on the old
  modal. The modal's and the Job Modal's stories pass. Looked at in Persian
  light only: the change is behaviour, and the file's stories pin Persian.
