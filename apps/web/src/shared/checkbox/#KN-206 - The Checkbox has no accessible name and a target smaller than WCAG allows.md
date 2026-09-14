# KN-206 · The Checkbox has no accessible name and a target smaller than WCAG allows

**Why, from the board.** Bulk selection is the feature this component exists for,
and the people most likely to select in bulk are the ones a missing accessible
name excludes. A 20 pixel target on a card that also drags is hard to hit for
anyone, not only for people with motor impairments. Neither is a detail that gets
fixed later once 37 components have copied the shape.

**Exit condition, from the board.** The component takes an id, and rendering one
with no accessible name is impossible without it being visible: either the type
requires one of aria-label, aria-labelledby or a wrapping label, or a check fails
on a story that omits all three. Every story names its control. The interactive
target is at least 24 by 24 while the DRAWN frame stays 20 by 20 from Figma, or
the spacing exception is demonstrated for the specific placement and written
down. A test asserts the hit area, not the frame.

## What is there, read 2026-09-14

- **The target is already larger than the square.** KN-293 gave the root
  `spacing/2xs` of padding on every side, 28 by 28 round the drawn 20 by 20 frame,
  and MUI's hidden input fills the root's padding box, so the pointer's target is
  28 by 28. `edgeIsTheFiles` asserts the frame is 20 by 20; nothing asserts the
  target.
- **The names reach the input.** KN-423 hands `aria-label` and `aria-labelledby`
  to `slotProps.input`, and the `Named` and `LabelledBy` stories find the checkbox
  by each.
- **But a name is optional, and there is no id.** `CheckboxProps` declares both
  names optional and has no `id`; MUI's SwitchBase gives `id` to the input when its
  type is a checkbox. Seven of the nine stories, `Unchecked`, `Checked`,
  `Indeterminate`, `Hover`, `Disabled`, `KeyboardOnly` and
  `FocusedInAClippingHost`, render the Checkbox with no name at all, so the
  component's own examples model the unusable case.
- **The two callers name theirs**: JobCard's "Select" and the title, ContactCard's
  "Select" and the person's name.
- **IconButton is the precedent.** Its type requires `aria-label`; its stories put
  an empty placeholder in the meta's args, which no control shows, and draw the
  real name in the reader's language inside the meta's render; and a blank name is
  refused and reported, KN-311, since a button that reaches a screen reader
  nameless is worse than one left out.

## The approach

1. **The type requires a name.** `CheckboxProps` becomes a union of the same props
   with either `aria-label` or `aria-labelledby` required and the other optional,
   so a Checkbox with neither is a type error, as an IconButton with no name is.
2. **A blank name is refused and reported**, as IconButton's is: when neither name
   holds anything but whitespace, the Checkbox renders nothing and says so through
   `report`, marked. The type cannot see a blank string, and a checkbox left out is
   a mistake that shows, where one rendered nameless is invisible.
3. **`id?: string`**, handed to MUI, which puts it on the input, so a label or a
   description can point at the checkbox itself.
4. **Every story names its control.** The meta takes IconButton's shape: an empty
   `aria-label` placeholder in its args that no control shows, and a render that
   names the checkbox in the reader's language, the `NamedCheckbox` already there;
   `FocusedInAClippingHost` names its own. Each story finds its checkbox through
   one helper that asserts its accessible name is not empty, so a story that drew
   an unnamed one fails.
5. **The hit area, asserted**, in a new story, `TargetIsLargerThanTheSquare`: the
   input's box is at least 24 by 24 while the frame stays 20 by 20; the browser's
   own hit-testing, `elementFromPoint` one pixel inside each corner of the input's
   box, lands on the input; and, in the runner, a real pointer click there,
   outside the square, toggles it.
6. **`BlankName`**, a new story: a Checkbox given a blank `aria-label` is left out
   and reported, beside a named one that renders.
7. **The docs**, in both languages: `### id`; the two name props saying one of
   them is required and a blank one is refused; and the two new stories.

## The tests

- **Red first.** `TargetIsLargerThanTheSquare` passes today on its size and its
  hit-test, since KN-293's target is already there, so its proof is a plant: the
  root's padding back to 0 makes the input 20 by 20 and fails the size and the
  corner. `BlankName` fails today, since a blank name renders an unnamed checkbox
  and reports nothing. The naming helper fails today on the seven unnamed stories,
  before the meta names them.
- **Plants, after**: the root's padding at 0 fails the target story; the blank
  name refusal taken out fails `BlankName`; a story rendering the Checkbox without
  the meta's name fails the helper.
- **The type**: a Checkbox with neither name, written once in a scratch file,
  fails `tsc`, which is the check the exit's first way asks for.
- JobCard's and ContactCard's stories keep passing, and the docs guard reads the
  new prop.

## Files

- `apps/web/src/shared/checkbox/Checkbox.tsx` and `Checkbox.stories.tsx`.
- `apps/web/src/shared/story-docs/en/Shared-Checkbox.md` and `fa/Shared-Checkbox.md`.

## What I am unsure of

