# KN-401 · The React-warning guard hears only printf warnings

Beside the guard, per `agent/RALPH.md` step 2b. Child of KN-134, from its roast:
its critical and its minor, one file and one fix.

## The card

**Why.** A guard that hears some warnings is read as proof there are none; the
next plain-string warning prints into a log nobody reads, which is what KN-134
set out to end.

**Exit condition.** Every `console.error` and `console.warn` during a test of
either project fails it unless it is one of the product's own diagnostics,
recognised by an explicit mark rather than by the absence of `%s`, and a story
that provokes one says so; a committed test drives the guard with a printf
warning, a plain-string `console.error`, a `console.warn` and a product
diagnostic and fails if any is classified differently; both projects pass apart
from KN-365's flakes.

## What is actually wrong

The guard records a `console.error` only when its first argument contains `%s`.
React itself sends plain strings, "Cannot call startTransition while
rendering." among them, and it calls `console.warn` too, which the guard never
looks at. So "no React warnings" held only for the printf-style ones. And the
rule itself is untested: narrowing or inverting the `%s` test would stay green.

## The approach

**An explicit mark.** The product's three diagnostics, the Icon Button's blank
name and the Tooltip's two, go through one helper that prefixes a constant. The
guard allows a call whose first argument starts with that mark and fails on
everything else, `console.warn` included.

That inverts the rule: today anything without `%s` is assumed to be ours, so a
plain React warning passes. With a mark, only what we marked passes, and the
next React warning of any shape fails.

**A classifier worth testing.** The decision moves into a pure exported
function, `isOurs(args)`. The setup uses it; a committed test drives it with the
four cases the card names, so narrowing or inverting it fails.

## File by file

- `src/shared/diagnostics.ts` — the mark and `report`.
- `src/shared/icon-button/IconButton.tsx`, `src/shared/tooltip/Tooltip.tsx` —
  report through it.
- `.storybook/react-warnings.setup.ts` — classify by the mark, catch `warn`.
- a test beside the setup for the classifier.

## What I am unsure about

- Whether any existing story provokes a React warning that has been passing
  unseen; the whole suite will say so on the first run, and each one is either a
  real defect to file or a story that must say it provokes one.
- Whether the stories asserting the current diagnostics' text still match once
  a mark is prefixed. They match on a fragment, so they should.
- Where a test of a `.storybook` file belongs: beside it, or under `src`. The
  unit project's `include` decides, and it points at `src`.

## How I will know it worked

The classifier's test covers the four cases; the whole suite runs and whatever
it turns up is either fixed or filed; and the guard, pointed at a plain-string
React warning, fails.

## On main, 2026-09-14

The approach above landed before the card could close: `src/shared/console-guard.ts`
holds the mark, `report`, `isOurs`, `allowConsole` and the guard, which wraps
both `error` and `warn`; `.storybook/react-warnings.setup.ts` wires it into the
unit and the storybook projects alike; `src/shared/console-guard.test.ts` drives
the four shapes the card names. The diagnostics module the plan called
`diagnostics.ts` is that one file. The card waited on KN-477, which kept the work
on main, so what was left was to check it rather than build it.

- **The wiring, with temporary controls deleted after one run each.** In both
  projects a plain-string `console.error`, a `console.warn` and a printf warning
  each failed their test with "something warned during this test", and a
  `report` diagnostic and a message given to `allowConsole` passed.
- **The whole unit project** passed, 1348 tests, once the literal guard's one
  failure, a `'1px'` in KN-481's new shell story, was fixed.
- **The whole storybook project** failed eight stories and none on the guard:
  the five modal stories KN-494 carries, the board's `Adding` that KN-495
  carries, the Job Card's `Pressed`, which passed alone and is KN-365's kind,
  and Icon's `All Icons`, still counting thirty after KN-478's settings gear,
  fixed.
