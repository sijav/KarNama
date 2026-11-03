# KN-777 · The icon button's label tooltip, Tooltip / Label 1123:56919

**Why**, from the board: every icon-only button in the redesign names itself
with it, and without it they are unnamed to a sighted reader.

**Exit**, from the board: a story per variant of 1123:56919 renders it in fa-IR
and en-US, light and dark, with both story-docs entries; every size, gap, radius
and colour resolves through the tokens and matches `get_design_context` on
1123:56919; `DESIGN.md` names the node, its states and its rules; lint, tsc and
its tests pass. Every button 1123:57071 lists shows its label on hover and on
keyboard focus.

## What the file draws, read 2026-11-03

Tooltip / Label, `1123:56919`, one component with no variants, in the Menu
section: a horizontal frame filled with `color/text/primary`, `spacing/2xs`
above and below and `spacing/xs` at the sides, `radius/sm`, no shadow, 65 by 23
round «کپی ایمیل». The text, `1123:56920`, is bound to no text style: Inter
Regular 12 on its automatic line, 15, no letter spacing, in
`color/text/on-accent`. Its description and the spec frame
«Spec / تولتیپ دکمه‌های آیکونی», `1123:57071`: every button that has only an
icon names itself with it on hover or keyboard focus of the button itself, never
of the whole row; above the button, centred, 4 away, and below it when there is
no room; it opens after about 300 ms and closes at once; its text is the
button's aria-label. The spec draws it over the network row's copy email, copy
phone and open link, the related people tab's unlink, copy email and copy phone,
and the person window's unlink, none of which is built yet. DESIGN-HANDOFF.md
says the same, and lists the old Tooltip among the components the Screens page
never uses.

## The decisions

- **The family.** The file sets the label in Inter, which has no Persian
  letters, so the browser would draw «کپی ایمیل» in a fallback anyway. The
  product has one family, Vazirmatn, and the label uses it at 12 on the file's
  15, which keeps the frame's 23. The 12 on 15 joins `unstyledText`.
- **No transition.** The file draws none, and the spec asks for an opening after
  about 300 ms and a closing at once, so MUI's grow is turned off both ways and
  the delay holds for a second tooltip too, which MUI would otherwise open at
  once.
- **The Icon Button carries it.** Every icon-only control here is an
  `IconButton`, so the button wraps itself in the label with its own name, and
  the rows the spec lists inherit it when they are built. The tooltip names
  nothing new: MUI keeps the button's own aria-label, the same text.
- **The old describe Tooltip wins where it already is.** Four icon buttons sit
  in the old Tooltip today: settings, sign out and the language switch in the
  shell, and the network page's add. A label inside it would show a second tip,
  so the old Tooltip tells what it wraps, through a context, that it already
  speaks for it, and the label stays out. The handoff's shell and network page
  draw none of the four tips, so their own cards remove them.

## The approach

1. `TooltipLabel` in `shared/tooltip-label`: MUI's Tooltip at the top, 4 away,
   flipping below by Popper's own flip, opening after 300 ms and 300 ms again
   for the next, closing at once, not interactive, the surface the file's,
   its colours through `tooltipPair`, which keeps the text legible in dark,
   KN-398. Inside the old Tooltip it renders its child alone.
2. `IconButton` wraps both its shapes in it with its name.
3. Stories first: the label on a bare trigger, opened by a mouseover and by a
   real Tab, measured against the file, closed at once, flipped below at the top
   of the page, in Persian, English and dark; the Icon Button naming itself on
   hover and on focus, and once only inside the old Tooltip.
4. Docs in both languages for the label and the Icon Button, the catalog's
   «کپی ایمیل», `unstyledText`, and a `DESIGN.md` entry.

## What is hard, and what is unsure

- MUI's Tooltip margins carry its 14 px gap and a 2 px margin; the label's own
  margins replace them by the same placement selectors the old Tooltip uses.
- A mouseover by `fireEvent` opens MUI's tooltip without the real pointer,
  which KN-365 shows other files' stories move.
- Every story that hovers or focuses an icon button now opens a tooltip over
  the page; the suite is run to see whether any relied on there being none.

## How it is checked

The new stories and the Icon Button's, the old Tooltip's and the shell's
stories in the storybook project, lint, tsc, the unit project's catalog and
tokens tests, and a headless look in both languages and both schemes.
