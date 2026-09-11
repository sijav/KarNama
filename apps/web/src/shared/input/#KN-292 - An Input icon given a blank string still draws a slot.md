# KN-292 · An Input icon given a blank string, a space or a zero-width character, still draws a slot with nothing in it

Beside `Input.tsx`, which is where the change lands.

**Why, from the board.** A slot with nothing to see is the hole KN-291 closed for
false and null, reached by a blank string instead, and the Input already knows
what blank means. Critical on the owner's order of 2026-09-10, as a finding on
a built component.

**Exit condition, from the board.** An Input given a string icon that isBlank
holds for, spaces, a line break, a zero-width space or a joiner, draws no slot
and its text box sits 16 from that edge; IconsTurnedOff covers a space and a
zero-width space among its cases and asserts no slot, and a mutation dropping
the blank check fails it by name; and the story docs say the direct values draw
no slot, while an element that renders nothing leaves a slot that collapses and
takes no room.

## What is there now

- `drawn(node)` in `Input.tsx` is false for undefined, null, a boolean and the
  empty string, KN-291. Any other string draws a Slot, and a string of spaces
  or of a zero-width space renders a text node, so the Slot is not `:empty`
  either: a 20 by 20 slot with nothing in it, the text box pushed to 40.
- `isBlank` in `blank.ts` is the Input's rule for text with nothing to read:
  whitespace, format characters (the zero-width space and the joiners among
  them), marks with no letter, default-ignorable code points and the braille
  blank. The empty string is blank too.

## The approach

1. `drawn` takes the blank rule for strings: a string draws a slot only when it
   is not blank, `typeof node === 'string' ? !isBlank(node) : ...`, which also
   covers the empty string, so the `node !== ''` test goes. Numbers stay drawn:
   React renders `0`, and hiding it would differ from React.
2. **IconsTurnedOff** gets two more fields that draw no slot: a space and a
   zero-width space, and a line break and a zero-width joiner, so every kind the
   exit names is rendered. They are `no-slot` fields, asserted with the others:
   no element beside the input and the text box 16 from both edges.
3. **Docs, both languages**: the leadingIcon prop says a blank string is off as
   well; IconsTurnedOff's entry says the direct values and blank strings draw no
   slot, while an empty fragment or an icon that renders nothing leaves a slot
   that collapses and takes no room, which is the wording KN-291's roast asked
   for.
4. **KN-291's verifier** counts three fields in the production build; it reads
   five now.

## What changes

- `Input.tsx`: `drawn`, and its comment.
- `Input.stories.tsx`: two fields in IconsTurnedOff.
- `story-docs/{en,fa}/Shared-Input.md`: the prop and the story.
- `agent/scripts/verify/KN-291.mjs`: the field count.
- `agent/scripts/verify/KN-292.mjs`: new.

## The verifier, clause by clause

1. The Input stories pass, IconsTurnedOff by name, and the story renders a
   space and a zero-width space among its no-slot fields.
2. **THE CASE**: the blank check dropped, strings drawn unless empty as before,
   fails IconsTurnedOff by name.
3. The docs, both languages, say blank strings draw no slot and that an element
   rendering nothing leaves a collapsed slot.
4. KN-291's verifier passes, with its production reading of every field in both
   directions.

## What I am unsure about

- Whether a string icon that is not blank but draws nothing visible, a
  combining mark on a base that is itself invisible, needs the same treatment.
  `isBlank` already treats a string of marks with no letter as blank, so a
  string it calls real has something to read.
- JSX string attributes and escapes: the story spells the invisible strings by
  code point, `String.fromCodePoint(0x200b)`, so the source shows what they are
  rather than carrying a character nobody can see.

## The check, and what changed after it

The second model found the plan sound: `isBlank` is the right contract for an
icon string, which is asked whether it gives anything to read, not whether a
font might paint a fallback glyph, and CSS cannot do it, since `:empty` fails
on any text node and `:blank` applies to form controls. Two things taken. The
invisible strings are spelled by code point in the story. And THE CASE mutates
only the string branch, back to drawing every non-empty string, keeping KN-291's
null and boolean guard, so the failure it causes is the blank check's alone.
The collapsed-slot field stays beside the four that draw none.
