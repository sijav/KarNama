# KN-796 · The sidebar was redrawn, with My stats among its destinations

**Why**, from the board: the owner's instruction of 2026-11-03 is that
everything matches the redesign, and every desktop screen of the redesign is
framed by it.

**Exit**, from the board: the plan lists every difference between 185:11 in the
copy EITM6CbJY33dMY8IsMFR4R and in the original; the component and its stories
then draw the original's version of every variant, each new variant with a story
of its own, in fa-IR and en-US, light and dark, with both story-docs entries;
sizes, gaps, radii and colours resolve through the tokens; `DESIGN.md`'s section
is corrected; lint, tsc and its tests pass. The stats destination opens the
Stats page's route.

## Every difference, read 2026-11-04

Every node of `185:11` was read with use_figma in both files: its type, size,
layout, bound variables, fills, strokes and text. It is one component in both,
with no variants, and differs in two places.

- **The Brand Row's mark**, in `406:451`: the copy draws Brand Mark `406:452`, a
  32 square at radius md in `bg/brand/default` holding «ک» at 16 and SemiBold in
  `text/on-accent`; the original draws Logo / Mark `576:7668`, the leaf of
  `576:7665`. KN-742 drew it already, and `DESIGN.md` still describes the old
  square.
- **The second destination**: the copy's `185:8` is «افزودن فرصت شغلی» with the
  `plus`; the original's `714:28992` is «آمار من» with the `chart`. The other
  two, «فرصت‌های شغلی من» with `file`, Active, and «شبکه من» with `user`, are as
  they were.
- **The rest is the same**: 240 by 720, 24 above and below and 16 at the sides,
  8 between, `bg/surface` with one pixel of `border/default` on the edge facing
  the page; the User Row, the divider, the spacer, «فضای کار» in
  `text/disabled`, the Grow Spacer and the «خروج» Nav Item with `log-out` at the
  foot. The description still says three destinations including add.

## The language switch and the foot

The original's foot is the copy's: the Grow Spacer, then «خروج». It draws no
language switch and no settings, as the copy did not. `DESIGN.md` section 5 and
the owner's rule of 2026-09-14, KN-478, put the language, settings and signing
out as Icon Buttons in a row at the sidebar's foot, in place of that «خروج» row.
The redesign changed nothing there, so the switch keeps that place and there is
nothing to ask the owner. The KN-777 note's tooltip change is a card of its own,
KN-848, since taking the describe tips off would drop the descriptions a screen
reader hears now.

## The approach

1. The addresses gain `stats`. The build writes `/stats` beside `/jobs`, `/add`
   and `/network`, and the old hash addresses keep reading as before.
2. The sidebar draws the original's three: the board, the Stats page with the
   `chart` and «آمار من», and the network page. Adding leaves the sidebar. On a
   desktop the board's header button opens it, and `/add` still opens it over
   the board.
3. The tab bar keeps the copy's three, the board, adding and the network page,
   until Tab Bar v2, KN-783, draws the sidebar's and moves adding into a phone's
   page header. Changing both now would leave a phone with no way to add a job
   opportunity.
4. `/stats` opens `StatsScreen`: the Header band with the Page Header «آمار من»
   and nothing under it until KN-823 builds the page.
5. Stories: the sidebar's stories walk the new three and open the Stats page;
   the App's story goes there from the sidebar; the e2e address specs reach the
   add flow from the board's own button where the sidebar's item was.

## How it is checked

The sidebar's, the tab bar's, the navigation's, StatsScreen's and the App's
stories; a planted wrong destination must fail them. Also `routes.test.ts`, the
unit suites with the docs guard, the e2e address specs against the build, lint,
tsc, and a look against the frame.
