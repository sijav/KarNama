# KN-455 - A disabled Button with a forced state draws something node 31:4 never draws

## The card

**Why.** The hook exists so a reviewer can trust that what Storybook shows is what the file draws.
A combination that draws a state the file does not define is the one thing it must not make
possible.

**Exit.** A disabled button shows its disabled look whatever `data-state` says, and a story renders
one to prove it.

## Measured before planning, 2026-09-15

- **The card holds against today's code.** In `Button.tsx`'s `sx`, the `hover` and `pressed`
  attribute twins come before `&.Mui-disabled`, and the `focus` twin after it. The disabled rule
  sets only the fill and the text, at the same weight as the twins, so it wins those two where it
  comes later, and it sets no opacity and no ring. So a disabled Ghost forced to `pressed` keeps its
  0.9 opacity, and any disabled button forced to `focus` draws the ring, the outline or Secondary's
  two pixel edge. A forced `hover` sets only a fill and a text, which the disabled rule replaces.
- **Nothing renders it today.** `Forced` in the stories sets `data-state` only for the three
  transient states and disables only the disabled row, and nothing in the product sets the
  attribute.
- **What node 31:4 draws disabled**, read with use_figma from its three sets, `33:58` M, `37:10` S
  and `37:71` L: all fifteen Disabled variants at opacity 1 with no effect, Secondary's with its one
  pixel edge inside and the others with none; the three Ghost Pressed at 0.9; and the Focus
  variants with two pixels outside, or inside on Secondary.
- **The browser never puts a disabled button in any of the three**: it takes no pointer and no
  focus, so the real pseudo-classes never match one.

## The approach

1. **The story first.** `DisabledWhateverItsState` renders every style in every size, disabled,
   once for each transient state, forced as `States` forces it, and reads each cell: the attribute
   is on and the button is disabled; the disabled fill and text; opacity 1; and no ring,
   Secondary's edge at one pixel and every other style's outline at none. It should fail against
   today's code on Ghost's opacity and on the rings.
2. **`Forced` takes `disabled`**, so a cell can be disabled and forced at once, disabled when it is
   given or when its state is `disabled`. `States` gives none, so it renders as it does.
3. **Each attribute twin refuses a disabled button**, `:not(.Mui-disabled)` on the `hover`,
   `pressed` and `focus` twins, so a forced state is drawn only where the browser could draw the
   real one, and the comment above the twins says so. Not chosen: resetting the opacity and the ring
   in the disabled rule, which makes every later state twin a new thing to reset.
4. **The docs**: both Button pages gain the story's entry.
5. **A look** at the new story in fa-IR and en-US from the dev Storybook: forty-five greyed buttons.
   It is pinned to light, since its colours are read against the light tokens, as every Button
   story is.

## What I will change

- `apps/web/src/shared/button/Button.stories.tsx`
- `apps/web/src/shared/button/Button.tsx`
- `apps/web/src/shared/story-docs/en/Shared-Button.md`, `apps/web/src/shared/story-docs/fa/Shared-Button.md`

## What I expect to be hard, and what I am unsure of

- **The first paint.** The attribute lands in a ref callback during the commit, so a disabled cell
  is never drawn in a forced look first, and MUI's easing of the fill has no earlier look to run
  from. The story reads the cells once rendered, which is what the exit asks.
- **Weight.** With `:not(.Mui-disabled)` the twins weigh three classes where they weighed two. They
  match no disabled button, and on an enabled one they beat only what they beat before; Secondary's
  focus edge is nested under its twin, so it still replaces the resting edge.
- **`.Mui-disabled` or `:disabled`.** The disabled rule already reads MUI's class, and the Button
  never renders a link, so the class and the pseudo-class name the same buttons here; that is one
  of the questions for the review.
- **The docs guard** wants the new story in both languages.

## How I will know it works

- The story fails before the change, on Ghost's pressed opacity and on the focus rings, and passes
  after it.
- `States`, `Matrix`, `KeyboardFocus`, `Playground` and `WithIcons` still pass; tsc, lint and the
  unit project pass, the docs guard among them; and no changed file's Prettier drift grows.

## Plan review, 2026-09-15, Codex gpt-5.6-terra

Approved. `.Mui-disabled` is the right gate: the Button always renders MUI's own, MUI puts the class
on it exactly when it is disabled, and the disabled rule already reads it. The gate raises the
twins' weight only on enabled buttons and changes no outcome there, since focus still follows
pressed and still replaces Secondary's resting edge. It is simpler and safer than teaching the
disabled rule to undo every transient effect, now and later. The story covers all forty-five
combinations, and the ref callback puts the attribute on during the commit, before a paint, in the
runner and in a production Storybook alike.

## Built, 2026-09-15

- **The story came first.** `DisabledWhateverItsState` renders the fifteen styles and sizes
  disabled in each of the three transient states, forced as `States` forces them, and reads all
  forty-five: the attribute on, the button disabled, the disabled fill and text, opacity 1, and no
  ring beyond Secondary's own edge. Against the component as it was, it failed at the first
  disabled Ghost forced to pressed, "expected 0.9 to be 1", while the other five Button stories
  passed.
- **The gate.** The `hover`, `pressed` and `focus` twins in `Button.tsx` each carry
  `:not(.Mui-disabled)`, and the comment above them says a forced state is drawn only on an enabled
  button. `Forced` takes `disabled`. With the gate, all six Button stories pass.
- **The mutations**, one gate taken off at a time and the file put back by hash: without the focus
  gate the story fails, and without the pressed gate it fails. Without the hover gate it passes,
  since the disabled rule already replaces the fill and the text a forced hover sets, so that gate
  keeps the three twins alike and changes nothing drawn today.
- **The docs.** Both Button pages describe the story, in English and in Persian.
- **Checks.** tsc and lint pass, run before the story's two widest lines were written as Prettier
  writes them, which changes no token; the story file's drift stays at 64, and the component's,
  both docs pages' and this plan's at 0.
- **Tests.** The unit project passed except `session.test.ts`, one of whose tests overran its 5 s in
  the full run, KN-551, and passed alone.
- **The look.** In fa-IR, right to left, and en-US, left to right, the story's forty-five buttons are
  all disabled and forced, at opacity 1 with no outline, greyed as the Matrix's disabled row is,
  with no console error. Light only, as the story pins it.
