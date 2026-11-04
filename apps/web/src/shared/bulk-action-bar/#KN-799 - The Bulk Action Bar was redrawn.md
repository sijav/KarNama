# KN-799 · The Bulk Action Bar was redrawn, from 832 to 939 wide

**Why**, from the board: the owner's instruction of 2026-11-03 is that
everything matches the redesign, and the board's and the network's selections
act through it.

**Exit**, from the board: the plan lists every difference between 401:436 in the
copy EITM6CbJY33dMY8IsMFR4R and in the original; the component and its stories
then draw the original's version of every variant, each new variant with a story
of its own, in fa-IR and en-US, light and dark, with both story-docs entries;
sizes, gaps, radii and colours resolve through the tokens; `DESIGN.md`'s section
is corrected; lint, tsc and its tests pass.

## Every difference, read with use_figma on 2026-11-04

Both variants were walked node by node in both files, their instances opened:
type, size, layout, sizing, fills and strokes with their variables, stroke
weight and alignment, radius, opacity, effects, bound variables, text and font.

- The bar itself is the same in both: `color/bg/surface`, one pixel of
  `color/border/default` inside, `radius/lg`, `spacing/sm` and `spacing/md` of
  padding, `spacing/sm` between, the same shadow and description. Its set is
  939 wide where it was 832 because both variants grew.
- **The close**: the copy drew a 32 frame of `radius/md` round the Icon set's x
  at 20; the original draws the same 32 frame round **Popover / Close**, a 20
  square of radius 6 round the x at 16, in `color/text/secondary`.
- **The count**: «۲ آگهی انتخاب شده» became «۲ فرصت شغلی انتخاب شد» on Jobs, and
  «۲ مخاطب انتخاب شده» became «۲ نفر انتخاب شد» on Contacts: the terminology rule
  the code already followed for job opportunities, a person rather than a
  contact, and the simple past.
- **Contacts gains Select all**: the Ghost «انتخاب همه» before Delete, as Jobs
  has it, 349 wide where it was 280. Jobs keeps Select all, Change status and
  Delete, 518 wide where it was 480.
- The Secondary Action boolean is still bound to no layer.

## The approach

1. The close is the shared `PopoverClose` at 20 in a 32 box, in place of the
   Icon Button at 32 round a 20 x; its hover fill and focus outline are
   `PopoverClose`'s.
2. Both types take `onSelectAll` and draw Select all; Change status stays the
   job list's alone, so the network's bar still cannot be handed it, KN-331.
   The network page's Select all chooses everyone its search shows, as the
   board's chooses what its search shows, KN-431.
3. The count's Persian says «انتخاب شد», and the network's counts people:
   `person selected` and `people selected`, «نفر انتخاب شد», in place of the
   contact messages, which nothing else uses.
4. The stories read the new close, Contacts' Select all and the network's
   count; both docs and `DESIGN.md` follow.

## How it is checked

The bar's stories, the board and network screens' stories, lint, tsc, the unit
suites and a look.
