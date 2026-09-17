# KN-493 · Every column folds when its name is pressed, a control the design draws only for the collapsed column

From KN-477's review, W-03, C-05 and C-09.

**Why**, from the board: headers that fold on a press nobody can see coming hide a reader's work by accident, and a
weakened query stops proving what it used to.

**Exit**, from the board: only a column that starts folded folds again, from a header that shows the chevron its
collapsed header shows; other headers are not buttons; stories cover both, and the trigger query names its column
exactly.

## 1. The defect, read from source

`KanbanColumn.tsx` draws its expanded header as:

```tsx
{onCollapse ? (
  <ButtonBase disableRipple aria-expanded={true} onClick={onCollapse} sx={...}>
    <Title name={name} token={token} count={count} />
  </ButtonBase>
) : (
  <Title name={name} token={token} count={count} />
)}
```

There is **no icon in that branch**. The collapsed branch above it wraps the same `Title` and adds
`<Icon name="chevron-down" size="sm" color="inherit" />`, so a collapsed header visibly says it is a control and an
expanded one does not. `JobsScreen.tsx:541` passes `onCollapse` to EVERY column, so every expanded header's chip and
count became a button with no affordance: press a status name to read it and the column folds under you.

The owner reported only that the rejected column could not be folded again, which is the same defect seen from the
other side: the one column that is MEANT to fold is the one whose fold nobody could find.

## 2. What the design says, and what it does not

DESIGN.md's kanban section, on the collapsed state: "**Collapsed, the author's reading, not drawn in the file.** The
owner's rejected column, `رد شده ▸ 14`, is the column's frame holding its header alone, 300 by 64: one button with the
chip, the count and a chevron where the menu's icon was, which says it is closed and opens the column... The board
decides which column starts that way."

And the owner's own decision, KN-070: «رد شده» "stays as the last column, collapsed to a count by default... it
expands on click", and "the board renders it as `رد شده ▸ 14` until the user opens it."

So the file draws a fold control on the COLLAPSED header only, and says nothing at all about an expanded header
carrying one. It does not forbid re-folding; it is silent on it.

**That silence is decided by the card, not by me.** Its exit requires the folded column's expanded header to show
"the chevron its collapsed header shows". I am following that literally rather than stopping to ask, because it is a
small interaction detail the card already fixes, and because the alternative, a fold that cannot be undone, is the
trap the owner reported. DESIGN.md gains the sentence, marked as an author's reading exactly as the collapsed state
already is.

**Literally means the same glyph.** The icon set holds `chevron-down` and no up variant, `shared/icon/glyphs.ts`. So
the expanded fold button carries the same `chevron-down` the collapsed one does, at the same size and colour. A
rotation would be an invention on top of an invention. The plan review notes this is unconventional for a disclosure,
where closed and open usually point differently, and that it is a product decision the card makes rather than a
technical defect. Recorded here so it is a choice on the record and not an oversight.

## 3. Where the chevron goes, and what it displaces

A collapsed header has no menu: its button takes `...headerRow.sx` AND `width: '100%'`, so `justifyContent:
'space-between'` throws `Title` to the start and the chevron to the far end, which is why DESIGN.md can say the
chevron sits "where the menu's icon was". An EXPANDED header still has its menu there, so the chevron cannot have
that place. It goes inside the fold button, after the count.

`ButtonBase` is already `display: inline-flex` with `alignItems: center`, read from
`node_modules/@mui/material/ButtonBase/ButtonBase.js:51-53`, so the fold button needs a gap of `spacing.xs` and no new
flex container.

**What that displaces, and why it is not a broken rule.** `LongName` asserts the count sits 8 from the menu's icon,
which is `spacing.xs`, the header row's own gap. With the chevron between them there are now two gaps of that same
token, count to chevron and chevron to menu. The token is the rule; the single assertion measuring one gap is not.

## 4. Which columns get a fold control, and the trap in the obvious answer

**Not `isCollapsed`.** `JobsScreen.tsx:214` is
`const isCollapsed = (id) => (folded[id] ?? id === REJECTED) && dragExpanded !== id`, which is the column's CURRENT
state: it folds in the reader's own `folded` map and the temporary drag expansion. Gating `onCollapse` on it would
remove the control the instant the reader opened the column, so the rejected column could be opened once and never
folded again. **That is the owner's original complaint, reintroduced by the fix for it.** The plan review caught this
and it would have shipped.

