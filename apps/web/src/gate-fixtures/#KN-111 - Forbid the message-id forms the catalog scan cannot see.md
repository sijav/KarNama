# KN-111 · Forbid the message-id forms the catalog scan cannot see

Beside the gate fixtures. Recorded after the fix, on 2026-09-11, under the
owner's rules of that day.

**Exit condition, from the board.** A Trans with a braced or template-literal
id fails npm run lint, a committed fixture holds each form, and the catalog test
still finds every id the codebase uses.

## What was done

- Three `no-restricted-syntax` selectors beside KN-217's, in the lingui block:
  `i18n._` whose first argument is not a string literal, a `Trans` whose `id`
  is not a quoted string, and a `Trans` whose first attribute is not its `id`.
  Together they leave only the two spellings the catalog test reads, so the scan
  is sufficient by construction, as the card asked.
- The scan also allows whitespace after `i18n._(`, since Prettier breaks a long
  call there, a miss STATE.md already recorded; the scan and its self-check
  share one pattern now, and the self-check reads a broken call.
- `unscannable-ids.tsx` holds each form, braced, template and named `Trans`
  ids, an id not first, and `i18n._` with a template and a name; the lint
  reports all six. No code in `src` used any of them: the whole workspace lints
  clean and the catalog tests find every id, 329 of 329.
- Not covered: lingui's `t` and `msg` macros, which this codebase does not use,
  and which the scan would not see either.
