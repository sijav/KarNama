# KN-769 · The redesigned empty states, Empty State / Jobs 894:79222 and Empty State / Network 1083:55307

**Why**, from the board: components before screens; the redesigned board and
the network page compose them, and cannot be built to the design until they
exist.

**Exit**, from the board: a story per variant of 894:79222 and 1083:55307
renders it in fa-IR and en-US, light and dark, with both story-docs entries;
every size, gap, radius and colour resolves through the tokens and matches
`get_design_context` on the two nodes; `DESIGN.md` names the nodes, their states
and their rules; lint, tsc and the tests pass.

## What the file draws, read 2026-11-04

- Both are the general Empty State, 159:80, at 284 by 375: 32 round, 12
  between, the title 16 at SemiBold on the automatic 25, the body 220 wide, the
  8 spacer, and Button / M Primary; with a picture of 160 by 120,
  894:79231 and 1083:55308, where the general one has its round mark.
- **Jobs**, option الف: three stacked cards, the front one white with a brand
  stripe, a square and four lines, and a brand plus disc. Its copy is the one
  the Empty State already shows the board.
- **Network**, option ب: two people's cards, the front one raised by a shadow of
  `#121726` at 6 percent, 0 2 blur 6, each with a face and two lines, and the
  plus. Its copy: «هنوز کسی در شبکهٔ شما نیست», «آدم‌هایی که توی مسیر پیدا کردن
  کار باهاشون سروکار دارید یا می‌شناسیدشون رو اینجا اضافه کنید.», «افزودن به
  شبکه».
- The pictures' colours are unbound: `#f1f5ff`, `#eaf1ff`, `#dce7fd`, `#e3e7ee`,
  `#eef1f5`, white and `#2563eb`.

## The approach

1. Export both pictures as SVG, keep them beside the component as the brand
   mark's is, and put their geometry in `illustrations.json`.
2. Five roles, `picture/disc`, `picture/pale`, `picture/blue`, `picture/edge`
   and `picture/line`, the blues dark fills in dark and the lines lifted by the
   foreground rule; white is `bg/surface`, the blue `bg/brand/default`, the plus
   `text/on-accent`; the shadow `elevation.illustrationCard`.
3. `EmptyPicture` draws either, and the Empty State takes `picture` to draw it
   in the mark's place.
4. The title takes `emptyTitle`, 16 on 25, closing the pixel DESIGN.md recorded
   as missing.
5. Stories for both pictures in light, dark and English; docs; DESIGN.md.

## How it is checked

Its stories, the screens that draw it, the token, theme and dark tests, lint,
tsc, and a look against both frames.
