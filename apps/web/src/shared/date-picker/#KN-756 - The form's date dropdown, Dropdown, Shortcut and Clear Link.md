# KN-756 · The form's date dropdown: Date Picker / Dropdown 774:16896, Shortcut 780:44444 and Clear Link 848:2253

**Why**, from the board: components before screens; the redesigned job modal's
and the add flow's date fields compose it, and cannot be built to the design
until it exists.

**Exit**, from the board: a story per variant of 774:16896 renders it in fa-IR
and en-US, light and dark, with both story-docs entries; every size, gap, radius
and colour resolves through the tokens and matches get_design_context on
774:16896; DESIGN.md names the node, its states and its rules; lint, tsc and its
tests pass.

## What the file draws, read 2026-11-04

**Date Picker / Dropdown**, `774:16896`, a component with two properties, Show
Shortcuts and Clear: the redesign's popover panel at 276, `popoverPaper`, 16
round and 12 between. From the top:

- the shortcuts, 6 apart from the inline start, «امروز», «دیروز» and «پریروز»;
- the month calendar, filling the panel's 242;
- the footer, 8 apart: «پاک کردن» at the inline start, then a spacer, then
  Button S Text «انصراف» and Button S Primary «تأیید» at the inline end.

Its description: a press on a day only chooses it and the calendar stays open;
«تأیید» puts the date in the field and closes; «انصراف» or a press outside
closes with no change; «پاک کردن», shown only when the field has a date, empties
it and closes; the form's own save records the change; the shortcuts are the
posted date's alone. The screens give the posted date the shortcuts and the
deadline none, and drop the clear link where the field is empty. A field's press
opens it over 200 ms, Smart Animate ease out, and the handoff's small window
closes in 150.

**Date Picker / Shortcut**, `780:44444`, Default and Hover: a pill at radius 999,
3 above and below and 10 at the sides, its label 12 on 19 at Regular in
`text/primary`, on `bg/surface-secondary`, and on `border/default` under the
pointer over 120 ms. The three on the screens are 47 wide each.

**Date Picker / Clear Link**, `848:2253`, Default and Hover: «پاک کردن» 12 on 19
at Regular in `text/secondary`; under the pointer `text/primary` and
underlined, over 120 ms.

## The decisions

1. A shortcut chooses its day as a press on the day does, and the calendar turns
   to its month; a shortcut whose day the field does not allow is hidden, as the
   handoff says. The posted date's are today, yesterday and the day before;
   English says "Two days ago", which fits beside the other two.
2. A shortcut is at least the frame's 47 wide, so the Persian three match it and
   an English label grows.
3. «تأیید» with no day chosen closes, as «انصراف» does.
4. The panel is a named dialog, named by the field, and focus starts on it, as
   the interview result's does.
5. The calendar fills its container now, 242 in the panel, and turns to the
   chosen day's month when the chosen day moves outside it, for a shortcut.

## The approach

1. Stories, then `DateShortcut`, `ClearLink` and `DateDropdown` in
   `shared/date-picker`, on `popoverPaper`, the Button and the month calendar.
2. Catalog: «دیروز», «پریروز», «پاک کردن» and the shortcuts' row's name.
3. Docs in both languages; DESIGN.md's section and rows.

## How it is checked

The three components' stories in both languages and schemes, measured against
the frames, each act pressed, planted wrong values, the docs and catalog suites,
lint, tsc, and a look.
