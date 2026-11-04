# KN-772 · The linked job opportunities, Linked Job 1092:2997 and Linked Jobs 1092:3103

**Why**, from the board: components before screens; the redesigned network's
person modal composes them, and cannot be built to the design until they exist.

**Exit**, from the board: a story per variant of 1092:2997 and 1092:3103
renders it in fa-IR and en-US, light and dark, with both story-docs entries;
every size, gap, radius and colour resolves through the tokens and matches
`get_design_context` on the two nodes; `DESIGN.md` names the nodes, their states
and their rules; lint, tsc and the tests pass.

## What the file draws, read 2026-11-04

- **Linked Job**, Default and Hover: 512 by 56, 8 and 12 in, 12 between; from
  the inline start a Status Stripe 3 by 32, the title in Body over the company in
  Label `text/secondary`, cut at their end, the Status Chip S, and the Neutral
  Icon Button `link-off` at opacity 0 but on Hover, which fills
  `bg/surface-secondary`.
- **Linked Jobs**: «فرصت‌های شغلی وصل‌شده» in Label `text/primary`, 8 above;
  Empty «هنوز به فرصت شغلی‌ای وصل نیست.» in Body `text/secondary`; Filled the
  rows in a list at radius 8 inside one pixel of `border/default`, in its layout,
  a divider between; then Button / S, Text, with the plus, «وصل کردن به فرصت
  شغلی».
- **Picking**: the Job Picker 4 under the section's end, from its inline start,
  360 wide, 8 in and 4 between, radius 8, one pixel of `border/default`, a
  shadow of `#121726` at 12 percent, 0 6 blur 16; the search 41 tall at radius 4
  inside one and a half of `border/focus`, the search icon at its start; the
  options 54 tall at radius 4, 8 and 12 in: a stripe 3 by 28, the title and
  company, and the Status Chip S, or, linked, the title and company in
  `text/secondary` and «وصل است» with the check in `text/brand`; a hovered one on
  `bg/surface-secondary`.
- The Contact Modal on the Components page holds it, Empty and Filled.

## The approach

1. `LinkedJob`: title, company, status and onUnlink; the unlink button under
   the pointer, with focus inside and always where there is no hover.
2. `LinkedJobs`: linked, jobs, onLink and onUnlink; the picker a Popover
   holding a combobox over a listbox, the linked ones there but not choosable,
   three shown before it scrolls, the catalog's «نتیجه‌ای پیدا نشد» when the
   search finds none.
3. `elevation.picker` for its shadow; the catalog's six new messages.
4. Stories for both, the picker measured, choosing, searching, the keyboard,
   unlinking, English and dark, the runner widened to hold the picker.

## How it is checked

Their stories, with planted wrong sizes failing them, the token, theme and docs
suites, lint, tsc and a look against the frames.
