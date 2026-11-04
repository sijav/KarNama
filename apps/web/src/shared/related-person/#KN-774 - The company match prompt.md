# KN-774 · The company match prompt, Company Match 1096:3111

**Why**, from the board: components before screens; the redesigned job
modal's related people tab composes it, and cannot be built to the design
until it exists.

**Exit**, from the board: a story per variant of 1096:3111 renders it in fa-IR
and en-US, light and dark, with both story-docs entries; every size, gap,
radius and colour resolves through the tokens and matches `get_design_context`
on 1096:3111; `DESIGN.md` names the node, its states and its rules; lint, tsc
and its tests pass.

## What the file draws, read 2026-11-04

- **Company Match**, 1096:3111, one component with no variants: a column 672
  wide that hugs its height, 88, `color/bg/brand/container` at `radius/md`,
  `spacing/sm` above and below, `spacing/md` at the sides and `spacing/xs`
  between its rows, its items at the inline start.
- Its Title Row, `spacing/xs` apart: the Icon set's `user-plus` at 16, its
  stroke `color/text/brand`, at the inline start, then «۱ نفر از دیجی‌کالا در
  شبکهٔ شماست» in Label, `color/text/brand`.
- Its Person, filling the width, 40 tall: the name in Title,
  `color/text/primary`, over «سمت · شرکت» in Label, `color/text/secondary`, at
  the inline start; a spacer that grows; and at the inline end an instance of
  Button / S, Style=Secondary, «وصل کردن», with no icons, whose fill the
  instance sets to `color/bg/surface`.
- Its description: at the top of the related people tab, someone from this job
  opportunity's company is in the reader's network but not linked; Connect
  adds them to the list and the box goes; with nobody, there is no box. The
  handoff says the same.
- One instance, 1096:92316, in Job Modal 211:2's Contacts tab, the Body's
  first child, filling its 720 less 24 at each side.

## The approach

1. The Button takes `surface`, which fills a style with no fill at rest with
   `bg/surface` on a coloured ground, as this instance does; its hover and
   pressed fills stay its own. A story and both docs entries for it.
2. `CompanyMatch` in `shared/related-person`, beside the row it adds to: the
   job opportunity's company, the people from it who are in the network and not
   linked, and `onConnect` with the person's id. It fills its container's
   width, as the instance does, and draws nothing for nobody.
3. The title counts the people in the reader's digits and plural, from catalog
   halves as the Bulk Action Bar's count does; Persian keeps «نفر» singular
   after a number. The file draws one person; several are one row each,
   `spacing/xs` apart, as the column spaces its rows.
4. Each person is a group named by them, so Connect is heard with whose it is.
   The file's spacer has no least width; the code keeps `spacing/sm` between the
   person and Connect, which moves nothing at the file's lengths and cuts a long
   name before it reaches the button. The icon sits at the top of the title,
   the same as centred on one line, so it stays on the first line when a long
   company wraps.
5. Stories: the file's measure, Connect, several people, nobody, a long name,
   English and dark.

## How it is checked

Its stories and the Button's, lint, tsc, the unit suites, and a look in both
schemes.
