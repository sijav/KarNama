# KN-574 - The navigation, language and token stories offer controls that break their plays

## The card

Found by KN-255's measurement, 2026-09-15, on a production Storybook of 83877dc.

**Why.** A reviewer who changes the placement, the current page, a label or a
token family in Controls and presses Rerun sees the story fail when the component
is not broken, so the Interactions panel's ticks stop describing the story on
screen, as in KN-247 and KN-255.

**Exit.** Every story with a play function in the LanguageSwitch, LanguageFlag,
Sidebar, NavItem, TabBar, Icon and Tokens story files reads its expectations from
the active args or offers only the controls its assertions hold for; KN-247's
sweep over every story, each offered control changed by its type, finds none of
them broken; and those stories pass under Vitest.

## Measured again before planning, 2026-09-15

`node agent/scripts/storybook/controls-sweep.mjs` over the seven files, on a
production Storybook of 018cb2d: 32 stories, 30 with a play, **18 broken** by a
control they offer, none failing with nothing changed. The card's list holds
exactly. What the sweep cannot try: Icon's colours other than `inherit`, since
every semantic role holds a slash and Storybook's URL args refuse one. Icon's
Default and Coloured each assert one role, so they break under the others too, by
reading.

What breaks them, by kind:

- **A play that asserts a fixed value its control changes, where the play can read
  the arg instead.** TabBar's and the Sidebar's Default assert the board current
  under `current`; the four LanguageSwitch Open stories take the menu's side from
  their own names under `placement`; LanguageFlag's Persian and English compare the
  drawing with one flag under `locale`; NavItem's Default asserts `text/secondary`
  under `active`; Icon's Default and Coloured assert one colour under `color`, and
  Coloured reads a stroke that `more`, whose three dots are filled, does not have;
  the Sidebar's Default and InEnglish assert the fixture's number under
  `userPhone`; LanguageFlag's Named asserts the English name under `aria-label`.
- **An empty text found by text.** NavItem's Default under `label` and the
  Sidebar's Default under `userName`: `getByText('')` matches every element.
- **A play about the state its control changes.** Tokens' Semantic, Status and
  Type under `family`; NavItem's Active under `active`; the Sidebar's NetworkCurrent
  under `current`; LanguageFlag's Persian and English and Icon's Default under
  `aria-label`, which turns the decorative drawing into a named image, the case
  Named is for.

**Read for the plan.** The Sidebar draws its user row whenever `userName` is
given, the name in its own span and the phone as `formatPhone(locale, userPhone)`,
which groups a mobile number in the reader's digits and otherwise keeps the text
with its digits localized, `x7` becoming `x۷`. NavItem's label is a span after its
icon, there for an empty label too. The Docs page renders every prop's prose itself,
`story-docs/DocsPage.tsx`, so a first story's `include`, which trims its Controls
table, loses no description; `disable` trims nothing, KN-571.

## The approach

KN-571's rule: a control a story offers holds for its play and changes the canvas.

1. **Read the args where the play can.**
   - TabBar's Default: the tab at `args.current`'s place among the three is current
     in `text/brand` and the others `text/secondary`; pressing «افزودن فرصت شغلی»
     still calls `onNavigate` with `add`.
   - The Sidebar's Default: the current item from `args.current`; the name found by
     `args.userName` and the phone by `formatPhone('fa-IR', args.userPhone)`, the
     function the Sidebar draws it with, each when not empty, since an empty one
     draws nothing to find by text. InEnglish finds the phone the same way in en-US.
   - LanguageSwitch: `menuOpens` takes the menu's side from `args.placement`, above
     and from the start for the sidebar, below and from the end for the header; the
     four stories keep their own placements.
   - LanguageFlag: Persian and English compare the drawing with `args.locale`'s
     flag; Named finds the image by `args['aria-label']`, which an empty name finds
     too.
   - NavItem's Default: its colour and `aria-current` from `args.active`, and the
     label's span taken after the icon rather than by its text.
   - Icon's Default and Coloured: the colour expected from `args.color`, `inherit`
     included; Coloured compares the colour with the paint its first shape uses, its
     fill where the shape is filled, as `more`'s are.
2. **Offer only what holds and shows.**
   - Tokens: Semantic, Status and Type disable their panel, each being about its
     family; Spacing and Radius have no play.
   - Icon: Default and Coloured offer `name`, `size` and `color`, not `aria-label`,
     which is Named's.
   - LanguageFlag: Persian and English offer `locale`; Named keeps both.
   - NavItem: Active and Hover offer `icon` and `label`, `active` being their point;
     Hover's assertions run only in the runner.
   - The Sidebar: NetworkCurrent offers `userName` and `userPhone`; WithoutUser
     offers `current`, since its render passes no user.
3. **The Docs pages keep what holds.** TabBar's, NavItem's and the Sidebar's
   Defaults keep all their controls; LanguageSwitch's Sidebar keeps `placement`;
   LanguageFlag's Persian keeps `locale`; Icon's Default keeps `name`, `size` and
   `color`; Tokens' Semantic, disabled, keeps `family` in the table.

