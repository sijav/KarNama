# KN-297 · The Input's text measurement takes its direction from the input, so a placeholder with its own direction moves the text without failing a check

Beside `Input.stories.tsx`, where the measurement lives.

**Why, from the board.** KN-283 exists so that a check which says the text sits
16 from its edge notices the text moving, and this is a way the text moves that
it does not notice. Critical on the owner's order of 2026-09-10, as a finding
on a built component.

**Exit condition, from the board.** textInsets and KN-266's production check
take the direction from the style of what the field shows, the placeholder's
when it is empty, and refuse by name a writing mode other than horizontal-tb
and a unicode-bidi that lets the content set the direction; a placeholder given
the other direction and unicode-bidi plaintext on the input with a value in the
other script, each present in every state, fail Default and the production
check by name; and KN-283's verifier still passes.

## What is there now

`textInsets` reads the placeholder's alignment and indent when the field is
empty, and takes the direction from the input. A placeholder given its own
direction starts from the other side while the check measures from the input's
start; `unicode-bidi: plaintext` lets a value's first strong letter set its
direction, so a Persian value in an English field starts from the right; and a
vertical writing mode turns the axis. None is guarded, in the stories or in
KN-266's production check.

## The approach

1. **The direction is the shown style's**, the placeholder's when the field is
   empty and the input's otherwise, and the start side follows it.
2. **The shown text must run the field's way.** The file draws the text from
   the field's start, the start of the language on screen, so a placeholder or
   an input running the other way does not start where it should even when its
   own start is 16 from its own edge. The helper throws, naming both
   directions. A Persian value in an English field is not that case: the input
   keeps the field's direction and the value's letters are ordered inside it.
3. **Refused by name**: a writing mode other than `horizontal-tb`, on the input
   or what it shows, and `unicode-bidi: plaintext` on either, the one value
   that lets the content set the direction.
4. **KN-266's production check** measures the same way and names the reason in
   its failure.

## What changes

- `Input.stories.tsx`: `textInsets`.
- `agent/scripts/verify/KN-266.mjs`: its measurement.
- `agent/scripts/verify/KN-297.mjs`: new.

## The verifier, clause by clause

1. The Input stories pass, and the helper reads the shown direction, the
   field's, the writing mode and unicode-bidi.
2. **THE CASE**, each present in every state: the placeholder given `ltr`, the
   other way from the Persian field Default renders, and `unicode-bidi:
   plaintext` on the input. Each fails Default by name and fails KN-266's
   production check, run as KN-266's own verifier, naming the direction or the
   bidi.
3. KN-283's verifier still passes.

## What I am unsure about

- Whether Chromium honours `direction` set on `::placeholder`; if it does not,
  the placeholder cannot run the other way and the mutation shows it by
  failing to fail, which the first run settles.
- Whether a mutation that adds `unicode-bidi: plaintext` fails Default, whose
  field is empty: the helper refuses it on the input whatever the field shows,
  since the value typed next would take its direction from its content.

## The check, and what changed after it

The second model said not to build this unchanged: `::placeholder` takes only
the properties `::first-line` takes, which exclude `direction` and
`writing-mode`, so a placeholder rule setting them cannot be relied on to move
the text, and reading its computed style would prove only the reading.
**Measured in Chromium 151 before building**, in the Persian Default field:
`direction: ltr` and `writing-mode: vertical-rl` on `::placeholder` are
ignored, the computed style stays the input's and the placeholder's pixels stay
at x 483 to 634; `text-align: left` there is honoured and moves them to 0 to
152, which KN-283's helper already refuses. On the input, in the English Filled
field with its Persian value, `unicode-bidi: plaintext` moved the text from x 0
to x 511 while its computed direction still read ltr, and `writing-mode:
vertical-rl` turned the axis.

So the card's exit was narrowed, recorded on the card: the direction stays the
input's, which is the placeholder's too; the helper refuses by name
`unicode-bidi: plaintext` on the input, a writing mode other than
`horizontal-tb`, and an input whose direction is not the field's, which the
file's start-side text rules out and which the component does not offer; and
the mutations are those three on the input. `dir=auto` would be a new design
decision, since it lets content set the direction the measurement assumes.
