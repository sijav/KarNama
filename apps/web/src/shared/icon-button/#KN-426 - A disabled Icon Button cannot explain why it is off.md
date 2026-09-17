# KN-426 · A disabled Icon Button cannot explain why it is off

**Why**, from the board: an icon-only control that is off is the case a tooltip exists for. With no text and no
explanation, a reader is left with a grey square and no way to find out why. The design draws that explanation for the
blocked delete, `259:295`, and the Menu gives it; an Icon Button cannot.

**Exit**, from the board: a Tooltip wrapped round a disabled Icon Button opens on hover and on focus and says why the
action is off, and whatever is decided about the tab order is written down in `DESIGN.md`; a story asserts it.

## 1. The card's stated mechanism is wrong, its own note said so, and the note is right

The card says "the browser fires no pointer events on a disabled control". That is not the mechanism. What actually
happens, read rather than recalled:

- `IconButton.tsx` line 193 passes `disabled` straight to `MuiIconButton`, which sets the NATIVE attribute. A natively
  disabled button is not focusable, so there is no focus trigger.
- MUI then adds `.Mui-disabled`, which its own styles give `pointer-events: none`, so there is no hover trigger. Read
  from the installed package rather than from memory, as this repository requires: `ButtonBase.js` carries
  ``[`&.${buttonBaseClasses.disabled}`]: { pointerEvents: 'none', cursor: 'default' }``, and `buttonBaseClasses`
  generates that `disabled` class. So the rule really is keyed on the class MUI adds for the native prop, which is what
  makes section 3's styling trap real rather than theoretical.
- `Tooltip.tsx` line 101 CLONES its child to inject `aria-describedby`. It does not wrap it in a span, which is the
  thing MUI documents for exactly this case.

So the card's CONCLUSION holds, a Tooltip round a disabled Icon Button cannot open, while its stated reason does not.

**And the card's evidence cannot be checked.** It says a story that hovered a disabled button failed with
`pointer-events: none` and "was taken out again rather than left red". Two `git log -S` searches over the icon-button
directory find no such story in any commit, so it was never committed. Nothing here rests on it.

## 2. What the records disagreed about, and what the owner ruled

Two sets of records pointed opposite ways for analogous controls, which is why this went to the question card rather
than being decided quietly.

| says out of the tab order                                                      | says reachable so the reason can be read               |
| ------------------------------------------------------------------------------ | ------------------------------------------------------ |
| `en/Shared-IconButton.md` 37 and 85                                            | `DESIGN.md` 668 to 670, the blocked delete             |
| `fa/Shared-IconButton.md` 35 and 82                                            | `Menu.tsx`, `disabledItemsFocusable` + `aria-disabled` |
| `IconButton.stories.tsx` `Disabled`, tabbing and expecting no `BUTTON` focused | `DESIGN.md` 697 to 699, the card's folded controls     |

**The owner ruled on 2026-09-17: reachable, like the Menu.** `aria-disabled` rather than `disabled`, `onClick` guarded,
so the button stays hoverable and focusable and its Tooltip opens and says why it is off.

Worth recording plainly: **nothing in the product passes `disabled` to an Icon Button today.** Every call site found is
a `gate-fixtures` file using MUI's own component as a lint fixture. So this settles a rule, as KN-433 did for the
`href` and `disabled` pair, which was also latent when it was fixed.

## 3. The change, file by file

- **`IconButton.tsx` line 193.** `aria-disabled={disabled}` in place of `disabled={disabled}`, following `Menu.tsx`,
  and `onClick` guarded so a press does nothing while it is off. The guard covers the keyboard too: Enter and Space
  reach the same handler.
- **`IconButton.tsx` line 153, the FIRST trap.** The drawn state is keyed `'&.Mui-disabled'`. MUI adds that class only
  for the native prop, so the moment `disabled` stops being passed the selector matches nothing and the 0.7 opacity and
  `text/disabled` colour SILENTLY disappear, with every existing assertion still green because they read computed style
  on a button that is no longer disabled at all. It becomes `&[aria-disabled='true']`.
- **`IconButton.tsx` line 152, the SECOND trap, which the review found and I had not.** The hover fill is
  `'@media (hover: hover)': { '&:hover': { backgroundColor: hover.fill, color: hover.icon } }`. Today it can never
  apply to a disabled button because MUI suppresses its pointer events; the moment that suppression goes, **hovering a
  disabled button lights it up**. The disabled rule sets `opacity` and `color` and NOT `backgroundColor`, so nothing
  after it overrides the fill. The hover selector therefore excludes the state:
  `'&:hover:not([aria-disabled="true"])'`. This is the review's headline warning made concrete: the attribute selector
  replaces the visual selector, not MUI's pointer event suppression, so the appearance has to be defended separately
  from the reachability.
