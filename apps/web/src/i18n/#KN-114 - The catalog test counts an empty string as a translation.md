# Plan — KN-114, an empty string is not a translation

## The task, from the board

**What.** `src/i18n/catalog.test.ts` checks that every used id is a KEY in both
catalogs and rejects only a Persian value exactly equal to its English id. Set a
Persian message to the empty string and every test still passes, while the user
sees nothing at all where a label should be. Reject empty and whitespace-only
values, and reject a value that is the English id with punctuation changed,
which is the next spelling of the same evasion.

**Why.** A roast rated this critical and it is the clause the whole test exists
for: the exit condition says the fa-IR catalog is 100 percent translated and a
test fails when it is not, and an empty string is not a translation. An empty
label is also worse than an English one, because English text tells a Persian
user the string was missed and a blank tells them nothing.

## Confirmed by reading

`catalog.test.ts:53` asserts `Object.keys(fa)` CONTAINS the id. Keys, never
values. So `{ 'Save': '' }` satisfies it completely.

`catalog.test.ts:57` is the only value check and it is exact equality,
`message === id`, guarded by `/[A-Za-z]/.test(id)` so an id made only of digits
or punctuation is exempt. `'Save'` is caught; `'Save.'` is not.

## The approach

Two new checks, kept separate so a failure names which evasion it is.

1. **Every Persian value is a non-empty string with a non-space character in
   it.** Covers `''`, `'   '`, a tab, and a non-breaking space, which looks like
   a translation in a diff and renders as nothing.
2. **No Persian value is its English id with the punctuation moved.** Normalise
   both sides, casefold, strip everything that is not a letter or a digit, then
   compare. `'Save.'`, `'save'`, `'SAVE!'` and `'Save '` all collapse onto the
   id. The existing `/[A-Za-z]/` guard stays, so an id of digits or symbols is
   still exempt.

## What I will change

- `apps/web/src/i18n/catalog.test.ts`, the two checks.
- `agent/scripts/verify/KN-114.mjs`, which runs the file and, more importantly,
  PLANTS each evasion into a copy of the catalog and requires the suite to go
  red for it. A test that has never been watched failing on the exact input it
  is written for is a test nobody has checked.

## What I expect to be hard, and what I am unsure about

- **The normalised comparison could reject a legitimate translation.** A message
  whose correct Persian is the same as its English id, a brand name, an
  abbreviation, a symbol, would now fail. I think that is rare enough to be
  worth a deliberate exception when it appears rather than a weaker rule, but I
  want it checked. The `/[A-Za-z]/` guard already handles the numeric case.
- **Whether "contains a Persian character" is the check I actually want.** It is
  stronger and it would catch a value of `'x'`, which my rule passes. It also
  false-positives on a number, a URL or a proper noun, and the card does not ask
  for it. I am leaving it out and I am not certain that is right.
- **Whether planting into the real catalog is safe.** The verifier must not
  leave a mutated `fa-IR` behind if it is killed. The existing harnesses restore
  in a `finally`, and a killed process does not run one, which has already left
  mutated source in this repository twice. Planting into a COPY under a temp
  directory and pointing the run at it avoids the problem entirely, if the test
  can be made to read from there.

## How I will know it worked

`node agent/scripts/verify/KN-114.mjs` passes; each planted evasion, an empty
value, a whitespace-only value, and the id with punctuation changed, makes the
catalog test FAIL with a message naming that id; and the whole web gate stays
green.
