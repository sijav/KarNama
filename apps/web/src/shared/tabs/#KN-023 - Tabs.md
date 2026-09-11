# KN-023 · Tabs

Beside `Tabs.tsx`, a new component folder.

**Why, from the board.** The job detail modal puts the whole detail view behind
its tabs, so the modal cannot be built before this is.

**Exit condition, from the board.** Three states match Figma, the tablist
follows the roving tabindex pattern with arrow key navigation, the active tab
is announced as selected, and panels are associated with their tabs.

## What the file draws, read with use_figma on 2026-09-11

- **Tab Item, `204:20`**: Default, Active and Hover. A vertical stack, 12 above
  (`spacing/sm`), 16 at the sides (`spacing/md`), none below, 8 between
  (`spacing/xs`): the label, 14 on 22, then a 2 pixel indicator as wide as the
  label; 44 tall. Default: label `text/secondary` at 500, indicator none.
  Hover: `text/primary` at 500, indicator `border/default`. Active:
  `text/brand` at 600, indicator `bg/brand/default`. No tracking. The weights
  compose body's size and line height with the label's 500 or the headings'
  600, as the Status Chip's M does, since no sixth role is allowed.
- **The row, in the Job Modal `210:101`**: full width, 44 tall, a gap of 4
  (`spacing/2xs`), 16 at each side, the tabs from the inline start, a one pixel
  `border/default` edge along the bottom, inside, and the frame clips.
- Its first tab reads «اطلاعات فرصت شغلی», where DESIGN.md lists «اطلاعات آگهی»;
  the file wins and DESIGN.md is corrected with this.

## The approach

1. **MUI's `Tabs` and `Tab`**: role tablist and tab, `aria-selected`, roving
   tabindex, arrow keys that move focus, Home and End, Enter and Space to
   choose, the direction taken from the theme so RTL arrows turn round; the
   scrollable variant with no buttons, so five tabs scroll on a narrow screen.
   MUI's own sliding indicator is off: the file draws one under every tab,
   Hover's included, so each tab draws its own on an `::after`.
2. **Panels**: each tab has an id and `aria-controls`; every panel is rendered,
   `role="tabpanel"`, labelled by its tab, and hidden unless chosen, so a
   note typed in one tab survives a switch, which KN-030 needs.
3. **Focus inside the tab.** The row clips, as the file draws it, so the ring
   cannot sit outside: three pixels of `border/focus` on a `::before`, from 1
   to 4 in from the tab's box, radius `sm`, since WCAG's understanding of
   2.4.13 asks an indicator inset from the edge to be thicker than two. A 153
   by 44 tab's band is about 1122 square pixels against its 788.
4. The row's bottom edge on the row's `::before`, under the tabs, so the
   active indicator draws over it.
5. Props: `aria-label` for the tablist, `value`, `onChange(value)`, and `tabs`,
   each `{ value, label, panel }`; labels arrive translated from the caller.

## What changes

- `src/shared/tabs/Tabs.tsx`, `index.ts`, `Tabs.stories.tsx`: new; Default
  with the modal's five tabs, KeyboardOnly, Hover with a real pointer, and
  InEnglish.
- The catalogs: the five tab names and the tablist's name.
- `story-docs/{en,fa}/Shared-Tabs.md`, `story-meta.ts`: new title.
- `DESIGN.md`: the first tab's name.

## What I am unsure about

- Manual activation, MUI's default, against selection following focus: the
  exit condition allows either, and manual keeps a panel from loading on every
  arrow key.

## The check, and what changed after it

Checked with `roast.py plan` on 2026-09-11 beside the build: sound. MUI 9.4's
scrollable Tabs keep the roving tab stop, RTL arrows and manual activation, and
the indicator can be hidden through `slotProps`; MUI's Tab defaults, min height
48, min width 90, padding and uppercase, are overridden, as the draft already
did. Its warning, that a hovered or active tab's indicator covers part of the
ring's lower band, matters only to an area claim, and none is made here.
Built: the stories pass, and in a production build every play finishes; seen
in both languages and schemes.
