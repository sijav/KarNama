# KN-257 - The getComputedStyle lingui exemption covers every string, not the pseudo-element selectors it is for

## The card, as re-pointed

A child of KN-011 by its prose, found by KN-248's roast.

**Why.** Every exemption in the lingui config is written to be exactly as wide as its
reason, and this one is wider. Medium: it cannot put untranslated copy on screen by itself.

**Exit, re-pointed 2026-09-15 and corrected after the plan review.** getComputedStyle is
no longer in ignoreFunctions; the three pseudo-element selectors the stories pass,
::before, ::after and ::placeholder, are exempted by one exact pattern with its reason
beside it; lint passes, the stories that pass those selectors among what it reads; and a
committed fixture holding a getComputedStyle call with a literal of copy fails the rule.

**What it said before.** The one selector the stories pass, `'::placeholder'`, exempted by
`'^::placeholder$'`, and "a check" where it now says a committed fixture. The stories pass
three selectors, measured below, and every earlier hole in this rule is held by a fixture
in `src/gate-fixtures`.

## Read before planning, 2026-09-15

- `apps/web/eslint.config.js`'s `ignoreFunctions` holds `'getComputedStyle'`, its comment
  naming `'::placeholder'` and KN-248. A function name skips every literal in every call of
  it, so `getComputedStyle(element, 'Job title')` passes.
- The story files hold 44 selector literals in 19 files, found by the parser: 27
  `'::before'`, 15 `'::after'` and 2 `'::placeholder'`. Linted with ESLint's API against
  the repository's own config, with `getComputedStyle` out of `ignoreFunctions` in memory,
  the workspace gives 42 messages, one on each of those literals except two: Input's lines
  431 and 432, which sit inside an `eslint-disable` block for the rule, KN-214. With
  `'^::(before|after|placeholder)$'` added to `ignore`, it gives none, and
  `'^::placeholder$'` alone would leave 40. Linted over a fixture's path with that pattern,
  a planted `getComputedStyle(element, 'Job title')` is flagged at its literal and
  `getComputedStyle(element, '::placeholder')` is not.
- eslint-plugin-lingui 0.14.0's rule takes five options, read in its source: `ignore`,
  matched against a string's value; `ignoreNames`, a property or attribute name;
  `ignoreFunctions` and `ignoreMethodsOnTypes`, which exempt a whole call, the second only
  a member call on a named type; and `useTsTypes`, which skips a literal whose contextual
  type is a string-literal type or a union of them. `getComputedStyle`'s second parameter
  is `string | null`. Without editing the calls, a value in `ignore` is the only exemption
  narrower than the whole call.
- The rule tests an `ignore` entry against every string it reads, KN-215, so the pattern
  lets those three exact values through in any file. They are CSS pseudo-element names,
  never copy, so the entry is as wide as its reason.
- `src/gate-fixtures` holds a fixture for each hole this rule has had. `KN-003.mjs` lints
  every `unlocalized*.tsx` there with `--no-ignore`, requires the known ones by name, and
  refuses one that passes or that fails on anything but lingui's rule; since KN-215 it
  holds a fixture of several holes to its number of reports through `REPORTS`.
- `lingui-ignore.test.ts` reads every `ignore` entry out of the config and checks that none
  lets copy, the Latin-1 letters or the story-docs section names through, so it checks the
  new entry with no change. That the entry lets the selectors through is shown by
  `npm run lint` itself, which the story files fail without it.

## The approach

1. **`getComputedStyle` leaves `ignoreFunctions`**, with a comment in its place saying why
   it went, as the file does for `setAttribute`. **`ignore` gains
   `'^::(before|after|placeholder)$'`**, its comment saying these are the pseudo-elements a
   story reads a computed style of, selectors the browser resolves and never copy, named in
   full because an entry is tested against every string.
2. **A fixture, `src/gate-fixtures/unlocalized-computed-style.tsx`**, holding one
   `getComputedStyle` call with a literal of copy and nothing else the rule reads, so its
   failure can only be that literal.
3. **`KN-003.mjs` requires it by name.** Its check already refuses a fixture that passes
   or that fails on anything but lingui's rule, which is all one literal needs. The
   fixtures' README names it.

## File by file

- `apps/web/eslint.config.js`
- `apps/web/src/gate-fixtures/unlocalized-computed-style.tsx` and `README.md`
- `agent/scripts/verify/KN-003.mjs`

## Plan review, 2026-09-15, Codex gpt-5.6-terra

It agreed that no option of the plugin is narrower without editing the calls, that the
value entry is bounded to the three tokens, and that `lingui-ignore.test.ts` needs no
change. Two corrections, both taken:

- **The counts did not add up.** The plan said 42 literals and gave 27, 15 and 2, which
  make 44. It had taken the 42 reports for 42 literals, and ripgrep's count seemed to
  agree, but that counts matching lines, and FilterChip's line 51 and Input's line 448
  each hold two. Measured again by the parser against the reports: 44 literals and 42
  reports, the two without one inside Input's `eslint-disable` block, which already
  exempts them. The card said 42 as well and is corrected. Nothing in the design changes.
- **A count of one report from a fixture of four calls cannot say which call failed.**
  Rather than have `KN-003.mjs` read the report's line, the fixture holds only the literal
  of copy, so its one failure can only be that; that the three selectors still pass is
  shown by `npm run lint` over the stories, which fail without the entry. The exit is
  corrected to say so, and `REPORTS` stays as it is.

## What I expect to be hard, and what I am unsure of

- **A value exemption again**, the shape KN-215 removed for the section names. The
  difference is in the values: three CSS pseudo-element names that are never copy, where
  `props` and `stories` are words that can be.
- **`eslint.config.js` and `KN-003.mjs` carry formatting drift at HEAD**, 5 and 7 lines,
  which they keep.

## How I will know it works

- `npx eslint --no-ignore src/gate-fixtures/unlocalized-computed-style.tsx` exits 1 with
  exactly one report, lingui's, on the literal of copy.
- Linted with ESLint's API, the fixture gives no report with `getComputedStyle` put back in
  `ignoreFunctions` in memory, and the story files give 42 with the selector entry taken
  out.
- `KN-003.mjs`'s fixture check, its own code run without the slower checks around it,
  passes on the tree.
- `npm run lint` and `npm run lint:tsc` clean, and the unit project passes.
- Nothing a reader sees changes.

## Result, 2026-09-15

- `npx eslint --no-ignore src/gate-fixtures/unlocalized-computed-style.tsx` exits 1 with
  one report, lingui's, at 5:84, on the literal of copy.
- Through ESLint's API, the fixture gives no report with `getComputedStyle` put back in
  `ignoreFunctions` in memory, and the story files give 42 lingui reports in 19 files and
  nothing else with the selector entry taken out.
- `KN-003.mjs`'s fixture check, its code copied without the slower checks around it,
  passes with the new fixture required by name.
- `npm run lint` and `npm run lint:tsc` clean. The unit project passes 1489 of 1489 in 43
  files, and `lingui-ignore.test.ts`, run by name, 6 of 6 with no change.
- `eslint.config.js` and `KN-003.mjs` keep their 5 and 7 lines of formatting drift from
  HEAD; the plan, the fixture and the README pass Prettier.
- Nothing rendered changed, so nothing was looked at in a browser, in either language or
  scheme.
- `AGENTS.md` section 7 gains a line: ripgrep's count mode counts matching lines, and a
  breakdown is summed before its total is written.
