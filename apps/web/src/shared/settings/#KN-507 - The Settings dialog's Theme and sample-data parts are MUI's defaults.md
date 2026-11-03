# KN-507 · The Settings dialog's Theme and sample-data parts are MUI's defaults, not the design's

Found looking at KN-480's dialog on 2026-09-14.

**Why**, from the board: two label styles sit one above the other in one dialog, and a gap or colour that does not come
from the tokens drifts from the design the moment a token changes.

**Exit**, from the board: in fa-IR and en-US, light and dark, the dialog's Theme label has the language label's Label
role, its gaps and colours resolve through the tokens, the three schemes and Load sample data behave as before, and
the SettingsDialog stories assert the label's style and the gaps.

## 1. One visible defect, and four things that already draw correctly

Measured before planning, because the card reads as five faults and only one of them changes a pixel.

**The visible one. The Theme label is the wrong type role and the wrong colour.** `FormLabel.js:50-51` draws
`palette.text.secondary` with `...theme.typography.body1`, and `theme.ts:88` maps `body1: role('body')`, so it is
**14/22 at weight 400 in text/secondary**. The Select directly above it, `Select.tsx:75-79`, draws the Label role from
`typeScale.label`: **12/16 at weight 500, letter spacing 0.2, in text/primary**. That is the card's "two label styles
one above the other", and it is the only part a reader can see.

**The card says the label is 16. It is 14.** MUI's stock `body1` is 16, but this theme overrides typography, so the
stock figure is not this dialog's. Worth recording because the number would otherwise have travelled into the docs.

**The four that are already right, and why they are still worth changing:**

- `gap: 3` at line 44 and `gap: 2` at line 89 are **12px and 8px**, not 24 and 16, because `theme.ts:71` sets
  `spacing: spacing['2xs']` and its own comment says "MUI's spacing unit is the 2xs step, so theme.spacing(2) is xs,
  (3) is sm". They draw the right measures through a unit that merely happens to align with the steps.
- `mt: loaded ? 2 : 0` at line 99 is 8px by the same arithmetic.
- `color: 'text.secondary'` at line 90 is the right colour: `theme.ts:80` maps
  `text: { primary: colour['text/primary'], secondary: colour['text/secondary'], disabled: colour['text/disabled'] }`.

So four of the five edits change **nothing drawn**. They remove a dependency on MUI's unit and palette keys, which is
the card's why: a value that reaches the screen by coincidence stops being right the moment someone changes the
coincidence. **The plan says so rather than presenting five fixes.**

## 2. What changes

| line | now                       | becomes                                                     |
| ---- | ------------------------- | ----------------------------------------------------------- |
| 44   | `gap: 3`                  | `gap: ${spacing.sm}px`, the same 12                         |
| 61   | bare `FormLabel`          | the Label role from `typeScale.label`, in `text/primary`    |
| 89   | `gap: 2`                  | `gap: ${spacing.xs}px`, the same 8                          |
| 90   | `color: 'text.secondary'` | `theme.karnama.semantic['text/secondary']`, the same colour |
| 99   | `mt: loaded ? 2 : 0`      | `${spacing.xs}px` or 0, the same 8                          |

The label's five values are taken from `typeScale.label` the way `Select.tsx` takes them, not written out, so the two
labels in this dialog cannot drift apart again.

## 3. What is NOT in scope, said out loud

**MUI's `Radio` stays.** There is no Radio of our own: `shared/` has a Checkbox and no radio, and DESIGN.md's radio
mentions are the Color Picker's swatches and the Status Picker's chips, each its own component. The card is explicit,
"Keep Theme as a choice of three schemes, as the owner kept it", so the control's drawing is a separate question and
this card does not open it. Naming that here stops the next reader assuming it was missed.

**`m: 0` on the note stays 0.** It is a reset of the paragraph's margin, not a spacing unit.

## 4. The proof, and where it has to live

