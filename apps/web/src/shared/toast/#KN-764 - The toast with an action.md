# KN-764 · The toast with an action, Toast / Action 956:3193

**Why**, from the board: components before screens; the redesigned board
composes it, and cannot be built to the design until it exists.

**Exit**, from the board: a story per variant of 956:3193 renders it in fa-IR
and en-US, light and dark, with both story-docs entries; every size, gap,
radius and colour resolves through the tokens and matches `get_design_context`
on 956:3193; `DESIGN.md` names the node, its states and its rules; lint, tsc
and its tests pass. The toast is announced to a screen reader.

## What the file draws, read 2026-11-03

- **Toast / Action**, 956:3193, Default and Hover: «لغو» at 13 on 20 and
  SemiBold in #93C5FD, bound to no variable; Hover underlines it. No instance
  uses the component.
- **The whole message**, the frames' Toast, 717:12416, and its copies in
  1062:54408: a pill hugging its content, `color/text/primary`, radius 12, 12
  above and below, 16 at the sides and 16 between its parts, none bound, and
  one shadow of #111827 at 20 percent, 8 below, blurred 24; the message at the
  inline start, 13 on 20 at Regular in `color/bg/surface`, and the action
  after it. Shown, it sits 24 above a desktop frame's foot, centred over the
  page beside the 240 sidebar; 40 of the 46 copies sit below the frame, where
  it comes up from. The messages: a card moved, a stage added or deleted, with
  «لغو», and «۳ نفر از این شرکت در شبکه‌ی شما هستند» with «وصل کردن».
- The handoff: the bottom message's button is #93C5FD, bold, underlined on
  hover, and wants a token; a message with a button stays 5 seconds and
  «تغییرات ذخیره شد» 3; it comes in over 250; no entrance animation runs for
  a reader who asks for less motion; its button is «لغو». Open with the
  designer: 8 seconds instead of 5.

## The approach

1. `text/brand-inverse`, #93c5fd, the owner's addition on the handoff's word:
   in dark the pill, `text/primary`, turns light, so the action takes the
   light scheme's `text/brand`, walked against it. `elevation.toast`, and
   `unstyledText.toastMessage` and `toastAction`, the two 13 on 20s.
2. `Toast` in `shared/toast`, on MUI's Snackbar: its times, holding while
   the pointer or focus is on it, Escape, a press elsewhere leaving it, its
   slide up over 250 and none for less motion; a row across the page with the
   pill centred, over the tab bar on a phone and beside the sidebar on a
   desktop, the sidebar's width exported for it.
3. Spoken from a status region that stays in the page, its message written
   100 after it opens, KN-326, so the pill's copy is hidden and the action
   is named with the message.
4. The board's messages, and where focus goes after an undo, are the board's,
   KN-805.

## How it is checked

Its stories, the theme's tests, lint, tsc, and a look in both schemes.
