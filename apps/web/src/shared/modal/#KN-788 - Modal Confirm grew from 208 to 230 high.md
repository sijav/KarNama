# KN-788 · Modal / Confirm grew from 208 to 230 high

**Why**, from the board: the owner's instruction of 2026-11-03 is that
everything matches the redesign, and every confirmation the product asks is
drawn with it.

**Exit**, from the board: the plan lists every difference between 150:92 in the
copy EITM6CbJY33dMY8IsMFR4R and in the original; the component and its stories
then draw the original's version of every variant, each new variant with a story
of its own, in fa-IR and en-US, light and dark, with both story-docs entries;
sizes, gaps, radii and colours resolve through the tokens; `DESIGN.md`'s section
is corrected; lint, tsc and its tests pass.

## Every difference, read with use_figma on 2026-11-04

Every node of 150:92, one component with no variants, was walked in both files,
its instances opened.

- **The close**: the Icon set's x at 20 in the copy; Popover / Close at 20 round
  the x at 16 in the original. KN-838 put it on the shell.
- **The body**: «این آگهی برای همیشه حذف می‌شود و برگشتی ندارد.» in the copy, one
  line; «این فرصت شغلی برای همیشه حذف می‌شه و برگشتی نداره.» in the original, the
  terminology rule's word in the redesign's spoken voice, which wraps to two
  lines at 312, so the modal is 230 tall where the copy drew 208.
- The shell, the header, the dividers, the footer with Ghost «انصراف» and
  Destructive «حذف», and the description are the same.

## The approach

1. The job opportunity's deletion body takes the original's words, and the
   bulk deletion's line, the same sentence counted, takes the same voice.
2. The contacts' deletion lines are the network's, whose redesign, KN-821,
   words them with its people; a note there says so.
3. The Confirm modal's stories already read the body from the catalog; their
   Default and English stories measure the 20 close, KN-838, and a Dark story
   joins them.

## How it is checked

The Confirm modal's stories, the board screen's, lint, tsc and the unit suites.
