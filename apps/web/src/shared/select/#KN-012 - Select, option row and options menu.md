# KN-012 · Select, option row and options menu

Beside the Select; the two domain selects are in `src/shared/job-selects`.
Recorded after the build, on 2026-09-11, under the owner's rules of that day.

**Exit condition, from the board.** All five select states and all four option
states match Figma, the listbox is keyboard navigable with arrows, Home, End and
type-ahead, the open state traps focus correctly, and closing returns focus to
the trigger.

## What was built

- From nodes 183:26, 408:465 and 408:487, read with use_figma: the field in its
  five states on MUI's Select with an InputBase, restyled to the Input's family,
  and the Option Rows in their four states in the Options Menu, which opens 4
  below the field, instantly, as wide as the field. The menu's unstyled shadow
  joined the tokens as `elevation.optionsMenu`.
- MUI brings the listbox: arrows, Home, End, type-ahead, Enter, Escape and Tab
  closing, focus back on the field, and the modal's focus trap while open. The
  ByKeyboard story drives all of it, type-ahead with a Persian letter.
- The value is always a list, one at most unless `multiple`; a multiple select
  stays open and lists its names with `Intl.ListFormat`. The prompt is a prop,
  «انتخاب کنید…» by default, since the contact modal's Select has its own.
- `EmploymentTypeSelect`, multiple, the owner's eight types, and
  `JobLevelSelect`, single, the seven provisional levels, with their values as
  English ids and names from the catalog.
- Stories: Default, Filled, Focused, Disabled, Open, ByKeyboard, Multiple and
  InEnglish for the Select, and the two domain selects; seen headless in a
  production build. The hover check uses the runner's own pointer, since a
  simulated one sets no :hover.
