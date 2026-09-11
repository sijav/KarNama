# KN-351 · The Contact Card's name and the Status Picker's New status draw in the browser's button font, not Vazirmatn

Beside the theme. Recorded after the fix, on 2026-09-11, under the owner's
rules of that day.

**Exit condition, from the board.** The Contact Card's name and the Status
Picker's New status render in the page's font, a story on each compares the
button's computed font family with its host's, and either the theme gives every
ButtonBase the page's font or DESIGN.md says each text button must.

## What was done

- The theme's `components.MuiButtonBase.styleOverrides.root` sets `fontFamily`
  to the product's family, the token itself rather than `'inherit'`, so every
  ButtonBase draws in Vazirmatn whoever builds it; before, a raw ButtonBase with
  text took the browser's own button font, Arial in Chromium. The components
  that already set `fontFamily: 'inherit'` keep it; it is now redundant on
  ButtonBase and still needed on a native `<button>` outside it.
- The Contact Card's Full story and the Status Picker's Default compare the
  button's computed font family with its host's; both read Arial and failed
  before the override.
- The whole storybook project with the override: 260 of 261; the one failure,
  NavItem Hover, is KN-365's transition flake, which passes alone. KN-365 is
  raised to high with its exit corrected to that cause.
