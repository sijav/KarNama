# KN-215 - The props and stories value exemption is global, so aria-label="stories" passes

## The card

A child of KN-094, found by its roast.

**Why.** It is the same scope bug KN-087, KN-094 and KN-095 each closed a different
instance of: an exemption written for one comparison that quietly applies to the whole
codebase. The words themselves are unlikely copy, which is why it is medium rather than
high, but a fourth instance left open after three were closed is the pattern continuing.

**Exit**, as corrected after the plan review below. aria-label="stories" and
title="props" each fail the lingui rule npm run lint runs, in a committed fixture
linted with --no-ignore, since the ordinary run ignores the fixtures; the story-docs
parser still recognises both headings; and the ignore array no longer names them.

## Read before planning, 2026-09-15

- `apps/web/eslint.config.js` line 103 holds `'^(props|stories)$'` in
  `linguiOptions.ignore`. The plugin compiles each entry with `new RegExp(entry)` and
  tests it against every string it checks, attribute values and JSX text included, so
  the entry lets `stories` and `props` through wherever they are written, in every file
  the lingui block lints. The comment above it says it exempts the parser's comparison
  and not every occurrence of the words; it exempts every occurrence.
- A comparison needs no entry: the plugin passes a literal on either side of `===`
  before any whitelist. What needs it is `sectionOf` in
  `src/shared/story-docs/parse.ts`, lines 57 and 58, `return 'props'` and
  `return 'stories'`.
- Measured with ESLint's API against the repository's own config, the entry filtered
  out in memory, `kn215-probe.mjs` in the scratchpad: `parse.ts` fails the rule at 57:32
  and 58:34, the two returned literals. `useTsTypes` does not exempt them, since a
  returned literal's contextual type is the function's return type, `Section | null`,
  and the plugin accepts only a union made wholly of string literals. With `sectionOf`
  returning `name === 'props' || name === 'stories' ? name : null`, the file is clean
  without the entry: both literals sit in comparisons, and what is returned is `name`,
  narrowed.
- The whole web workspace linted the same way from `apps/web`, the 267 files
  `npm run lint` reads, `kn215-probe-all.mjs`: without the entry, those two lines are
  the only messages.
- No other source file holds a quoted `props` or `stories`; `guard.test.ts` line 273 is a
  test, which the lingui block leaves out.
- `src/gate-fixtures` holds one file per hole the rule has had, ignored by an ordinary
  `npm run lint`. `agent/scripts/verify/KN-003.mjs` lints every `unlocalized*.tsx` there
  with `--no-ignore`, requires the known ones by name, and requires each to fail on
  `lingui/no-unlocalized-strings` at least once; `README.md` names each fixture and its
  hole. A fixture has to be on disk to be linted: the project service refused the
  fixture the probe handed ESLint as text alone.
- `src/i18n/lingui-ignore.test.ts` reads the ignore entries out of the config and asserts
  there are at least three. There are three today, and two after this.

## The approach

1. **`sectionOf` returns the narrowed name**,
   `return name === 'props' || name === 'stories' ? name : null`, so the parser
   returns no literal and needs no exemption.
   `Section` stays its return type. `parse.test.ts` reads both headings and a section
   the format does not have, and runs unchanged.
2. **The entry goes** from `linguiOptions.ignore`, with its comment.
3. **A fixture, `src/gate-fixtures/unlocalized-section-words.tsx`**: `aria-label="stories"`,
   `title="props"`, and `stories` as text, one export each, as
   `unlocalized-latin-1-letters.tsx` holds its three, with a comment naming the entry
   that let the section names through in every file.
4. **KN-003's verifier requires it by name, and requires its three reports.** One report
   is all the verifier asks of a fixture, and this one would still give it on its text
   alone if either attribute went through again. It is not run at the close; the same
   count is read from the fixture's own eslint run.
5. **The fixtures' README names it**, with its hole and KN-215.
6. **`lingui-ignore.test.ts`**: at least two entries, and `props` and `stories` join the
   strings no entry may let through, in a list of their own, since `COPY` is also
   asserted string by string against the old no-letter entry. An entry that lets either
   word through again then fails the unit project as well as the fixture.
