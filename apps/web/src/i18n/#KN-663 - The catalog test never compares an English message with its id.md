# KN-663 - The catalog test never compares an English message with its id

## DROPPED on 2026-09-16, before anything was built, because the premise is false

**`i18n.test.ts` line 7 has asserted this since 2026-09-08.** Its first case,
"uses English sentences as ids, so the English catalog is an identity map", loops
`Object.entries(en)` and requires `expect(message).toBe(id)`. It entered in `e3150cc`, KN-003,
**eight days before this card was filed**, and it runs in the unit project: 1 file, 10 passed.

**So the card's own account of KN-565 was wrong too.** It says the bad mapping passed "every one of
the 484 cases" and the suite stayed green. 484 is `catalog.test.ts`'s count. That file was run, it
passed, and I concluded from it that the REPOSITORY checks nothing — when a full unit run would have
failed on `i18n.test.ts`. A partial run tells you what it ran; it can never tell you what exists.

The plan review found this, not me, and only after a plan had been written and a round spent on it.
The plan is kept rather than deleted because the reasoning in it is still the record of what was
believed and how it was checked — and the measurements below stand: en-US is 239 entries, 0
differing, 0 with braces, and the file's docstring does declare the identity map. Everything built
on top of those facts was unnecessary.

The lesson is in `AGENTS.md`: **"nothing checks X" is a claim about the whole repository**, so it is
established by searching the tree, never by one file's green run.

## The card, as it was filed

**Why.** The English catalog IS the copy an English reader sees, and a rename done by hand is the
likeliest way for it to go wrong, so the one operation most in need of a check is the one nothing
checks. A silently wrong string in the reader's own language is worse than a loudly missing one,
because nothing ever reports it.

**Exit.** `catalog.test.ts` fails when an English message differs from its id, shown by a mutation
that changes one message and makes that case fail, and the whole unit project passes on the tree as
it stands.

Found 2026-09-16 while building KN-565, by reading the diff rather than by any test: the build
script's swap replaced the first occurrence while en-US holds each string twice, so
`'You have not added a job opportunity yet': 'You have not added a job posting yet'` shipped, and
**484 catalog cases stayed green.**

## Measured before planning, 2026-09-16

- **en-US holds 239 entries and every one maps its id to itself**, measured by loading the module
  and comparing rather than by reading it: 0 differ. **No id contains a brace**, so no ICU plural or
  placeholder syntax is in play and a strict comparison has nothing legitimate to trip over.
- **`catalog.test.ts` has eight cases**: a positive control that files and ids were found at all;
  two `it.each` cases that every used id is in each catalog; no blank Persian message, with
  `stripFormat` dropping `\p{Cf}` so a lone ZWNJ counts as blank; no Persian message equal to its id
  after `bare()` casefolds and strips to letters and digits; no id nothing uses; the same keys in
  both catalogs; and a last case proving the patterns can fail, written against pretend values
  rather than against the files.
- **Not one of them reads an English message's value.** That is the whole card.
- **The file already declares the rule, in its own words.** `en-US.ts` opens by saying the ids ARE
  the English text, so the file is an identity map and stays that way, existing so `i18n.load` has
  both locales and a missing Persian message has something to fall back to. So this card does not
  invent a policy; it checks the contract the file states about itself and has had all along.
- **The file's idiom for a catalog-wide rule** is to collect the offenders and assert the list is
  empty, which names every offender in one failure instead of one case per id.

## The decisions, for the review

1. **Strict equality, or the `bare()` comparison the Persian case uses?** The Persian rule is
   deliberately loose about punctuation and case, because it is hunting an untranslated string
   wearing a translation. English is the opposite situation: en-US is a pass-through catalog, so the
   message must be EXACTLY the id, and `bare()` would let `Save.` pass for `Save` — which is the
   very class of error this card exists for. **I lean strict.**
2. **Does a rule this strict forbid anything legitimate?** lingui allows an id that is a key with
   real English copy as its message. Nothing here does that, and AGENTS' rule is English ids, so the
   rule matches the project rather than merely matching today's data. If that ever changes, this
   test is where it gets argued, which is the right place for it.
3. **Where the proof that the case CAN fail lives.** The file already ends with a case proving its
   patterns can fail, on pretend values. The same idiom fits here and it is permanent, unlike a
   mutation run once by hand. **I will do both**: the in-file pretend proof, and an external control
   that changes one real message and shows this case failing.

## The approach

1. **One new case**, beside the Persian value checks, collecting every English entry whose message
   differs from its id and asserting the list is empty.
2. **Its comment says what it covers and what it does not**: that this is what stands between the
   English catalog and a silently wrong word, and that it says nothing about whether the id itself
   is the right English.
3. **The last case gains a pretend pair** proving this predicate can fail, as it does for the others.
4. **The control changes one real message** in `en-US.ts` and shows this case, and only this case,
   failing.

## What I will change

- `apps/web/src/i18n/catalog.test.ts`, one case and one line in the proof case
- this plan, which stays beside it

## What I expect to be hard, and what I am unsure of

- **KN-589's roast already named the consequence**: a story that derives both the expected string
  and the rendered string from the same catalog cannot catch a wrong English value either, so this
  case is the only thing that can. The comment should not overclaim past that.
- **The control must leave the file exactly as it found it**: computed in memory, the substitution
  counted and required to match exactly once, written, and restored in a `finally`.
- **The run is read from its summary line, never an exit code**, and a run that skipped or ran none
  is a failure to run rather than a pass — KN-626 got that wrong twice in one iteration.

## How I will know it works

- **The new case fails when one English message is changed** and passes on the tree as it stands,
  and the control names which case failed rather than reporting a count.
- The whole unit project passes, 1531 cases less the two of `session.test.ts` under load, KN-551.
- `tsc --noEmit` and `eslint --max-warnings 0` clean; no changed file's drift grows and this plan's
  is 0.
