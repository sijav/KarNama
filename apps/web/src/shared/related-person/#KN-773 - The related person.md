# KN-773 · The related person, Related Person 1096:3109 and Related Person / Mobile 1313:3295

**Why**, from the board: components before screens; the redesigned job modal's
related people tab and the mobile detail page compose it, and cannot be built
to the design until it exists.

**Exit**, from the board: a story per variant of 1096:3109 and 1313:3295
renders it in fa-IR and en-US, light and dark, with both story-docs entries;
every size, gap, radius and colour resolves through the tokens and matches
`get_design_context` on 1096:3109 and 1313:3295; `DESIGN.md` names the node,
its states and its rules; lint, tsc and its tests pass.

## What the file draws, read 2026-11-03

- **Related Person**, 1096:3109, Default and Hover: a row 672 by 60, 12 above
  and below and 16 at the sides, 12 between, `color/bg/surface`; from the
  inline start the name in Title and «سمت · شرکت» in Label in
  `color/text/secondary`, 40 together, so they reach 2 into the padding; the
  tag, a chip of `color/bg/surface-secondary` with 4 and 8 round its Label,
  shown when the person has one; and at the inline end three Icon Buttons, 4
  apart: «برداشتن از این فرصت شغلی» with `link-off` at Tone=Neutral, «کپی
  ایمیل» with `mail` and «کپی شماره» with `phone` at Tone=Primary, at an
  opacity of 0. Hover fills the row with `color/bg/surface-secondary`, lifts
  the chip to `color/bg/surface` and shows the buttons. Its description: the
  people tab's row; unlinking does not remove the person from the network. The
  job modal's People, 1096:92330, stacks two with no gap.
- **Related Person / Mobile**, 1313:3295: 358 wide, hugging, the same padding
  and gap, its items at the top; the name, the role and the chip under it, 4
  apart; the buttons always shown, since a phone has no hover.
- The handoff names the three buttons' labels and says unlinking only cuts the
  link.

## The approach

1. `RelatedPerson` in a new `shared/related-person`, the two variants behind
   a `layout` of `desktop` or `mobile`; the row a group named by the person,
   so a screen reader hears each button with whose it is.
2. The desktop buttons show on hover, on focus inside the row, and always
   where there is no hover, so a keyboard or a touch reader can reach what
   they see; each copy button is drawn only when there is a value to copy.
3. Copying writes to the clipboard and tells the caller with `onCopied`, so
   the screen can say so with its toast, KN-764; a refused clipboard says
   nothing.
4. Stories for both variants, the hover, the keyboard, each button and a
   refused clipboard, English and dark.

## How it is checked

Its stories, lint, tsc, and a look in both schemes.
