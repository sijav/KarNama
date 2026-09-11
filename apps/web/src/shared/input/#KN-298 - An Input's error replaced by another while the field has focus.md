# KN-298 · An Input's error replaced by another while the field has focus is not shown to reach its live region

Beside `Input.stories.tsx`, where the story lives.

**Why, from the board.** A field whose error changes as the user types is the
ordinary case for a form that validates as it goes, and the person typing needs
the error that is true now, not the first one. Critical on the owner's order of
2026-09-10, as a finding on a built component.

**Exit condition, from the board.** A story replaces one error with another on
a focused Input, focus kept, and asserts the same alert holds the second error
and the field is described by it; KN-286's verifier reads Chromium's
accessibility tree after the replacement, the alert holding the second error,
in both languages; and KN-286's plan says what is tested and that no check here
hears a screen reader.

## What is there now

`ErrorAnnouncedWhileTyping` validates one rule, empty is an error, so its alert
goes from empty to one message and back. KN-286's plan says the alert reads
again when the error changes to another; nothing shows the region carrying the
second.

## The approach

1. **A second rule in the story's validator**: fewer than two characters is an
   error of its own, `Enter at least two characters`, a new catalog message in
   both languages. So clearing the field gives the empty error, one letter
   replaces it with the short one, focus kept, and a second letter clears it.
2. **The story asserts the replacement** on the same alert node it found empty:
   the empty error, then the short one, the field described by each in turn,
   then empty and the helper again, or nothing for the bare field.
3. **KN-286's verifier** types one letter after the clear and reads the tree
   again: the alert holds the short error, the field described by it, in both
   languages. Its THE CASE stays.
4. **KN-286's plan** is corrected: it says what the story and the verifier show,
   the region carrying each error in turn, and that whether a screen reader
   speaks each is for a person listening, since no check here hears one.

## What changes

- `src/i18n/locales/en-US.ts` and `fa-IR.ts`: the new message.
- `Input.stories.tsx`: the validator and the story's play.
- `story-docs/{en,fa}/Shared-Input.md`: the story's entry.
- `agent/scripts/verify/KN-286.mjs`: the second reading.
- KN-286's plan.
- `agent/scripts/verify/KN-298.mjs`: new.

## The verifier, clause by clause

1. The Input stories pass, ErrorAnnouncedWhileTyping by name, and the story
   asserts the second error on the alert it found empty.
2. **THE CASE**: the alert keyed on the error, so a changed error mounts a new
   node instead of changing the one that was there, fails the story by name,
   on the node found at the start no longer being the one in the page.
3. KN-286's verifier passes, its tree reading the second error in both
   languages.
4. KN-286's plan says the region carries each error in turn and that no check
   here hears a screen reader.

## What I am unsure about

- Whether the catalog tests or the story-docs guard need anything beyond the
  two catalog lines.
- Whether a key on the span, the mutation, is the change a later edit would
  plausibly make: it is the one that breaks the same-node promise while every
  text still reads right.

## The check, and what changed after it

The second model found the plan sound: updating an alert already in the page
is the pattern W3C recommends, and a keyed alert would make React destroy and
recreate the node. Taken: the story asserts identity outright after the
replacement, the region it found still connected and still the one the field's
alert query returns, not only that some alert holds the text; and KN-286's
verifier compares the alert's DOM node before and after, through the
accessibility tree's `backendDOMNodeId`. React may replace the text node under
the span; the region is the span, and a change beneath it is what assistive
technology watches.
