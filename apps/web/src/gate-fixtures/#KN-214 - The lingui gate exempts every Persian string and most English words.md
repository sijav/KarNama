# KN-214 · The lingui gate exempts every Persian string and most English words

Beside the gate's fixtures. Recorded after the fix, on 2026-09-11, under the
owner's rules of that day.

**Exit condition, from the board.** The no-letter entry is replaced by one that
works WITHOUT flags and fails closed; 'Delete', 'Save', 'مصاحبه' and
'حذف وضعیت' each fail the lint in a committed fixture, as aria-label, as title
and as JSX text, and the existing fixtures fail only on the string under test;
every flagged string is localised or exempted by a named, scoped rule with a
reason; a check compiles each ignore entry as the plugin does and fails if any
whitelists copy.

## What was done

- The entry is `^[\s0-9٠-٩۰-۹…]*$`, digits in three
  scripts, whitespace, punctuation and symbols, Persian's own included, written
  with only `\s` and `\uXXXX` escapes, which mean the same with no flags. A
  letter in any script falls outside it.
- The rule then flagged 622 strings, not the card's 82: everything written
  since had leaned on the bug. Each was answered by class in
  `eslint.config.js`, each with its reason: names whose values are identifiers
  (Storybook's globals, controls and layout, sizes and placements, link
  targets, ARIA tokens, SVG and Intl options, the class-name constants, a
  status's token, a person's name), and calls whose arguments are not copy
  (the rest of testing-library's queries and matchers, the DOM's lookups and
  attributes, the typing a test does). The rest changed in the code: typed
  constants, the Job Modal's tabs built from its list, one helper for the
  popovers' inline end, the Tooltip story's copy from the catalog, and scoped
  disables with their reasons for the language names, KN-115, the health
  reason, KN-130, element ids and file globs.
- Four fixtures, one per word, each failing three times; the six older ones
  lost their letter children, so each fails on its string alone.
- `src/i18n/lingui-ignore.test.ts` reads the entries out of the config,
  compiles them with no flags, finds no copy whitelisted, and shows the old
  entry would have passed it. The owner's rule of 2026-09-11 dropped the
  mutation proof the exit condition names; the test's own positive control
  stands in its place.
- Found on the way, filed: KN-365, pointer-driven stories colliding when story
  files run in parallel.
