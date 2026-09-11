# KN-302 · Every tab panel is a tab stop, so a panel holding a field puts an extra stop before it

Beside the Tabs. Recorded after the fix, on 2026-09-11, under the owner's rules
of that day.

**Exit condition, from the board.** A panel with focusable content is not
itself a tab stop and one with none is, decided from what it renders; a story
with a field in a panel shows Tab going from the tab to the field, and one with
only text shows the panel reached.

## What was done

- Each panel takes `watchStops` as its ref: it looks for anything in the panel
  that is tabbable, a tab index of zero or more, not disabled, and shown, and
  keeps `tabindex="0"` on the panel only when there is none. A
  MutationObserver reads again on any change inside the panel or to its own
  attributes, so a hidden panel is read again when chosen, and content that
  arrives late is seen.
- The DOM holds the attribute, not React state: an update from the observer
  would reach React a task later, after a quick Tab. The write happens only when
  the answer changes, since writing the attribute is itself a mutation and
  would wake the observer forever.
- TabReachesTheField chooses the Note tab with a real click, its panel holding
  an Input, and a real Tab lands on the field; it failed before the change.
  TabReachesTheText: a real Tab from the chosen tab lands on a panel of text.
  Neither pins a language, so the Docs page keeps the toolbar's, KN-090.
- The APG also keeps a panel a tab stop when its first content is text before a
  field. The card's rule is simpler, a panel with anything tabbable is not a
  stop, and the Job Modal's panels open on their fields.
- Seen: a focused panel draws the browser's own outline, not the product's
  ring, filed as KN-375.