**Not in a new story of its own, which an earlier draft of this plan got wrong.** The exit asks for the label's role
in fa-IR AND en-US, light AND dark. One story is one combination, and it would never see dark, where `text/primary`
and `text/secondary` are different colours. The four combination stories already exist and already share ONE play,
`languagesShown`, which opens the dialog and checks the flag and the language list.

So a SECOND shared helper measures the design, and each of the four stories runs both:

```ts
const shown: NonNullable<Story['play']> = async (context) => {
  await languagesShown(context)
  await drawnAsTheDesign(context)
}
```

Two helpers rather than one grown fat, because each then answers one question, which is the same reason `Preferences`
is left alone: it is about the callbacks and carries `restoreMocks: false` for KN-563. `languagesShown` ends on
Escape with the dialog still open, so the second helper can read it.

What `drawnAsTheDesign` measures, through `getComputedStyle`:

- the Theme label's size, weight and letter spacing against `typeScale.label`, the TOKEN, not a number typed here;
- the Theme label's colour against the Select label's rendered colour, which is how one assertion covers light and
  dark without a hex in the story;
- the two gaps against `spacing.sm` and `spacing.xs`.

**The planted failure**: put `gap: 3` back and it fails on the gap; take the label's role off and it fails on the
size. Each checked once, not kept.

Also run: the unit project, since `AGENTS.md` section 7 records that its guards read every story file and that a
changed story has twice broken a suite nobody ran.

## 5. Scope and baselines

| file                                         | what changes                                     |
| -------------------------------------------- | ------------------------------------------------ |
| `shared/settings/SettingsDialog.tsx`         | the label's role, and four values through tokens |
| `shared/settings/SettingsDialog.stories.tsx` | the second shared helper, run by the four        |
| `story-docs/en/Shared-SettingsDialog.md`     | the four entries say what is now measured        |
| `story-docs/fa/Shared-SettingsDialog.md`     | the same in Persian, which the guard requires    |
| this plan                                    | the record                                       |

No story is added, so no new docs entry is required; the four existing entries gain what their play now proves.

Baselines taken before any edit: `SettingsDialog.tsx` drift 0, `SettingsDialog.stories.tsx` drift 0, and **both
`Shared-SettingsDialog.md` files at drift 14**, which is pre-existing and is to be held exactly rather than tidied.
No em dashes in any of them.

DESIGN.md is not touched: nothing here decides anything the design has not already settled. The Label role is
DESIGN.md's line 207, 12/16 Medium with letter spacing 0.2.

## 6. The review this plan did not get

Handed to `roast.py plan --model gpt-5.6-terra` on 2026-09-17 and refused:
`gpt-5.6-terra is out of usage, it did not say when, so an hour is assumed. Every reviewer failed.` The model was
named deliberately, `AGENTS.md` section 7: the chain's reserve ends at Claude, and Claude must not review Claude's
own work, so naming terra makes the run FAIL rather than quietly break the owner's rule. It failed correctly.

**So this plan is built unreviewed, and that is recorded here rather than left silent.** The correction in section 4
is one I found myself, from reading `languagesShown` after writing the first draft. The review is retried before the
work closes, and if it lands with findings they become children of this card the way any roast's do.

## 7. Questions still open, for whichever review reaches this

1. The label's values are read from `typeScale.label` to match `Select.tsx`. This theme also maps
   `caption: role('label')`, so a MUI `variant="caption"` would name the same role. Is copying the Select's explicit
   five properties right, or does the shared variant say it better and keep the two labels in step by construction?
2. Four of the five edits change nothing drawn. Is that worth a card's worth of churn on a built dialog, or should
   this card be narrowed to the label alone and the decoupling left until a token actually moves?
3. The colour assertion compares two rendered labels rather than a token, so that one line covers all four
   combinations. Does that risk both being wrong together, and is the size, weight and spacing being checked against
   the token enough to catch that?
