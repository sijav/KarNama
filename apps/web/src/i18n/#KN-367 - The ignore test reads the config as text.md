# KN-367 · The ignore test reads the config as text

Beside the test, per `agent/RALPH.md` step 2b. Child of KN-214, from its roast.

## The card

**Why.** A check that reads a different thing than the tool it guards proves
nothing about the tool.

**Exit condition.** The test takes the ignore array from the configuration
ESLint actually loads, not from the file's text, and a story or test shows an
entry written in another quote style is seen.

## What is actually wrong

`lingui-ignore.test.ts` finds `ignore: [` in `eslint.config.js` as TEXT and
matches single-quoted, one-line entries with a regular expression. An entry
written any other way, double-quoted, a template literal, split over two lines,
or built by concatenation, is invisible to it. So `".*"`, which would whitelist
every string in the whole codebase, could sit in the config while this test
stayed green and kept asserting about the entries it could see.

## The approach

Import the config. `eslint.config.js` is an ES module and the test is already an
ES module, so `await import()` gives the exact array ESLint is handed.

From that array, find the block that configures `lingui/no-unlocalized-strings`
and take its options' `ignore`. That is the value the rule compiles, whatever
the source looked like.

The second half of the exit condition, that an entry in another quote style is
SEEN: the test compiles a config-shaped object of its own with an entry written
double-quoted and asserts the reading function returns it. That is a unit of the
reading, not a second copy of the config.

## File by file

- `src/i18n/lingui-ignore.test.ts` — read the entries from the imported config;
  a small exported reader so the other-quote-style case can be checked directly.

## What I am unsure about

- Whether importing the config inside a Vitest **node** project works without
  ESLint itself being loaded: the config imports plugins, which are CommonJS,
  and that can be slow or noisy. If it is a problem, the alternative is to parse
  the file with a real JS parser rather than a regular expression, which is
  still an improvement but not what the card asks for.
- Whether the config's shape makes the rule's options easy to find: it may
  appear in more than one block.

## How I will know it worked

The test reads the same entries it reads today, from the imported config; and a
case with a double-quoted entry, which the old reader could not see, is read.
