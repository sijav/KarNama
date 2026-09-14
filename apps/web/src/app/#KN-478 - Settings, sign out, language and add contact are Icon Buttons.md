# KN-478 · Settings, sign out, language and add contact are Icon Buttons

Beside the work in `src/app/`, since the shell is where these controls are put
together, per `agent/RALPH.md` step 2b. Most of the change is in the shared
components the shell composes.

## The card

**Why.** The owner asked for it; the text buttons Codex put in a row above each
page push every title below where its frame draws it ("button at top right
title at below is very wrong").

**Exit condition.** At 390 and 1440, in fa-IR and en-US, light and dark:
settings, sign out, language and add contact are Icon Buttons each with a
Tooltip and a name; nothing sits in a row above a page's title; a phone reader
can open settings and sign out; each control's story shows it.

**The owner, 2026-09-14:** "settings, signout, language, add contact, all needs
to be a icon button!", "setting doesn't exists in figma neither sign out so codex
had to invent, you should do that too but as an ICON! you know better how to do
it", and "it should look like the figma!".

## What is true today

- `App.tsx` puts a row above every page: `SettingsControl`, a text Button, and
  below md a text Button «خروج». That row is what pushes each title down.
- The sidebar's foot, `185:11`, holds `LanguageSwitch` as a Nav Item row with its
  flag (KN-479) and «خروج» as a Nav Item with `log-out`. The file draws «خروج»
  there, as a Nav Item; the language row is the build's.
- `PageHeader`, `155:56`, draws the title at the inline start and its action at
  the inline end, and below md adds `LanguageSwitch` as a text button after the
  action. On a phone the board's header has no action, `JobsScreen` leaves it
  out, so the title has the row to itself but for the switch.
- The network's header action is a Button «افزودن مخاطب», as `252:2` and `252:411`
  draw it, Button M.
- The Icon Button, `460:672`, is a 32 square round a 16 icon, Neutral and Danger,
  Default, Hover and Disabled; `IconButton` takes `icon` as a name from the set
  only. `Tooltip` describes its trigger and needs the trigger to forward its
  props, which `IconButton` does.
- The icon set is the file's thirty, pinned by `glyphs.test.ts` to DESIGN.md's
  list; it has `log-out` and `user-plus` and no settings glyph. The thirty are
  Lucide's shapes redrawn in the file's grid, not only by name: the file's
  `log-out` is Lucide 1.41.0's `log-out` point for point, its arcs written as
  curves in absolute coordinates.
- `glyphs.test.ts` requires every number in a glyph's path to lie inside the 24
  grid, so a path with relative commands, whose deltas go negative, fails it.
  Lucide's `settings` is written with relative arcs, `a2.34 2.34 0 0 1-2.33
  4.033`, and a `circle`.
- `AppProviders`, which every story renders, carries the auth, records and
  preferences providers, so a control reading them works in any story.
- KN-418 is the phone's missing sign out, and the owner settled it into this
  card; `sign-in.spec.ts` skips signing out on the phone twice.

## The approach

1. **`IconButton` takes a drawn element as its icon**, as well as a name: a
   name draws the set's glyph as now; an element, a language's flag, is drawn in
   its place, decorative, the button's `aria-label` naming it. Additive: every
   current use passes a name.
2. **A settings glyph, the owner's addition, from Lucide.** The file has none,
   and the set is Lucide's, so `settings` comes from `lucide-static` 1.41.0,
   ISC, published 2026-09-04 and past the seven day age, its geometry copied into
   `glyphs.json` in the file's form: stroke paths in absolute coordinates inside
   the 24 grid, each relative arc rewritten as an absolute one by a one-off
   conversion whose output is checked against Lucide's own drawing, and its
   circle written as two arcs, with its source named in `glyphs.ts`. DESIGN.md keeps the file's
   thirty in their sentence and names the owner's additions in one of their own;
   `glyphs.test.ts` reads both and asserts the set is the thirty and then the
   additions.
3. **`LanguageSwitch` becomes an Icon Button** whose icon is the current
   language's flag, named «زبان» or Language, its Tooltip the current language's
   own name, so a reader who cannot read the interface still finds theirs. It
   opens the same menu of languages and flags, which no longer covers its
   button: from the sidebar's foot it opens above the button, from the Page
   Header below it, hanging from the button's inline end, the Menu's way.
4. **`SettingsControl` becomes an Icon Button**, `settings`, named «تنظیمات» or
   Settings with a Tooltip saying so, opening the same Settings dialog.
5. **Sign out is an Icon Button**, `log-out`, named «خروج» or Sign out with its
   Tooltip. The sidebar keeps taking `onSignOut`; `PageHeader` takes an optional
   `onSignOut` too, which the screens pass on from `App`.
6. **Where they go**, chrome the design already has, as the card says:
   - Desktop, the sidebar's foot: one row of the three, language, settings and
     sign out, 12 apart as the compact Contact Card sets its Icon Buttons, the
     first centred on the Nav Items' icon column. It replaces the language row
     and the «خروج» Nav Item, the owner's instruction over the drawn row.
   - A phone, the Page Header: the same three after the page's action, below md.
     On the board, which has no action on a phone, the three and their gaps are
     120 of the 358 beside a title of about 150.
   - The network's add contact: an Icon Button, `user-plus`, in the Page
     Header's action slot at every width, with its Tooltip. The Empty State keeps
     its drawn Primary button.
   - `App.tsx` loses the row above the title.
7. **Stories first.** `IconButton` draws a flag; `LanguageSwitch` is the flag
   button with its Tooltip and name, and its menu opens clear of it in both
   placements; `SettingsControl` gets a story and a docs page; the Sidebar's foot
   is measured as a row of three at 24 from the bottom; the Page Header shows the
   three below md and none above; `App`'s phone story switches language through
   «زبان» and signs out through «خروج». Docs in `en` and `fa`.
8. **The e2e specs** press «زبان» instead of «فارسی», and `sign-in.spec.ts` signs
   out on a phone too, its skips gone, which is KN-418's exit.
9. **DESIGN.md** section 5 records the four Icon Buttons and where they sit,
   section 1's navigation paragraph the new foot, and the icon list the
   addition.

## What I expect to be hard, and what I am unsure about

- **A Tooltip that repeats the name** makes a screen reader hear it twice, since
  the tip is the trigger's description; KN-457 settled that a tip explains
  rather than names. So each tip says something the name does not: the language
  button's is the current language's own name; settings' says what is in it,
  the language, the theme and sample data; sign out's that it leaves this
  account on this device; add contact's that it adds a person to the network.
  None takes a placeholder, since the catalogs are not compiled, KN-221. The new
  strings go into both catalogs.
- **A Tooltip over a button that opens a menu**: the tip must close as the menu
  takes focus, and must not describe the menu's items.
- **Lucide's settings glyph at 16** may read heavy beside the file's thinner
  shapes; it will be looked at beside `log-out` and `user-plus`.
- **Replacing the drawn «خروج» Nav Item** departs from `185:11`. The owner's
  instruction names sign out, and "it should look like the figma" argues for the
  row; I follow the instruction and record it in DESIGN.md, so it can be argued
  with.
- **Two «افزودن مخاطب» buttons** on an empty network page, the header's icon and
  the Empty State's button: tests that find the button by name must say which.

## The plan review, and what changed

Codex, plan kind with web search, 2026-09-14, archived at
`%TEMP%/claude-roast/2b1874631dd1/20260914T122203-plan-kn-478-settings-sign-out-language-and-add-contac-370ba8.md`.
It found the placements the best available fit and the plan not overbuilt.

- **A phone's header is 342 wide, not 358**: the shell keeps 24 at each side.
  The board's three controls leave about 210 for the title and the network's
  four about 166. Accepted: the shell's phone story asserts in both languages
  that the title is not cut, rather than trusting the estimate.
- **MUI's Menu does not open above its button or hang from an inline side by
  itself.** Accepted: the language menu takes explicit origins, above the button
  and from its inline start in the sidebar, below it and from its inline end in
  the header, each worked out for the direction, as `theme/sides.ts` does for
  the Menu, and the stories measure the menu against the button in both
  directions. It also opens instantly, as every menu does.
- **Keep the Icon Button's select control to the set's names**, and show the flag
  in a story of its own. Accepted. The element is wrapped in a hidden span by the
  Icon Button itself, so a caller's element can never add a second name.
- **Do not install `lucide-static` for one path**, and naming the source is not
  enough for the ISC licence, which asks for its notice to travel with the copy.
  Accepted: the glyph goes into `glyphs.json`, and Lucide's licence sits beside
  it in full. The conversion to absolute arcs was drawn beside Lucide's own at
  240: 11 of 57,600 pixels differ, by at most 5 of 255.
- Because the controls now live in two places, the sidebar's foot and a phone's
  header, they are one small component, `ShellControls`, with its own story, so
  the names, tips and order cannot drift between the two.

## What building found, 2026-09-14

- **`SettingsControl` takes no props, so react-docgen reports no component**, and
  the docs guard refused a meta that named one. Its stories render it without
  `component`, as the network page's do.
- **A callback prop needs its `fn()`**: `JobsScreen`'s new `onSignOut` joined its
  meta's args, as the guard asks.
- **The lingui rule reads `i18n._()` only on an instance named `i18n`**:
  `i18nFor(locale)._('Language')` inside an assertion was flagged, and is now
  held in an `i18n` first.
- **Prettier**: six of the files touched were unformatted at HEAD as well, so
  none was rewritten whole; the new files are formatted.
- **Planted**: the flag's hidden wrapper removed, the language menu's side
  flipped, the sidebar row's inset changed, the controls' gap narrowed, and the
  header's controls taken out. Exactly the eleven stories that measure those
  failed, and all five files were restored byte for byte.
- **Two stories failed in the full run and are not this card's**: the Icon
  Button's and the Nav Item's `Hover`, which pass run alone, KN-365's parallel
  pointer; and the board's `Adding`, which waits on the live API, KN-495.

## How I will know it worked

The stories of IconButton, LanguageSwitch, SettingsControl, Sidebar, PageHeader,
NetworkScreen and App pass; the docs guard and the glyph test pass; lint and tsc
are clean; e2e shell, sign-in, settings, network, layout-overflow and drag-cards
pass on desktop and phone with the phone's sign-out skips gone; a planted failure
is caught; and I look at the sidebar's foot and a phone's header on the board and
the network, in fa-IR and en-US, light and dark.
