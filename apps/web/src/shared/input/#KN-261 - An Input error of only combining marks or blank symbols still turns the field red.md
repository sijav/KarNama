# KN-261 · An Input error of only combining marks or blank symbols still turns the field red

CHILD OF KN-011, the Input, and found by the KN-259 roast.

**Why, from the board.** The claim in the code and the behaviour should agree,
and an invisible message is the exact state KN-254 and KN-259 set out to
remove. Critical on the owner's order of 2026-09-10, as a finding on a built
component.

**Exit condition, from the board.** An error made only of whitespace, format
characters, combining marks, variation selectors and the blank symbols named
here is no error, while a real message containing any of them is still shown;
the blank rule is defined once and tested at its boundaries, including each of
those characters alone and each inside a real Persian message; and the comment
says exactly what the rule covers.

## What the rule should be, and why not "invisible"

KN-259's rule, `/^[\s\p{Cf}]*$/u`, is whitespace plus the format characters, and
its comment calls that "what a person cannot see". Checked in Node, both halves
of that are off:

- `\p{Cf}` holds characters a person CAN see: U+0600 and U+06DD, the Arabic
  number sign and end-of-ayah, are format characters with glyphs. The Unicode
  property for "shows nothing" is `Default_Ignorable_Code_Point`, which leaves
  those out and takes in the combining grapheme joiner U+034F, the variation
  selectors and the Hangul fillers U+115F, U+1160, U+3164 and U+FFA0.
- A combining mark with no letter under it, U+0301 say, does show something, a
  stray accent, but nothing anyone can read.

So the rule is not about sight. It is **an error needs something to read**: a
message is blank when every character in it is whitespace, a format character,
a mark, a default-ignorable code point, or the braille blank U+2800, which is a
symbol that draws nothing and is in none of those classes. A message with one
letter, digit, punctuation mark or symbol beyond those is a real one, whatever
invisible characters sit inside it, so a Persian message keeps its ZWNJs and
still shows. That is also what the Figma gotcha in DESIGN.md asks: the ZWNJ is
never stripped from real text.

## The approach

1. A new module, `src/shared/input/blank.ts`, exporting `isBlank(text)`: the
   pattern `/^[\s\p{Cf}\p{M}\p{Default_Ignorable_Code_Point}⠀]*$/u`, with a
   comment that names each class and why it is there.
2. `Input.tsx` imports it and drops its own `BLANK`; the line that normalises
   the error keeps its shape, `isBlank(given)` in place of `BLANK.test(given)`.
3. A unit test, `blank.test.ts`, in the unit project, since this is logic with
   no DOM: each class alone is blank (U+200C, U+200F, U+00AD, U+034F, U+FE0F,
   U+E0100, U+3164, U+115F, U+2800, U+0301, U+0600, whitespace kinds); each of
   those inside a real Persian message is not; and plainly visible text is not,
   Persian and Latin letters, Persian digits, punctuation, an emoji, U+0640 the
   tatweel.
4. DESIGN.md, "An Input's error needs a message": say what blank covers, in the
   same terms as the comment.
5. KN-254's and KN-259's verifiers anchor on `BLANK` in `Input.tsx`; they follow
   it to `isBlank`.

## What I am leaving alone

- FromArgs in the stories still carries its own copy of the old pattern. KN-262
  exists to make it import the rule; doing it here would close half of that
  card inside this one. Until then the copy is stale for an error of only marks,
  which no automated run sends.
- The input folder has no `index.ts`; KN-092 is the sweep for that.

## What I am unsure of

- Whether "only marks is blank" could swallow something real. A mark means
  nothing without a base, so a message of marks alone cannot be a message; a
  mark after a letter is part of a real one and stays.
- `\s` in JavaScript: it is WhiteSpace and LineTerminator, which includes
  U+00A0, U+FEFF, U+1680, U+2000 to U+200A, U+202F, U+205F and U+3000.
- Browser support for `\p{Default_Ignorable_Code_Point}`: property escapes with
  the u flag are ES2018, in every browser the app targets.

## How I will know it worked

`node agent/scripts/verify/KN-261.mjs`: the unit test passes; THE CASE, the
rule narrowed back to KN-259's pattern, fails the test for the combining
grapheme joiner, a variation selector, a Hangul filler and the braille blank;
the rule is defined in exactly one place under `src` apart from KN-262's known
copy; the Input stories still pass, WithError with its ZWNJ among them; and
DESIGN.md says what the rule covers.

## The check, and what changed after it

The second model found the predicate sound, "an error needs readable content",
and confirmed `\p{Default_Ignorable_Code_Point}` runs in Vite 8's production
targets. It asked for three corrections, all taken:

- FromArgs's copy of the old pattern is a second definition under `src`, so
  "defined once" cannot hold with it there. The story imports `isBlank` here.
  KN-262 is left with its own proof, that widening the rule changes what
  FromArgs expects without the story being touched.
- KN-254's and KN-259's verifiers anchor on `BLANK` in `Input.tsx` and have to
  be moved to the shared module, not assumed to follow.
- The unit test proves the rule, not that the Input uses it. BlankErrorIsNoError
  gains a fifth field, an error of only the braille blank, which only the new
  rule calls blank, and narrowing the rule must fail that story by name too.

And the comment does not call the rule a test of invisibility: U+0600 and U+06DD
are format characters that draw a sign, and they count as blank because alone
they say nothing, not because nothing shows.
