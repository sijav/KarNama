# KN-255 - The other components' stories keep controls that make their play functions untrue

## The card

**Why**, from the board: As in KN-247, the Interactions panel's ticks are worth
something only if they describe the story on screen, and a Controls panel that
offers the Tooltip's children as text invites a reviewer to break every Tooltip
story.

**Exit condition**, from the board, as re-pointed on 2026-09-15: Every story with
a play function in the Checkbox, FilterChip, StatusChip, Tooltip and
PreferencesProvider story files reads its expectations from the active args or
offers only the controls its assertions hold for; none of them offers the
Tooltip's children or icon, or any control whose values the component cannot
take; KN-247's sweep over every story, each offered control changed by its type,
finds none of those stories broken; and those stories pass under Vitest.

**Re-pointed, 2026-09-15**, with a note on the card. It was filed on 2026-09-10
naming five components and asked for every story in every component. Measured
now, the fault is in 35 story files, so the card keeps the five it named and the
other thirty are KN-570 to KN-574, by area. Its old exit also asked for a
repository guard failing a story file whose play-function stories neither
declare nor disable their controls. That is a refusal the owner never asked for,
rule zero of `agent/RALPH.md`, so it was dropped; the rule is written down
instead, below.

## Measured, 2026-09-15

KN-247's sweep, `agent/scripts/verify/KN-247.mjs`, read the Input alone. Run over
every story of a production Storybook of 83877dc: each story opened once as it
is, then once per control it offers, the controls filtered as the panel filters
them, with that arg changed through Storybook's URL args by the control's type (a
boolean flipped, a text changed to `x7` and emptied, every other option of a
select or radio, a number moved by one). The verdict is Storybook's: the render
reaching the `errored` phase, or `playFunctionThrewException`.

- **372 stories in 438 seconds**, six at a time, **362 with a play function**,
  **155 of them broken by a control they offer, in 35 story files**.
- Failing with nothing changed, so not tried: AddJobModal `Review`, KN-559;
  JobModal's `ChangeStatus`, `Note`, `SaveAndDelete` and
  `StartsOverForAnotherRecord`, KN-494; Input `Multiline`, which passed alone.

The five this card keeps:

| File                | Story                            | Broken under                      | Offers                                          |
| ------------------- | -------------------------------- | --------------------------------- | ----------------------------------------------- |
| Checkbox            | Unchecked                        | checked, indeterminate            | checked, indeterminate, disabled                |
|                     | Checked                          | checked                           |                                                 |
|                     | Indeterminate                    | indeterminate                     |                                                 |
|                     | Hover                            | checked, indeterminate, disabled  |                                                 |
|                     | Disabled                         | checked, disabled                 |                                                 |
|                     | KeyboardOnly                     | checked, disabled                 |                                                 |
| FilterChip          | Default                          | label, count, selected            | label, count, selected                          |
|                     | InEnglish                        | label, count                      |                                                 |
|                     | Counting                         | count                             |                                                 |
|                     | Selected, Toggling, KeyboardOnly | selected                          |                                                 |
| StatusChip          | ColumnHeaderSize                 | label, size                       | status, label, size                             |
|                     | DisplayOnly, RenamedStatus       | label                             |                                                 |
|                     | FromArgs                         | status, label, size               |                                                 |
| PreferencesProvider | English, Persian                 | initialLocale, initialColorScheme | both, as text                                   |
| Tooltip             | all fifteen                      | none                              | title, placement, and children and icon as JSON |

**What the sweep cannot see**: a control it did not change, a JSON one or a value
Storybook's URL args refuse, which admit letters, digits, space, underscore and
dash; values other than the ones tried; and a branch a play takes only in the
runner, as Checkbox `Hover`'s pointer half.

## What else is there

- **The Docs page's Controls follow the first story.** `DocsPage.tsx` renders
  `<Primary />` and `<Controls />`, and the block shows the primary story's
  prepared arg types, which Storybook's `inferControls` has already trimmed to that
  story's `parameters.controls.include`, as `AGENTS.md` section 7 records; the
  block's own `include` and `exclude`, `@storybook/addon-docs`'s blocks at line
  7125, come from `parameters.docs.controls`. So a first story that offers fewer
  controls empties the page's panel as well. Checkbox's first story is
  `Unchecked`; FilterChip's `Default`; StatusChip's `Default`, which has no play
  and offers every control, KN-239; PreferencesProvider's `Persian`; the Tooltip's
  `OnHover`.
