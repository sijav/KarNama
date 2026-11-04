# KN-770 · The network's row, Contact Row 1056:2872

**Why**, from the board: components before screens; the redesigned network
page composes it, and cannot be built to the design until it exists.

**Exit**, from the board: a story per variant of 1056:2872 renders it in fa-IR
and en-US, light and dark, with both story-docs entries; every size, gap, radius
and colour resolves through the tokens and matches `get_design_context` on
1056:2872; `DESIGN.md` names the node, its states and its rules; lint, tsc and
its tests pass.

## What the file draws, read 2026-11-04

- **State Default, Hover, Selectable and Selected**: 1136 by 72, 12 and 16 in,
  16 between, one pixel of `border/default` under it.
- From the inline start: the Checkbox, at opacity 0 but on Hover, Selectable and
  Selected; the Name Block, 280, the name in Title and «سمت · شرکت» in Body
  `text/secondary`, cut at their end; the Label Column, 140, a chip of Label in
  `text/secondary` on `bg/surface-secondary`, full radius, 4 and 8 in; the Jobs,
  filling, the first job opportunity a pill of Label in `text/primary`, one pixel
  of `border/default` at radius 4, 4 and 8 in, a 3 by 14 status stripe at its
  start, then «+۲» on `bg/surface-secondary` at radius 4; and the Actions, Icon
  Buttons in Primary, mail, phone and external-link, «کپی ایمیل», «کپی شماره»,
  «باز کردن لینک», at opacity 0 but on Hover.
- Hover fills `bg/surface-secondary` and lifts both chips to `bg/surface`;
  Selected fills `bg/brand/container`, its chips on `bg/surface`, the checkbox
  checked.
- The screens' rows vary: no label, no job opportunity, +۱ to +۳, labels such as
  «مصاحبه‌کننده» and «هم‌دوره‌ای دانشگاه».

## The approach

1. `ContactRow` in `shared/contact-row`, on the Related Person's text helpers
   and copy: name, role, company, label, jobs, email, phone, link, selected,
   selecting, onOpen, onSelectedChange, onCopied.
2. Each action is drawn only when there is something for it; the link opens in
   a new tab, which the Icon Button's link gains as `external`.
3. Hover's look under `(hover: hover)` and with focus inside; the actions always
   where there is no hover; nothing of the hover look while selecting.
4. The name is the row's button: it opens the person, or chooses them while the
   page selects. The count is set left to right.
5. Stories for every state, opening, the keyboard, copying, a bare person,
   English and dark, the runner widened to hold the row.

## How it is checked

Its stories, with planted wrong sizes failing them, the Icon Button's, the docs
guard, lint, tsc and a look against the frames.
