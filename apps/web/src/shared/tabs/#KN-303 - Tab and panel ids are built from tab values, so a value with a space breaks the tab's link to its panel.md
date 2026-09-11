# KN-303 · Tab and panel ids are built from tab values, so a value with a space breaks the tab's link to its panel

Beside the Tabs. Recorded after the fix, on 2026-09-11, under the owner's rules
of that day.

**Exit condition, from the board.** Tab and panel ids are well-formed whatever
the tab values, derived from the component's own id and each tab's position or
an escaped value; a story with a value holding a space shows each tab's
aria-controls naming its panel and the panel labelled by its tab.

## What was done

- Each tab's id and its panel's come from the row's `useId` and the tab's
  place in the row, `-tab-0` and `-body-0`, never from its value. Position
  rather than an escaped value, since two tabs sharing a value would share an
  escaped id too, and nothing outside the row reads these ids: the Job Modal's
  stories follow aria-controls, as the Tabs' own do.
- ValuesWithSpaces renders two tabs whose values hold a space and checks each
  tab's id and aria-controls hold none, and that each names the other. It failed
  on the old ids and passes on the new; the Job Modal's stories still pass.