- **A story's `controls.include` replaces the meta's**: Storybook's
  `combineParameters` replaces an array and merges a plain object, in
  `preview/runtime.js`.
- **AGENTS.md section 4**, "Stories render from their args", says the Controls
  panel has to drive and show what is on screen, and that a story composing
  several instances spreads its args or disables the panel and says why. It says
  nothing yet of a story with a play function.

## The approach, file by file

The rule applied: **a story whose play pins a state offers only the controls its
play holds for**, through `parameters.controls.include`; **a story that
demonstrates the component through its args reads its expectations from them**;
a story whose play holds for no control disables the panel and says why in a
comment.

1. **Checkbox.** A new first story, `Default`, with no play, rendered from its
   args, so the Docs page keeps all three controls, as StatusChip's `Default`
   does; its entry in `story-docs/en` and `story-docs/fa`. Then `Unchecked`
   offers `disabled`; `Checked` offers `indeterminate` and `disabled`;
   `Indeterminate` offers `checked` and `disabled`; `Disabled` offers
   `indeterminate`; `KeyboardOnly` offers `indeterminate`; `Hover` disables the
   panel, since its play first asserts the unchecked, enabled resting edge, which
   each of the three controls changes.
2. **FilterChip.** `Default` reads its args: the chip's text is the label and the
   count in the story's locale's digits, `aria-pressed` is `selected`, and the edge
   is the one pixel one when unselected and none when selected, as `Selected`
   asserts today. `InEnglish` reads the label and the count the same way, in
   English digits. `Toggling` and `KeyboardOnly` expect `!args.selected`, the
   state the chip moves to. `Counting`, whose point is grouping in 1,234, offers
   `label` and `selected`; `Selected` offers `label` and `count`.
3. **StatusChip.** The chip is found without its name, as the one element with
   `dir="auto"` in the canvas, so an empty or changed label does not lose it.
   `FromArgs` reads `status` and `size` for its fill and height. `DisplayOnly`
   then holds for every control. `ColumnHeaderSize` offers `status` and `label`;
   `RenamedStatus` offers `status` and `size`.
4. **PreferencesProvider.** The two args get select controls whose options are
   `localeOrder` and the three scheme preferences, so no value the provider
   cannot take is offered, and the play reads the seeded state it asserts first
   from the args; the end state after the one click stays `en-US` and `dark`.
5. **Tooltip.** `children` and `icon` get `control: false` on the meta, so their
   rows stay in the table and no JSON editor is offered for a React element.
   `ReportsATriggerSwappedForOneThatCannotAttach` and
   `KeepsTheTriggersOwnDescription` render their own wrappers, which take the
   title alone, so each offers `title` and nothing else: a `placement` there would
   change nothing on screen.
6. **The sweep is committed**, `agent/scripts/storybook/controls-sweep.mjs`, since
   six cards' exits name it and the scratch copy dies with this session. It builds
   Storybook into a temporary directory unless given one, serves it at the root,
   sweeps every story or those an `--only` pattern names, writes what it saw to a
   JSON file and prints the broken stories. It is a measurement run by hand, wired
   into nothing.
7. **AGENTS.md section 4** gets the rule in words: a story with a play function
   offers only the controls its play holds for, or reads its expectations from
   its args, or disables the panel and says why; and the first story, whose
   Controls the Docs page shows, keeps every control that holds.

## How I will know it works

- **Red before**: the measurement above.
- **The committed sweep** over the five files on a production build of the
  change: no story broken, and no Tooltip story offering a JSON control.
- The five files' stories under Vitest; the unit project, whose guards read every
  story file and the docs; eslint; tsc.
- The five Docs pages opened in both languages, their Controls read: Checkbox's
  shows its three controls from `Default`.

## What I am unsure of

- **One try per control.** A boolean's flip covers it, but a text was tried as
  `x7` and empty and a number moved by one, so an include list holds for what was
  tried: FilterChip's `Default` under a count of zero, or a label long enough to
  wrap, is not measured.
