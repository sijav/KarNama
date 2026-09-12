# KN-316 · The Button's states cannot be shown from its args

Beside the component, per `agent/RALPH.md` step 2b. Written before the work.

## The card

**Why.** The Button's states are what a reviewer compares with the file, and the
one place to look at them is Storybook; states that exist only during a test
cannot be reviewed.

**Exit condition.** A story shows every one of the 75 combinations at once or
through its controls, style, size and state, the transient states rendered from
args by a mechanism the component's users never see, and its play reads them
against node 31:4.

## What is actually wrong

`Button.tsx` draws hover, pressed and focus through CSS that only a real pointer
or keyboard can reach: `&:hover`, `&:active` and `&.Mui-focusVisible`. The
`Matrix` story drives them with `vitest/browser`'s own pointer, which exists in
the runner and NOT in the published Storybook, where it returns early. So a
reviewer opening Storybook sees 30 of the 75 combinations — five styles by three
sizes, at rest and disabled — and the other 45 exist only while a test runs.

75 = 5 styles × 3 sizes × 5 states (rest, hover, pressed, disabled, focus).

## The approach

The component keeps drawing the states exactly as it does. Beside each state's
own selector it gains an attribute selector that declares the same thing:

```ts
'&:hover, &[data-state="hover"]': { … }
'&:active, &[data-state="pressed"]': { … }
'&.Mui-focusVisible, &[data-state="focus"]': { … }
```

`data-state` is not a prop and nothing in the product ever sets it: a caller
would have to reach into the DOM to use it, which is the "mechanism the
component's users never see" the card asks for. It has precedent here —
`TOOLTIP_SURFACE` is a class on the drawn surface so a test can find the element
it means, KN-222.

The stories then render every combination from args: a `state` arg, and a small
story-only wrapper that puts the attribute on the rendered button. The Matrix
grows to 75 cells, all visible in the published Storybook, and its play reads
each one's fill and text against the same `LOOKS` table the component draws
from.

The real-pointer pass stays. It is the only thing that proves the ATTRIBUTE and
the PSEUDO-CLASS agree, which is the risk this approach carries: two selectors
for one state can drift, and then Storybook would show a state the browser never
draws. So the runner keeps hovering and pressing one button per style and
asserts the forced and the real look identical.

## File by file

- `src/shared/button/Button.tsx` — three selectors gain their attribute twin,
  with a comment saying why and that nothing in the product sets it.
- `src/shared/button/Button.stories.tsx` — the Matrix renders 75 from args;
  its play reads all 75; the pointer pass narrows to proving the twins agree.
- `src/shared/story-docs/{en,fa}/Shared-Button.md` — the story's entry in both
  languages.

## Corrected after the plan roast, 2026-09-12

Three things the plan had wrong, and one it had right:

- **The story cannot put the attribute on the button through JSX.** `Button`
  declares its props and forwards nothing else, so `data-state` passed as a prop
  lands nowhere. The story wraps each cell in a container that holds a ref and
  sets the attribute on the button inside it when the `state` arg changes.
- **A forced state must be the ONLY state on that cell.** As first written,
  moving the pointer across the matrix would add a real `:hover` on top of a
  forced focus, and the reviewer would be shown a state the file never draws. So
  every real transient selector is gated: `&:hover:not([data-state])`,
  `&:active:not([data-state])`, `&.Mui-focusVisible:not([data-state])`.
- **The expected colours stay independent of the component.** The stories
  already carry their own table read from the file, and sharing the component's
  `LOOKS` would let one wrong token change the implementation and the assertion
  together. The play keeps reading the story's own table.
- The roaster kept the attribute approach over the pseudo-states addon, because
  the focus visual is keyed to MUI's `.Mui-focusVisible` CLASS rather than to
  `:focus-visible`, which that addon cannot force, and because it would not give
  the state a control either.

It also asked for every visual property to be compared, not only the fill and
the text: Ghost's pressed opacity, and the focus ring, which is an outline on
four styles and Secondary's own inside edge on the fifth.

## What I expect to be hard, and what I am unsure about

- **Specificity.** `&:hover` and `&[data-state="hover"]` are both one class plus
  one simple selector, so the later declaration wins. Put them in ONE rule so
  there is no order to get wrong.
- **Disabled plus a forced state.** A disabled button should keep its disabled
  look whatever the attribute says; `.Mui-disabled` is a class and comes later
  in the sx, so it should win, but it needs checking rather than assuming.
- **Ghost's pressed opacity** is applied inside the `:active` rule, so it has to
  come along to the twin.
- Whether 75 cells in one story is actually readable, or whether it wants a
  control for the state and 15 cells at a time. The card says "at once or
  through its controls", so either satisfies it; I will start with all 75 and
  look at it.

## How I will know it worked

`npx vitest run --project storybook src/shared/button` is green, the play reads
all 75, the pointer pass shows the forced and real looks are identical, and the
published Storybook shows every state without a test running. Lint and tsc
clean, and looked at in both languages and both schemes.
