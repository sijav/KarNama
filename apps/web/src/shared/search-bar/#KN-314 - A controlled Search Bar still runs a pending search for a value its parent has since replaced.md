# KN-314 · A controlled Search Bar still runs a pending search for a value its parent has since replaced

Beside the Search Bar. Recorded after the fix, on 2026-09-11, under the owner's
rules of that day.

**Exit condition, from the board.** In controlled use a change of value from
the parent cancels any pending search, and onSearch only ever receives a value
the field displayed; a story resets value while a search is pending and asserts
no stale call.

## What was done

- The search is no longer started by the change handler with the typed text.
  An effect keyed on the text the field shows starts it, only when that text is
  what was last typed, and its cleanup cancels it on any change to the text. A
  parent that replaces the value while a search waits changes the shown text,
  so the search is cancelled and none is started for the parent's value; a
  parent that ignores a keystroke never shows the typed text, so none starts.
- onSearch is read through a ref when the search runs, so a parent passing a
  new function every render neither restarts the pause nor searches twice.
- ResetWhilePending: typed, then emptied by a parent through a hidden reset only
  the play presses; the field shows nothing and onSearch is never called.
  IgnoredKeystrokes: a parent holding an empty value; the keys are reported and
  nothing is searched. Both failed on the old code; Debounced still passes.
