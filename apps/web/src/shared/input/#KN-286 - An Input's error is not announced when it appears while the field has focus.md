# KN-286 · An Input's error is not announced when it appears while the field has focus

Beside `Input.tsx`, which is where the change lands.

**Why, from the board.** The person being told their input is wrong is the one
who most needs to hear it, and today a screen reader says nothing at the moment
it happens. It holds whichever way KN-285 is answered. Critical on the owner's
order of 2026-09-10, as a finding on a built component.

**Exit condition, from the board.** An error that appears on a focused Input is
announced through a live region present before the error arrives, and the field
keeps aria-invalid and its aria-describedby association; clearing the error
restores the helper as the description or removes aria-describedby when there
is none; a story asserts the live region's role and that it carries the error
text after the error is set on a focused field, and a mutation removing the
live region fails it by name.

## What is there now

- The message line is one element, `id={messageId}`, holding the error or else
  the helper. The input names it in `aria-describedby` whenever there is a
  message, and sets `aria-invalid` while there is an error. A description that
  changes is not announced, so a field that turns invalid while it has focus
  says nothing until the user leaves it and comes back.
- WCAG 4.1.3 treats an error that appears without moving focus as a status
  message, which needs a live region, and a live region announces a change only
  if it was in the page before the change.

## The approach

1. **A live region inside the message line, from the first render**: a
   `span` with `role="alert"`, holding the error and empty otherwise. `alert`
   is assertive and atomic, so the whole error is read the moment it lands,
   and again if it changes to another error; emptied, it says nothing.
2. **The helper sits beside it, shown only while there is no error**, so the
   line reads one text, error or helper, and the field's description, the
   line's text, is the error while there is one and the helper once it clears.
   No text appears twice for someone reading the page.
3. **Nothing else about the description changes**: `aria-describedby` names
   the line while there is a message and is dropped when there is none, and
   `aria-invalid` follows the error, as KN-254 settled.
4. **KN-287**, which draws the line only when there is something to say, has to
   keep the region in the page when the line has nothing in it; its plan will
   say so, and DESIGN.md records the region under the error's section now.

## The story

`ErrorAnnouncedWhileTyping`: a field that validates as it is typed in, a small
wrapper holding its value and passing the error when the value is empty, the
way a form would. The play finds the alert, empty, before anything happens;
focuses the field; clears it; and, with the field still focused, asserts the
alert carries the error, the field is invalid and described by the error. Then
it types a letter and asserts the alert is empty and the helper is the
description again. A second field, with no helper, asserts that clearing its
error drops `aria-describedby`.

## What changes

- `Input.tsx`: the message line's contents.
- `Input.stories.tsx`: the story and its wrapper.
- `story-docs/{en,fa}/Shared-Input.md`: the story's entry.
- `DESIGN.md`: the error section says the error is announced as it appears.
- `agent/scripts/verify/KN-286.mjs`: new.

## The verifier, clause by clause

1. The Input stories pass, ErrorAnnouncedWhileTyping by name.
2. **THE CASE**: the live region removed, the error written into the line as
   before, fails ErrorAnnouncedWhileTyping by name.
3. **The region in the accessibility tree**, in a production build in Chromium,
   in both languages: before the error, a node with the role alert, live
   assertive and atomic, empty; after the field is cleared with focus kept,
   the same node carries the error, and the field is invalid and described by
   it.
4. DESIGN.md's section says so.

## What I am unsure about

- Whether a screen reader reads an error twice, once from the alert and once
  when the description changes. A changed description is not announced while
  focus stays, which is the defect, so the alert is the one announcement; on
  the next visit the description reads it.
- Whether an Input that mounts with an error, a form shown again after a failed
  submit, should announce at once. An alert that is in the page with its text
  from the start is read by some screen readers and not others; this card is
  about an error appearing on a focused field, and that case is left as it is.

## The check, and what changed after it

The second model found the structure correct: `aria-describedby` reduces the
line to its text, so with one branch or the other the description is exactly
the error or exactly the helper, and `role="alert"` is right for an error that
newly appears after the user's input. Taken: no `aria-live` is added beside the
role, which already implies it and can make VoiceOver on iOS speak twice; and
the constraint for KN-287 is written into the code, not only here: when the
line collapses because there is nothing to say, the empty alert stays mounted
and exposed, never unmounted, `display: none`, hidden or `aria-hidden`, or the
next error lands in a region that was not there. The accessibility tree proves
the wiring and the text, not what a given screen reader speaks, and the
evidence says so.