- **FilterChip's `Default` branches on `selected`** for its edge. KN-279's blue
  selected edge will change that branch, as it will change `Selected`.
- **PreferencesProvider seeded with the end state** passes with its batching proof
  empty for that field. The seed stays `fa-IR` and `light` by default, and the play
  asserts the seed it was given.
- **A new Checkbox story** to keep the Docs page's Controls, against leaving
  `Unchecked` first offering only `disabled`.
- **Committing the sweep**: `AGENTS.md` section 3 holds a verifier under
  `agent/scripts/verify` to failing when what it checks is broken, proved by
  mutation; this is a measurement beside it, not a verifier of one card.

## Plan review, Codex, 2026-09-15

Almost sound, with one correction. The Checkbox `Default` story is right: the Docs
page's Controls are the primary story's arg types, which `inferControls` has
already trimmed to its `include`, so `Unchecked` offering only `disabled` would
have emptied the page's; the mechanism is corrected above, the block's own filter
reading `parameters.docs.controls`. `control: false` keeps a row and offers no
editor, as the ArgTypes documentation says. The other four files are classified
right, and PreferencesProvider seeded with the end state weakens its batching
proof without making the play false. **Missed**: the Tooltip's
`ReportsATriggerSwappedForOneThatCannotAttach` and
`KeepsTheTriggersOwnDescription` render wrappers that take the title alone, so
they would offer a `placement` that changes nothing; read in the file, and added
to step 5. The sweep is a measurement provided nothing wires it into closing, CI
or a required command, and it has to read the prepared arg types and honour
`disable`, `include`, `exclude` and `control: false`, which it does. Dropping the
guard is right under rule zero.

## Result, 2026-09-15

**Built as planned, with Codex's correction**: the Checkbox's `Default` first and
its include lists, `Hover` with no controls; FilterChip's `Default`, `InEnglish`,
`Toggling` and `KeyboardOnly` reading their args, `Counting` and `Selected`
leaving out their own point; StatusChip's chip found without its name, `FromArgs`
reading its label, size and status, `ColumnHeaderSize` and `RenamedStatus`
leaving out theirs; PreferencesProvider's two selects, its seed read from the
args; the Tooltip's `children` and `icon` given `control: false` and its two
wrapper stories offering `title`. The sweep is committed, and `AGENTS.md` section
4 says the rule. The lingui rule refused a bare `'S'` as a fallback size, so
`FromArgs` finds its measure by the arg alone.

**The sweep, fixed while checking**: its first run on the change still listed the
Tooltip's `children` and `icon` as offered, twenty-six of them. Storybook
prepares `control: false` as `{ disable: true }`, `normalizeInputType` at line
14195 of `preview/runtime.js`, and keeps the inferred type beside it; the sweep
read the type and not `disable`, which Codex's review had named. It skips a
disabled control now, as the panel does.

**Checked**:

- The committed sweep over every story on a fresh build of the change: 373
  stories in 427 seconds, 362 with a play function. In the five files, 50 stories,
  47 with a play, none broken, no change unapplied and none untried; no JSON
  control for an element anywhere but the Input's three stories KN-573 carries.
  Outside the five, 137 stories broken, the same 137 as the first sweep, so
  KN-570 to KN-574 stand as filed. Failing with nothing changed, as before:
  AddJobModal `Review`, JobModal's four and Input `Multiline`.
- Before the change, the same tool over the five: 18 broken, 30 JSON controls for
  an element.
- The five files' stories under Vitest, 50 of 50; the unit project 1383; eslint
  and tsc clean; the formatter at HEAD's drift, 33 for the Checkbox and 29 for
  FilterChip, none for the rest.
- The five Docs pages in both languages, their Controls read: the Checkbox's
  checked, indeterminate and disabled, from `Default`; FilterChip's label, count
  and selected; StatusChip's status, label and size; the Tooltip's title and
  placement, with `icon` and `children` drawn with no editor; PreferencesProvider's
  two as selects.

**Seen on the way**: StatusChip's and PreferencesProvider's Docs pages end with the
document at `lang="en-US"` under a Persian toolbar, as KN-090's note of 2026-09-11
describes: their pinned English stories render last.
