# KN-217 · A string literal written 'as const' skips the lingui rule entirely

Beside the gate's fixtures. Recorded after the fix, on 2026-09-11, under the
owner's rules of that day.

**Exit condition, from the board.** `<Box title={'Delete this application' as
const} />` and `aria-label={'Delete' as const}` fail `npm run lint` in a
committed fixture, a story meta title written with 'as const' fails too, and
'as const' on an object or array literal still passes.

## What was done

- A `no-restricted-syntax` rule in the lingui block rejects a `TSAsExpression`
  whose annotation is `const` and whose expression is a string or template
  literal, with a message that says why: eslint-plugin-lingui returns early for
  such a literal before any other check. Objects and arrays are untouched.
- `as-const-copy.tsx` fails on the title and the label and keeps an object
  `as const` that must pass; `as-const-story-title.stories.tsx` fails on its
  meta title. Neither is named `unlocalized-*`, since lingui's rule is not the
  one that fails them.
- The one bare `as const` in `src`, the setAttribute fixture's attribute name
  from KN-214, is now a binding typed against a union.