- **`IconButton.stories.tsx` `Disabled`**, and the review sharpened all of this. `toBeDisabled()` becomes an
  `aria-disabled="true"` assertion. The tab assertion inverts, and it must name a SPECIFIC button rather than checking
  `activeElement.tagName`: that story renders two, neutral and danger, so the old shape would pass on either and is
  weaker than the decision it claims to prove. It asserts **zero activations**, that pressing while off calls `onClick`
  never, since the guard is the only thing stopping it now. And it asserts the drawn state SURVIVES A HOVER, which is
  the second trap above: 0.7 and `text/disabled` still hold while the pointer is on it, and the hover fill does not
  arrive.
- **A new story**, modelled on `InATooltip` in the same file, which already asserts the two clauses this exit names:
  hover opens the tip, unhover closes it, Tab focuses the button and the tip appears on focus alone, with
  `console.error` spied from before the render and asserted untouched.
- **SIX doc entries, three per language, and the count started at four.** The obvious ones are the `### disabled` prop
  entry and the `### Disabled` story entry in each file. The other two were found only by opening the `### InATooltip`
  entry to use as an anchor for the new story's: it already cited KN-426 and repeated the card's WRONG mechanism, "the
  browser fires no pointer events on one", in English and in Persian. So each language holds a third site, doubly wrong
  now, since the mechanism was never the browser and the button can do this after today. Correcting some and leaving
  the rest is the failure KN-701, KN-708 and KN-711 each shipped, and an earlier draft of this bullet said four.
- **`DESIGN.md`.** The rule the owner settled, written where the Icon Button's states are recorded, so the next reader
  meets it beside the drawn states rather than in a card.

## 4. What must not change

- **The drawn state.** 0.7 opacity and `text/disabled` are node `460:672`, and this card changes reachability, not
  appearance. If the visual assertions pass only because the selector stopped matching, the card has broken the thing
  it claims to leave alone.
- **The focus ring**, keyed on `.Mui-focusVisible`, which keeps working precisely because the button stays focusable.
- **KN-433's union.** `IconButtonLink` still takes `disabled?: never`; the link branch is untouched. An anchor with
  `aria-disabled` that still navigates is the defect that card removed.
- **`Menu.tsx`.** It already does this and is the precedent, not the subject.

## 5. The proof

The new story is the exit, almost word for word: a Tooltip round a DISABLED Icon Button, opening on hover and on focus
and saying why.

**No control run was performed, and this says so rather than implying one.** Against the component as it was, the story
would fail at both triggers: a natively disabled button takes no focus, and MUI suppressed its pointer events, so
neither the hover nor the Tab step could have opened a tip. That is reasoning from the mechanism in section 1, which is
read from MUI's own source, and NOT a run I made. Performing it would mean reverting the component to prove a
prediction, which is the regression work the owner retired on 2026-09-11. An earlier draft of this paragraph asserted
the failure flatly, which would have carried into the evidence as something I had watched happen.

**The file list I sent the review was wrong, and that is worth recording rather than quietly fixing.** It named
`Menu.tsx` and `Tooltip.tsx`, which section 4 says are precedents that must not change, and omitted the two story-doc
files and `DESIGN.md`, which section 3 says do change. The review caught the contradiction between my own two lists.
This is the SECOND time this session: KN-711's list named `App.tsx` as changed when that card read it. The list is a
claim about scope and belongs to the plan, not to the command line. **The real set is five files**: `IconButton.tsx`,
`IconButton.stories.tsx`, both `Shared-IconButton.md`, and `DESIGN.md`, plus this plan.

`Disabled` keeps asserting the drawn state, so the styling trap in section 3 is caught rather than assumed. `tsc` and
`eslint --max-warnings 0` clean. Drift at or below baseline on every file touched: `IconButton.tsx` measured 50 before
the edit and `IconButton.stories.tsx` 4, so neither may be formatted; the two docs measured 0 and may be. `DESIGN.md`
measured 236 and keeps its 9 em dashes, with none added anywhere.

## 6. Questions for the review

1. `aria-disabled` with a guarded `onClick` leaves the button in the tab order and pressable by Enter and Space, with
   the handler refusing. Is refusing in the handler right, or should the press be stopped earlier, as `Menu.tsx` does
   it at the item?
2. **Answered by me rather than asked**, since I could search for it: there is NO fourth site. Every other
   `.Mui-disabled` in `src` belongs to a different component with its own native `disabled`, `AuthScreen.tsx` 83,
   `Button.tsx` 181 to 190, `Checkbox.tsx` 222, and none of them touches an Icon Button. The three sites in section 3
   are the complete set. What I would still like told is whether the CONSEQUENCE below is acceptable.

   **This makes the Icon Button the only component in the repository styled off `aria-disabled`.** The Button, the
   Checkbox and the auth screen all key on `.Mui-disabled`, because they all still pass MUI the native prop. That is a
   deliberate difference and not an oversight, but a reader meeting `&[aria-disabled='true']` in one component and
   `&.Mui-disabled` in three others will ask why, so `DESIGN.md` records the reason with the rule: an icon-only control
   has no text, so it is the one case where the reason for being off has to be readable.

3. The exit says a story asserts the tab-order decision. `Disabled` asserting reachability plus the new story asserting
   the tip: is that both halves, or is the tab order still under-asserted?
