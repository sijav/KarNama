# KN-366 · The lingui gate's no-letter class still exempts three letters: ª, µ and º

Beside the gate fixtures. Recorded after the fix, on 2026-09-11, under the
owner's rules of that day.

**Exit condition, from the board.** The class leaves out ª, µ and º,
lingui-ignore.test.ts asserts each is checked, and a reason says whether the
plugin's own no-letter pattern makes the entry unnecessary.

## What was done

- The reason first, since it decided the rest: eslint-plugin-lingui 0.14 opens
  its whitelist with `/^[^\p{L}]+$/u`, flag included, and drops a blank string
  before any whitelist, so a string with no letter in any script was never the
  config's to exempt. The class was unnecessary, and the only thing it added
  was the three letters. It is gone, and the comment where it stood says why.
- lingui-ignore.test.ts reads that pattern out of the rule as installed and
  compiles it with its flag: it passes the strings with no letter and rejects
  the copy and «1ª», «5µ» and «º»; no entry left in the config passes them
  either. If the plugin ever changes its pattern, the read fails first.
- `unlocalized-latin-1-letters.tsx` puts the three in a `title`, an
  `aria-label` and text. The real rule reports three errors on it; under the old
  config, none. The first draft used «µs», which the old config flagged for its
  `s`, so it isolated nothing; «5µ» does.
- The whole workspace lints clean without the entry.
