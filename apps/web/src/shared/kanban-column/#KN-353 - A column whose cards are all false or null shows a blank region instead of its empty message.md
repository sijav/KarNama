# KN-353 · A column whose cards are all false or null shows a blank region instead of its empty message

Beside the kanban column. Recorded after the fix, on 2026-09-11, under the
owner's rules of that day.

**Exit condition, from the board.** The column shows the empty message whenever
no child renders, null, false and empty arrays included (Children.toArray), and
a story passes such a list.

## What was done

- The column decides it is empty by `Children.toArray(children).length`, which
  drops false, null and undefined and flattens lists, where `Children.count`
  counted each of them as a child.
- EveryCardFiltered hands the column `[false, null, []]`, what a board that
  filters every card away passes, and finds the empty message; it failed on the
  old count. Looked at in Persian light; the change is the decision, not the
  drawing.
