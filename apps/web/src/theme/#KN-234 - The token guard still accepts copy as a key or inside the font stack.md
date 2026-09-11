# KN-234 · The token guard still accepts copy as a key or inside the font stack, and its retirement check trusts any lint failure

Beside the tokens. Recorded after the fix, on 2026-09-12, under the owner's
rules of 2026-09-11.

**Exit condition, from the board.** Every string-literal key in tokens.ts must
be a token name DESIGN.md documents, not a shape; the font stack must equal the
documented value exactly; planted cases for a copy key, copy after Vazirmatn
and a copy family each fail the guard; and the retirement check requires a
clean baseline lint and lingui errors attributable to tokens.ts, STORAGE_KEY
and TOOLTIP_SURFACE once they are removed, reporting an unrelated error as
inconclusive.

## What was done

- A key is now a name the design writes down. `tokens.test.ts` collects every
  inline code span in DESIGN.md's Tokens section and every word of its spacing,
  radius and icon block, lower case, and a string-literal key has to be one of
  them. The shape that stood there, lower case in slash-separated steps,
  accepted `delete/application`, and the Foundations page renders keys as
  visible labels.
- The font stack is read from DESIGN.md and matched whole. DESIGN.md's Type
  section now carries the stack itself, `'Vazirmatn Variable', 'Vazirmatn',
  system-ui, sans-serif`, which is what the guard compares against; the pattern
  it replaces allowed any text after Vazirmatn inside the first quoted family
  and any quoted family after it.
- Three planted cases added, one for each hole: copy shaped like a token name
  as a key, copy as a family after Vazirmatn, and copy inside the first quoted
  family. A positive control asserts the contract was actually read: the name
  set holds `bg/page`, `custom-4`, `heading/l` and `3xl`, and the stack is the
  exact string. 51 tests in the file pass.

## What was split off

The third finding, `agent/scripts/verify/KN-227.mjs` reading only the lint's
exit code, is KN-406, at low. It is loop machinery rather than product, which
the owner's rule of 2026-09-11 puts at low unless it is actively breaking the
work, and nothing runs that file: verifiers are not run at the close, and
neither CI nor `npm run contract` calls it.