**File by file**: the seven story files. No story is added or renamed, so the docs
do not change.

## How I will know it works

- The sweep over the seven files finds none broken, untried or unapplied, and its
  JSON shows each control a story still offers was tried. The same sweep found 18
  before.
- Icon's roles the sweep cannot type, planted once through the stories' own args
  and put back by hash: Default under `text/brand` and Coloured under `text/primary`
  pass, where the code before this change fails them.
- The seven files under Vitest; the unit project; eslint and tsc.
- The seven Docs pages read in fa-IR and en-US, their Controls tables as planned, and
  the Sidebar's page seen in both languages, light and dark.

## What I expect to be hard, and what I am unsure of

- **An empty name or phone on the Sidebar's Default draws an empty line** the play
  does not measure; the non-empty values it reads from the args are what the sweep
  tries with `x7`.
- **Hover's controls are chosen by reading its runner branch**, which the production
  sweep never reaches.
- **The Sidebar's Default keeping `userName` and `userPhone`** rests on `getByText`
  finding a value the rest of the sidebar does not also print, which holds for `x7`
  and for the fixture's name, and not for a name typed as «کارنما».

## Plan review, Codex gpt-5.6-terra, 2026-09-15

Approved, with one correction, taken. The approach is the simplest honest one: plays
read the arg where their assertion does not depend on it, and a control is left out
only where the play is about that state; disabling the three Tokens stories is right.

1. **Scope the Sidebar's name to the user row.** `getByText(args.userName)` over the
   whole sidebar fails, ambiguously, on a name the sidebar also prints. Taken: the
   Default and InEnglish plays find the name and the phone inside the User Row, the
   aside's second child after the Brand Row, as 406:451 and 406:457 draw them, and the
   unsure point above no longer stands.
2. **The phone formatter must take the active locale.** It does: Default pins fa-IR
   and InEnglish en-US, and a story's pinned globals lock the toolbar, so the locale
   each passes to `formatPhone` is the one on screen.

It confirmed that NavItem's label, the icon's next sibling, holds for an empty label;
that a select control with no `mapping` hands `text/brand` to the arg as it is, so a
run with the stories' args proves what a reviewer's choice does, while the sweep's
URL args cannot carry a slash; and that the likeliest mistake is Coloured assuming a
stroke, which the plan's fill or stroke already handles.

## Result, 2026-09-15

Built as planned after the review, with one lint correction.

- **Read from the args.** TabBar's Default reads `current`; the Sidebar's Default
  reads `current` and finds the name and the formatted phone in its User Row, and
  InEnglish the phone the same way; the four LanguageSwitch Open stories take the
  menu's side from `placement`; LanguageFlag's Persian and English compare the
  drawing with `locale`'s flag, and Named finds its image by `aria-label`; NavItem's
  Default reads `active` and takes the label's span after the icon; Icon's Default and
  Coloured expect `color`, `inherit` included, and Coloured compares a shape's fill or
  stroke.
- **Left out where the play is about it.** Tokens' Semantic, Status and Type disable
  their panel; Icon's Default and Coloured and LanguageFlag's Persian and English leave
  out `aria-label`; NavItem's Active and Hover leave out `active`; the Sidebar's
  NetworkCurrent leaves out `current`, and WithoutUser offers only `current`.
- **Lint** refused `args.current ?? BOARD` in TabBar's and the Sidebar's stories: the
  meta gives `current`, so the fallback and the constant it named went.

**Checks.**

- The sweep over the seven files on a fresh production build of the final tree: 32
  stories, 30 with a play, none broken, untried or unapplied, no JSON control for an
  element, none failing with nothing changed; the same sweep found 18 before. Icon's
  `color` offers 25 roles, of which the sweep types only `inherit`, since every other
  holds a slash its URL args refuse, and it counts the rest neither tried nor untried.
- Icon's other roles, planted through the stories' own args, `text/brand` on Default
  and `text/primary` on Coloured, and put back by hash: the committed stories fail
  both, and the changed ones pass all five.
- The seven files under Vitest, 32 of 32, and TabBar's and the Sidebar's again after
  the lint fix, 7 of 7; the unit project, 1459 of 1459, before that fix and after it;
  eslint on the seven files and tsc clean; the formatter at HEAD's drift, 17 lines in
  Icon's stories and 10 in Tokens', none elsewhere.
- The seven Docs pages in the dev Storybook, their Controls tables: TabBar's
  `current`; NavItem's `icon`, `label` and `active`; LanguageSwitch's `placement`;
  LanguageFlag's `locale`; Icon's `name`, `size` and `color`; Tokens' `family`, though
  Semantic's panel is disabled; and the Sidebar's `current`, `userName` and
  `userPhone`. The Sidebar's page in fa-IR and en-US, light and dark, its prose in the
  toolbar's language.