- **Refusing a blank name** takes the only way to select that card away from
  everyone, not only from a screen reader. IconButton's KN-311 made that call for a
  button, and a checkbox on a card is the same shape, a control with no visible
  label; neither card can pass a blank name today, since both put "Select" before
  theirs. The review is asked.
- **A name that points at nothing.** An `aria-labelledby` whose id no element has
  is as nameless as a blank name, and the type cannot see it either. Telling needs
  the page after mount; the plan leaves it out and the docs say so.
- **The runner's pointer at a corner.** `vitest/browser`'s click takes a position
  within the element; if Chromium rounds the hidden input's box, one pixel inside
  may fall on the root's edge. `elementFromPoint` is the check that does not depend
  on it.
- **react-docgen-typescript over a union of props.** IconButton's union passes the
  docs guard today, so the same should hold; the guard is run.

## Plan review, Codex, 2026-09-14

Codex found the target's measurement right, since WCAG 2.5.8 counts the region
that takes the pointer, MUI's input over the padded root, 28 by 28, and
`elementFromPoint` at its corners is meaningful evidence that nothing covers it;
the union with a placeholder in the meta sound, as Storybook supports and
IconButton shows; and refusing a blank name right, since rendering it and only
reporting keeps an inaccessible control. Taken from it:

- **An `aria-labelledby` that comes to nothing is refused too.** The type cannot
  see an id no element has, or an element holding only blank text, so the
  Checkbox reads the elements it points at in the input's ref callback, where the
  labels of the same commit are already in the page, and a pointer that finds no
  text is left out and reported as a blank name is. A new story,
  `UnresolvedLabelledBy`, gives one checkbox an id no element has and one an
  element with blank text, beside one a visible label names.
- **The id is for a label, not a description.** A description is named from the
  control, with `aria-describedby`, which the Checkbox does not take; the docs say
  a label can point at it.
- **An icon-only primitive, said so.** Requiring one of the two ARIA names turns
  away a label wrapped round the Checkbox, which is valid HTML; the docs say this
  Checkbox has no text of its own and is named by one of the two.

Not taken: **that `vitest/browser`'s click takes no position.** Its own
`UserEventClickOptions` is empty, but the Playwright provider this repository runs
augments it with Playwright's click options, `position` among them, in
`@vitest/browser-playwright`'s types. Whether the stories' type check sees that
augmentation is settled by `tsc` at the build; if it does not, the click goes, and
the rectangle and `elementFromPoint`, which the review calls the primary proof,
stay.

## Result, 2026-09-14

- **`Checkbox.tsx`**: `CheckboxProps` is a union requiring `aria-label` or
  `aria-labelledby`, with `id` among the shared props, which MUI hands to the
  input. A name that comes to nothing is refused and reported: a blank
  `aria-label`, known at render, and an `aria-labelledby` whose elements hold no
  text, read in the input's ref callback as it attaches, the pointer that found
  nothing kept so the checkbox stays out until it changes.
- **`Checkbox.stories.tsx`**: the meta names every checkbox in the reader's
  language, with an empty `aria-label` placeholder that no control shows, as
  IconButton's stories do; each story finds its checkbox through `namedBox`, which
  asserts a name; and four stories are new, `TakesAnId`, `BlankName`,
  `UnresolvedLabelledBy` and `TargetIsLargerThanTheSquare`.
- **The docs**, in both languages: the Checkbox as a control with no text of its
  own, named by one of the two; `### id`; both name props; the four stories.

Red first, the stories before the component, 2 of 13 failing: `BlankName` at line
452 and `UnresolvedLabelledBy` at line 485, nothing reported. The other eleven
passed. `TakesAnId` and `TargetIsLargerThanTheSquare` among them, since MUI already
handed `id` to the input and KN-293's target was already 28 by 28, so they were
missing tests, proved by the plants.

Plants, each restored byte for byte and checked by hash:

- **The root's room taken away** fails `TargetIsLargerThanTheSquare` at its 24
  pixel check, line 502.
- **The refusal taken out** fails `BlankName` at its count of checkboxes, line
  454.
- **The reading of what `aria-labelledby` points at taken out** fails
  `UnresolvedLabelledBy` at its report, line 485.

`tsc` accepts the click's `position`: the Playwright provider's options are in the
program through `vitest.config.ts`, as judged against the review.

Looked at in the dev Storybook: `TakesAnId` in Persian dark, the square and its
label; `UnresolvedLabelledBy` in English light and in Persian light, and
`BlankName` in English dark and in Persian light, each drawing only its named
checkbox; `TargetIsLargerThanTheSquare` in Persian light. Both refusal stories
show PASS in the Interactions panel there.

Passing at the commit: the Checkbox, JobCard and ContactCard stories, 44 of 44;
the web unit project, 1383, run before any browser run; the docs guard, 75; eslint
and tsc clean. `Checkbox.tsx` was not formatted at HEAD, so only the new lines
were formatted, by hand; the stories file kept the drift it had. The English
docs' em dashes are the old sentence about the indeterminate attribute, which
KN-300 carries.
