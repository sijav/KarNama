# KN-479 · The language control shows the flag of its language

Beside the work, per `agent/RALPH.md` step 2b: a new shared component, and the
language control that uses it.

## The card

**Why.** A reader stuck in a language they cannot read looks for a flag, not
for a word written in that language.

**Exit condition.** The language control in the sidebar and in a phone's Page
Header shows the owner's chosen flag for the current language, named for a
screen reader, in both languages and schemes; its story shows both flags.

**The owner, 2026-09-14:** "the language button should have flag next to it",
and on which flags, "just install a package and use the package, you're a
software dev not a politicians, nobody cares as long as you're not biased";
English takes the United States flag. So the flag comes from a package, by the
region of the locale: `fa-IR` the package's `IR`, `en-US` its `US`.

## What is true today

- `LanguageSwitch` is one MUI Button showing the current language's own name,
  «فارسی» or English, and a Menu of both. In the sidebar it is a Nav Item at rest
  whose `paddingInlineStart` of `spacing.sm + iconSize.md + spacing.xs` is empty
  space standing in for the icon column, "since the icon set has no language
  glyph" (DESIGN.md section 5). In a phone's Page Header it is a trailing text
  button.
- The design draws no flag. The owner's instruction adds one, so DESIGN.md
  section 5 records it in the same change.
- `country-flag-icons` 1.6.20, MIT, published 2026-07-01, well past the seven day
  `min-release-age`: ESM, side effects declared for its CSS only, React function
  components per country from `country-flag-icons/react/3x2`, no React peer
  dependency.
- KN-478 turns the language control into an Icon Button whose glyph is the flag,
  and KN-480 puts flags beside each language in a Settings dropdown. Both need
  the same flag.

## The approach

1. Install `country-flag-icons` in `@karnama/web`, pinned exactly, as every other
   dependency there is.
2. A shared component, `LanguageFlag`, in `src/shared/language-flag/`: given a
   locale, it draws that locale's region flag, 3 by 2, `iconSize.md` wide, with a
   hairline of `border/default` so a flag with a white edge still reads on
   `bg/surface`, and `radius.sm`. Decorative unless given an `aria-label`: then
   `aria-hidden` and no `<title>`; with a name, an image with that name, as the
   Icon is. KN-478's icon-only button will pass a name.
3. Only the flags the product's locales use are imported, by name, `IR` and
   `US`, from `country-flag-icons/react/3x2`, into a map typed as a
   `Record<Locale, ...>`: `fa-IR` takes the flag of its region, `IR`, and
   `en-US` takes `US`. Typed over every locale, a locale added without a flag
   fails to compile, rather than drawing nothing at run time, which is stronger
   than the lookup by `Intl.Locale(...).region` this plan first named, and it is
   the shape `i18n/index.ts` already gives its per-locale catalogs,
   `Record<Locale, I18n>`. The production build tree-shakes the other flags,
   checked in the built bundle.
4. `LanguageSwitch`'s sidebar row takes the Nav Item's own layout rather than a
   padding that stands in for an icon: `spacing.sm` at the start, the 20 wide
   flag, `spacing.xs`, then the name, so the name starts exactly where every Nav
   Item's name starts, which a story asserts. In the header the flag leads the
   name; in the Menu it leads each language.
5. Stories first: `LanguageFlag` in Persian and English, decorative and named;
   `LanguageSwitch`'s stories assert the flag in both placements and in the open
   Menu, and the sidebar's label alignment. `Shared/LanguageFlag` joins
   `StoryTitle`, and story docs are written in `en` and `fa`.
6. DESIGN.md section 5 records the owner's decision and the flag's size and
   place, once the flag has been looked at.

## The plan review, and what changed

Codex, plan kind with web search, 2026-09-14, archived at
`%TEMP%/claude-roast/7b02a64757ec/20260914T111756-plan-kn-479-the-language-control-shows-the-flag-of-it-93a0cf.md`.

- **The sidebar's padding is not an icon slot.** Accepted: a flag placed inside
  it would push the name one more column along. Step 4 now builds the row the
  way the Nav Item builds its own and asserts the alignment.
- **The package forwards `aria-hidden`, `style` and `className`, has no React
  peer dependency, and tree-shakes named imports.** Accepted, and the bundle is
  checked anyway. The repository runs Vite 8.2.2, not the 7 this plan named.
- **A decorative SVG takes `aria-hidden` and no `<title>`.** Accepted: step 2.
- **A new story file needs its title in `StoryTitle`.** Accepted: step 5; the
  plan had named the docs and not the registry.

## What I expect to be hard, and what I am unsure about

- **A 3 by 2 flag in a 20 pixel column** is 20 by about 13; whether it sits on
  the text's middle line in both scripts without shifting the name.
- **The header button in capitals** is KN-387, a separate card; the flag must
  not make it worse or hide it.
- **Dark mode** leaves the flag's own colours untouched, which is right for a
  flag; only the hairline follows the scheme.

## How I will know it worked

The new stories and the switch's stories pass; the docs guard and the story
title registry accept the new component; lint and tsc are clean; the production
bundle holds the IR and US flags and not the others; in the browser the sidebar
and a phone's header show «فارسی» with Iran's flag and English with the United
States' flag, in light and dark, with the sidebar's name aligned to the Nav
Items'; the Docs pages read in both languages.

## What building found, 2026-09-14

- **The flag map is typed by locale**, `Record<Locale, typeof IR>`, as step 3
  now says: a locale added without a flag fails `tsc`.
- **Which flag is drawn is proven against the package's own drawing.**
  `LanguageFlag`'s stories render the package's `IR` and `US` apart from the
  canvas and compare the markup, so no story names a flag's colours. The
  switch's stories prove only that its flag follows the current language and
  that the menu's two flags differ; which flag a locale takes is
  `LanguageFlag`'s to prove.
- **The alignment is asserted twice**: in `LanguageSwitch`'s Sidebar story, the
  flag 12 from the row's edge and 20 wide and the name 8 after it, measured on
  the text rather than on its box; and in the Sidebar's Default story, where the
  flag's edge meets the edge of «خروج»'s icon and the two names start at the
  same pixel. The row needed `textAlign: 'start'`: a button centres its text,
  and the name now fills the row.
- **Planted**: the two locales' flags swapped, and the row's `textAlign`
  removed. Exactly four stories failed, Persian, English, the switch's Sidebar
  and the Sidebar's Default, and both files were restored byte for byte.
- **The bundle** holds two of the package's 3 by 2 flags, counted by the
  viewBox every one of them carries.
- **Looked at**, headless at 1440 and 390 against the dev server: the
  sidebar's foot in fa-IR light and dark and en-US light, the open menu, and a
  phone's header in fa-IR light and en-US dark. The flag stands in the icon
  column over «خروج»'s icon, and its hairline shows in both schemes. Two things
  seen are not this card's: the open menu covers its own button, which is how
  MUI anchors a Menu and was so before, noted on KN-478; and a phone's header
  still shows ENGLISH in capitals, KN-387, below the row of text buttons above
  the title that KN-478 removes.
