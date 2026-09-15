# KN-338 - The Status Picker's add chip is a child of its radio group

## The card

A child of KN-020, found by its roast.

**Why.** A radio group should hold only its radios; the add action is a separate control.

**Exit.** The add chip is a sibling of the radio group in one wrapping row that still lays it out
after the last choice, and a story finds it outside the group.

## Read before planning, 2026-09-15

- **The code.** `StatusPicker.tsx` renders MUI's `RadioGroup` as the file's wrapping row of
  choices, 427:571, 8 both ways and top aligned, and the dashed «+ وضعیت تازه» `ButtonBase` inside
  it after the radios, so a screen reader walking the group meets the chip among the choices.
- **Why it is inside.** The group is the row: a chip placed after the group as its sibling would
  follow the group's whole box, not its last choice, once the choices wrap.
- **Measured: two rows that hold both, built in the page, not in the code.** Round the real group
  and chip, 300 wide, in the dev Storybook, read from Chromium's own accessibility tree through the
  DevTools protocol, not from Playwright's computed roles. **A**, a flex row, wrapping, top aligned,
  8 both ways, with the group given `display: contents`. **B**, a block row in which the group is an
  ordinary inline element and each radio and the chip an inline item, top aligned, 8 after it and 8
  below it. In both, Chromium holds a radiogroup named «وضعیت» with the nine radios under it and the
  add button outside it, and lays out lines of 3, 3, 3 and 1 with 8 between items both ways and the
  chip after the last choice, first on its own line. B leaves the last line's 8 below it, 168 tall
  where A is 160. Firefox and WebKit are not installed for Playwright here.
- **What reads the chip.** Only `StatusPicker.stories.tsx`: `Default` and `ByKeyboard` find it
  inside the group, and the arrows play listens for keys on the group. The Add Job and Change Status
  modals render the picker whole, and no other story reads the chip or measures the group.
- **The keys.** `arrowsAcross` reads the radios inside the element that heard the key and that
  element's computed direction, which an inline group keeps.

## The approach

1. **The stories first.** `Default` finds the chip in the canvas and reads that the group does not
   contain it and that it shares the group's parent, the row; that it follows the last choice, on
   its line 8 beyond it or first on the next line 8 below it; and that the label stands 8 above the
   row. A new story, `Wrapping`, sets the picker 300 wide and reads the choices over more than one
   line, 8 between items both ways, and the chip outside the group after the last choice.
   `ByKeyboard` finds the chip in the canvas, and the arrows play listens on the canvas, so an arrow
   pressed on the chip is still heard outside the group.
2. **Before the fix**, the Status Picker stories run against the component as it is, and `Default`
   and `Wrapping` must fail, each at the chip found inside the group, and nothing else.
3. **The fix, B.** `StatusPicker.tsx` puts a row round the group and the chip that gives the last
   line's 8 back with a negative block end margin. The `RadioGroup` is `display: inline` round its
   radios, and each radio and the add chip is top aligned with 8 at its inline end and 8 at its block
   end, the file's 427:571 gaps. The group keeps its label, value, change and `arrowsAcross`, and the
   comment on the arrows says the chip is outside.
4. **The words.** Both story docs say the add chip follows the choices outside their group, so a
   screen reader does not count it among them, and carry `Wrapping`; DESIGN.md's Status Picker says
   the chip follows the group in the row from outside, KN-338.

## File by file

- `apps/web/src/shared/status-picker/StatusPicker.stories.tsx`
- `apps/web/src/shared/status-picker/StatusPicker.tsx`
- `apps/web/src/shared/story-docs/en/Shared-StatusPicker.md` and `fa/Shared-StatusPicker.md`
- `DESIGN.md`

## What I expect to be hard, and what I am unsure of

- **Why B and not A.** Both hold in Chromium, measured. A rests on `display: contents` keeping a
  role on the element it is set on, which browsers have failed to do before, and whether current
  Safari keeps a radiogroup so cannot be measured here. B uses no such property: the group is an
  ordinary inline element, and its role is not in question in any browser.
- **Margins in place of gap.** Inline flow has no gap, so each item carries 8 at its inline end,
  which can wrap a line up to 8 sooner than a flex gap would, and 8 at its block end, which the row
  takes back.
- **Inline items and their line.** Top alignment keeps each item at the top of its line, and no
  line grew past its items' 36 and 8, measured.

## How I will know it works

- `Default` and `Wrapping` fail against the component as it is, each at the chip inside the group,
  and after the fix the seven Status Picker stories pass.
- The Add Job and Change Status modals' stories, which render the picker, still pass.
- The unit project, the docs guard among it, lint and tsc are clean.
- Seen in the dev Storybook: the picker in fa-IR light and dark, in en-US and at 390, the chip after
  the last choice and outside the group in the accessibility tree.

## Plan review, 2026-09-15, Codex gpt-5.6-terra

It found the DOM and Chromium layout sound and the plan's A the straightforward flex route, the
radios' change handling and `arrowsAcross` unaffected and the stories' move to the canvas correct.
It read that Firefox has kept an element's role under `display: contents` since Firefox 112, Mozilla
bug 1494196, but that neither Safari's release notes nor WebKit guarantee a radiogroup, and asked
for a manual check in Firefox with NVDA and Safari with VoiceOver, saying not to ship the pattern if
either engine loses the group. It also asked for a committed narrow layout read, where the chip must
wrap after the last radio rather than after a box round the group.

Judged:

1. **The manual check in Firefox and Safari: not taken, and made unnecessary.** Neither browser nor
   either screen reader runs where this is built. B, measured beside A in Chromium's own tree, gives
   the same layout without `display: contents`, so the group's role no longer rests on how a browser
   treats that property. The plan builds B.
2. **A committed narrow read: taken**, as `Wrapping`, 300 wide.
3. **Measure the label's 8 to the row: already the plan.**

## Result, 2026-09-15

Built as planned after the review, B.

- Against the component as it was, `Default` and `Wrapping` failed, each at the chip found inside
  the group, and the other five passed.
- After the fix the seven Status Picker stories pass, and so do the Add Job and Change Status
  modals' stories, twenty of twenty. The first unit run after the fix failed two tests of
  `session.test.ts`: the first timed out at 5 seconds while the machine was loaded, KN-551's kind,
  and the second then counted a call twice. That file passed alone, and the whole unit project
  passed on its next run, 1494 of 1494. Lint and tsc are clean.
- Seen in the dev Storybook: `Default` in fa-IR light at 1000 and at 390, where its choices wrap
  onto three lines, `ByKeyboard` in fa-IR dark and `InEnglish` in en-US, each with the add chip in
  the row outside the radio group, in Playwright's tree of the row and in the page, 8 after the last
  choice on its line. `ByKeyboard` raised one console warning, Storybook's "Accessing the Story Store
  is deprecated", while its channel serialized the click event the add chip hands to `onAdd`, read
  from the warning's stack; the Bulk Action Bar's Jobs story raises it too, so it follows a click
  handed to a callback and not this change, and it is KN-624.