7. **AGENTS.md section 7** gains the line the probe taught: `useTsTypes` passes a literal
   only when its contextual type is a union of string literals alone, so a literal
   returned from a function typed `Section | null` is copy to the rule.

## File by file

- `apps/web/eslint.config.js`
- `apps/web/src/shared/story-docs/parse.ts`
- `apps/web/src/gate-fixtures/unlocalized-section-words.tsx`, `README.md`
- `apps/web/src/i18n/lingui-ignore.test.ts`
- `agent/scripts/verify/KN-003.mjs`
- `AGENTS.md`

## What I expect to be hard, and what I am unsure of

- **Anything else leaning on the entry.** Nothing today, measured over the whole
  workspace; the full `npm run lint` after the change says the same of the tree as it
  then is.
- **The verifier as the place a fixture is required.** The owner's rule of 2026-09-11
  stopped a verifier per card. This adds one name and one count to an existing verifier,
  which is how every other fixture is required rather than merely present.

## Plan review, Codex gpt-5.6-terra, 2026-09-15

"The core fix is correct." It confirmed that TypeScript narrows `name` through `||` to
`'props' | 'stories'` under this repository's configuration, that eslint-plugin-lingui
0.14.0 passes a literal beneath each `BinaryExpression`, and that a readonly array
searched with `find` would be more machinery rather than safer. Two corrections, both
taken.

1. **The exit could not say literally that the fixture fails `npm run lint`**, which
   ignores `src/gate-fixtures` so the ordinary run stays clean; the proof is the rule run
   with `--no-ignore`. The card's exit now says so.
2. **KN-003's verifier asks a fixture for one lingui report**, so this fixture would go on
   failing on its text alone if either attribute went through again. It now requires the
   fixture's three reports.

## How I will know it works

- `npx eslint --no-ignore src/gate-fixtures/unlocalized-section-words.tsx` fails with
  three reports of `lingui/no-unlocalized-strings`, one for each export.
- `npm run lint` and `npm run lint:tsc` clean in `apps/web`, and `node --check` on the
  verifier.
- The unit project passes, `parse.test.ts`, `guard.test.ts` and `lingui-ignore.test.ts`
  among it.
- A component's Docs page, read in fa-IR and en-US, light and dark, still prints its
  Props and Stories entries, which the parser read: the Code Input's and the Input's,
  all printed before the change.

## Result, 2026-09-15

Built as planned after the review.

- `sectionOf` returns `name === 'props' || name === 'stories' ? name : null`, so
  `parse.ts` needs no exemption.
- The entry is gone from `linguiOptions.ignore`, and a comment in its place says why.
- `unlocalized-section-words.tsx` holds `aria-label="stories"`, `title="props"` and
  `stories` as text, and the fixtures' README names it.
- `KN-003.mjs` requires it by name and requires its three lingui reports. The verifier
  was not run; `node --check` parses it.
- `lingui-ignore.test.ts` asserts at least two entries, none of which lets `props` or
  `stories` through.
- AGENTS.md section 7 holds the `useTsTypes` line.

**Checks.**

- The fixture fails `npx eslint --no-ignore` with three reports of
  `lingui/no-unlocalized-strings`, at 7:60, 8:46 and 9:41: the label, the title and the
  text.
- The positive control, `kn215-control.mjs`: with the removed entry put back in memory,
  the same fixture gives no report, and the unit test's pattern check lets both words
  through.
- `npm run lint` and `npm run lint:tsc` clean in `apps/web`. The unit project, 1487 of
  1487; `lingui-ignore.test.ts` and `parse.test.ts` run on their own, 36 of 36.
- The Code Input's and the Input's Docs pages, in fa-IR and en-US, light and dark, print
  every entry checked, as they did before the change, with the dev Storybook serving the
  edited parser and no page error.
- The files clean at HEAD are formatted; `eslint.config.js` and `KN-003.mjs` keep the 5
  and 7 lines of drift they had.
