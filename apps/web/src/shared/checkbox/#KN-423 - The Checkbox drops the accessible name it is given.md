# KN-423 · The Contact Card's checkbox has no accessible name, though the card sets one

Beside the Checkbox, per `agent/RALPH.md` step 2b: the name is lost in the
Checkbox, not in the card.

## The card

**Why.** Selecting a person is one of the two things the network page is for,
and a control a screen reader cannot name is a control they cannot use.

**Exit condition.** The contact card's checkbox is named for whoever it selects,
asserted by a story that finds it by that name; the Checkbox component forwards
the accessible name whatever else it is given, with its own test.

## What is true today

- **Both cards are unnamed, not only the Contact Card.** Measured on 2026-09-14
  in Chromium against the dev server, English, sample data loaded, with
  Playwright's own role and name queries: the board's 24 job-card checkboxes and
  the network's 6 contact-card checkboxes, and not one is named `Select …`. On
  each, the card's `aria-label` sits on the `SPAN` round the input, and the
  `input type="checkbox"` that holds the role has none. The card's word that the
  Job Card's same pattern is named was wrong: its stories only ever find the
  checkbox by role, so nothing had checked.
- **Why, read from MUI 9.4.0's `internal/SwitchBase.js`**: every prop SwitchBase
  does not know, `aria-label` and `aria-labelledby` among them, is spread onto
  the root slot, a `span`. The input slot takes only its fixed set, checked,
  disabled, id, name, value and the like, and whatever `slotProps.input` gives
  it.
- `Checkbox.tsx` spreads the rest of its props onto `MuiCheckbox` and gives
  `slotProps.input` only the ref it needs for `indeterminate`. So the name goes
  to the span.
- The Checkbox's docs promise the opposite: `aria-label` is its accessible name,
  and a checkbox with neither it nor `aria-labelledby` is unusable by screen
  reader. No story of the Checkbox or of either card asserts a name.
- The two cards are the Checkbox's only callers.

## The approach

1. **In `Checkbox.tsx`, take `aria-label` and `aria-labelledby` out of the rest**
   and give them to `slotProps.input`, beside the ref, so they reach the input
   and never the span. Nothing else about the props changes.
2. **A Checkbox story, `Named`**, asserting the checkbox is found by its role and
   the name from `aria-label`, and by the name of a visible label it points at
   with `aria-labelledby`, and that the root span carries neither attribute, so
   no named wrapper sits round an unnamed box.
3. **Both cards' stories find their checkbox by its name**, «انتخاب» and the
   contact's name or the job opportunity's title in Persian and `Select …` in
   English, in a story each already runs, rather than by role alone.
4. **A positive control**: put the name back on the root, and the new
   assertions fail; then restore the file byte for byte.
5. **A note on the card** that its premise about the Job Card was wrong, and
   that the fix covers both.

## What changes, file by file

- `apps/web/src/shared/checkbox/Checkbox.tsx`: the two name props to the input.
- `apps/web/src/shared/checkbox/Checkbox.stories.tsx`: the `Named` story.
- `apps/web/src/shared/story-docs/en/Shared-Checkbox.md` and the `fa` one: the
  story's entry.
- `apps/web/src/shared/contact-card/ContactCard.stories.tsx` and
  `apps/web/src/shared/job-card/JobCard.stories.tsx`: the checkbox found by name.

## What I expect to be hard, and what I am unsure about

- **MUI 9's typing of `slotProps.input`** for the two attributes. Settled before
  the build: `Checkbox.d.ts` in 9.4.0 types the input slot as
  `SlotProps<'input', CheckboxInputSlotPropsOverrides, CheckboxOwnerState>`,
  "based on the input element", so `aria-label` and `aria-labelledby` are its
  props with no cast.
- **Whether a story's by-name query is exercised in both languages**: the card
  stories are pinned to Persian; one English case per card, or the English
  story each already has, keeps the English name honest.
- **The folded checkbox**: at rest it is opacity 0 and takes no pointer, but it
  stays in the accessibility tree and the Tab order, KN-341, so it is found by
  name at rest as well as selected.

## How I will know it worked

The Checkbox's `Named` story passes, and fails with the name planted back on
the root; both cards' stories find their checkbox by name in Persian and
English; the probe finds all 24 and 6 checkboxes named; the Checkbox's other
stories, the cards' stories, the docs guard, lint and `tsc` pass.

## The plan review, and what changed

Codex, plan kind with web search, 2026-09-14, archived at
`%TEMP%/claude-roast/2b1874631dd1/20260914T144642-plan-kn-423-the-contact-card-s-checkbox-has-no-access-a64490.md`.

- **`slotProps.input` is MUI 9's documented place for the name**; a
  `FormControlLabel` is for a visible label the card design does not draw, and
  `inputProps` is not the MUI 9 path. Accepted, as planned.
- **Move the attributes, do not copy them**: a named span round the input does
  not name the checkbox, and only leaves a named generic node in the tree.
  Accepted, as planned.
- **`getByRole` with a name is the right proof** in the Vitest browser project,
  and the Chromium probe an independent last check. Accepted, as planned.
- **Never prove both attributes on one checkbox**: `aria-labelledby` outranks
  `aria-label`, so one checkbox with both would not prove the `aria-label` route.
  Accepted: two stories, `Named` with `aria-label` and `LabelledBy` pointing at a
  visible label, each with its own assertion.
- **The cards' coverage as planned**: the Persian name in each selected story and
  the English one in each `InEnglish` story, the folded checkbox included.
  Accepted.
