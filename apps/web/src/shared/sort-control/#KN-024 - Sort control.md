# KN-024 · Sort control

Beside the control. Recorded after the build, on 2026-09-11, under the owner's
rules of that day.

**Exit condition, from the board.** Three states match Figma, the four
permitted options are the only ones offered, the current sort is visible on the
closed control, the menu is keyboard navigable, and changing sort is announced.

## What was built

- From node 408:512, read with use_figma: Default, Hover and Open on MUI's
  Select, the sort icon, «مرتب‌سازی:», the current order and the chevron, and the
  menu of 447:601, 240 wide and 6 below, hanging from the control's inline end.
- The four orders are the component's own, typed as `SortOrder`, named from the
  catalog: newest, oldest, nearest deadline, company name A to Z.
- The Option Rows and the menu's panel moved from the Select into
  `select/options.tsx`, which both now use, held under `sx` keys so the lint
  rule reads them as CSS.
- A change sets a status region that is in the page from the start, so it is
  read out; focus goes back to the control, MUI's own.
- Stories: Default with its hover, Open, ChangedByKeyboard and InEnglish; seen
  headless in a production build in both languages.