The stable rule is factored out and both readers use it:

```ts
const startsCollapsed = (id: string) => id === REJECTED
const isCollapsed = (id: string) => (folded[id] ?? startsCollapsed(id)) && dragExpanded !== id
```

`onCollapse` is passed only when `startsCollapsed(column.id)`. Every other column gets none and renders a bare
`Title`, which is the existing else branch and needs no new code.

Giving the default rule a NAME is worth more than the line it costs: KN-544 is about what that rule should be, and it
now has one place to change rather than two expressions to keep in step.

## 5. The weakened queries, and why restoring them is safe

`KanbanColumn.stories.tsx` lines 122 and 250 ask for the menu with `/^(کارهای وضعیت|Status actions):/u`, a prefix that
stops at the colon and so matches any column's menu. The trigger is
`aria-label={`${i18n._('Status actions')}: ${name}`}`, so the half that was dropped is exactly the half that names the
column.

Restoring an exact name cannot collide with the fold button, measured from the components' own text: the fold button's
accessible name is `${name} ${count}`, which `Collapsed` already asserts with `toHaveAccessibleName`, while the
trigger's is `Status actions: ${name}`. They share no full name, and the `Icon` adds nothing to a name, which the
collapsed header already proves by carrying a chevron and still matching that assertion. **If the exact query fails,
that is a finding about the header and not a reason to loosen the query again.**

## 6. Scope

| file                                            | what changes                                                                                     |
| ----------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| `shared/kanban-column/KanbanColumn.tsx`         | the expanded fold button carries the chevron, with the header's gap                              |
| `screens/JobsScreen.tsx`                        | `startsCollapsed` is named, and gates `onCollapse`                                               |
| `shared/kanban-column/KanbanColumn.stories.tsx` | exact trigger queries, `LongName`'s gap assertion, and a story for a header that is not a button |
| `story-docs/en/Shared-KanbanColumn.md`          | `onCollapse` and the story entries say what is true                                              |
| `story-docs/fa/Shared-KanbanColumn.md`          | the same in Persian, which the guard requires                                                    |
| `DESIGN.md`                                     | the expanded fold control, marked as an author's reading                                         |
| this plan                                       | the record                                                                                       |

Baselines taken before any edit, every one drift 0 with no em dashes: `KanbanColumn.tsx`, `KanbanColumn.stories.tsx`,
`JobsScreen.tsx`, and both `Shared-KanbanColumn.md`.

## 7. What must not change

- **The collapsed header**, 300 by 64, one button, chip, count and chevron, which `Collapsed` measures.
- **The expanded header's 40**, which `Default`, `Expanded` and `LongName` all measure.
- **The menu trigger's position**, its icon 4 from the header's start, which `Default` and `LongName` both measure.
  `LongName` keeps that check; only its count-to-menu gap becomes two gaps.
- **`onExpand`'s meaning.** Only `onCollapse`'s reach narrows.
- **`aria-expanded`**, which stays on whichever header is a button and must not appear on one that is not.
- **`folded`'s per-session behaviour**, which `startsCollapsed` is factored out of rather than replacing.

## 8. The proof

A story for a column with no `onCollapse` whose header holds NO button but the menu, which is the case the owner met
on every column but one. `Expanded` keeps proving the fold works and gains the chevron's presence. `Collapsed` is
untouched. `LongName` keeps the menu's position and replaces its single gap with the two the chevron creates, both at
the header's own token. The trigger queries name their column exactly in `Default` and `LongName`, and still pass.

`JobsScreen.stories.tsx:390` already folds the rejected column from its open header, "And its open header folds it
again, KN-427." It must stay green, and it is the existing guard that the narrowing keeps the ONE column that matters.

The planted failure, and it is the one this card is really about: gate `onCollapse` on `isCollapsed` instead of
`startsCollapsed` and that board story fails, because the opened column loses its control.

Unit project too, not only the storybook one: `AGENTS.md` section 7 records that the guards read every story file, and
that a changed story has broken suites nobody ran.

## 9. What the review settled

Do not gate on `isCollapsed`; factor `startsCollapsed` and gate on that. Replace `LongName`'s count-to-menu assertion
rather than hoping it survives. `aria-expanded` is the right disclosure semantic and `aria-controls` is optional.
`disableRipple` removing MUI's default focus-visible styling is already answered by this component's own focus ring.
The repeated down chevron is a product decision the card makes, not a defect.
