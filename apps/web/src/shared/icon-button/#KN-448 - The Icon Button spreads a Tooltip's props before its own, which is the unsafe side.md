# KN-448 - The Icon Button spreads a Tooltip's props before its own, which is the unsafe side

## The card

**Why.** The ordering is the whole of the component's contract with a Tooltip, and it is currently
right by accident and commented wrongly.

**Exit.** The injected props are spread last, and the comment says what that protects.

## Measured before planning, 2026-09-15

- **The order is still the one the card names.** Both branches of `IconButton.tsx` render
  `MuiIconButton` with `ref`, then `{...forwarded(rest)}`, what a Tooltip injects, then
  `{...shared}`, the button's own `aria-label`, `disableRipple`, `onClick` and `sx`, then `disabled`
  or `href`.
- **Two of the card's claims are out of date.** The comment it quotes, defending `aria-label` and
  `disabled` against a spread that could not hold them, went when KN-446 made the button forward a
  Tooltip's props by name through `forwarded`, and no comment says anything about the order now.
  And the stories no longer check `aria-describedby` alone: `InATooltip` and `ALinkInATooltip` open
  the tip by hover and by Tab, and `ForwardsWhatItDeclares` reads a caller's `onFocus` arriving.
- **Nothing collides today.** `forwarded` names `onFocus`, `onBlur`, `onMouseOver`, `onMouseLeave`,
  `onTouchStart`, `onTouchEnd`, `aria-describedby`, `aria-haspopup`, `aria-expanded`,
  `aria-controls` and MUI's clone marker, and `shared`, `disabled` and `href` name none of them. So
  the order changes nothing a reader or a story sees today; it decides what happens the day the
  button sets one of those names itself.
- **MUI 9.4.0's Tooltip composes the child's own props**, read in
  `node_modules/@mui/material/Tooltip/Tooltip.js`: it clones its child with `onFocus`, `onBlur`,
  `onMouseOver` and `onMouseLeave` made by `composeEventHandler` from its own handler and the
  child's, and with touch handlers that call the child's. The child's props are the ones the caller
  put on `IconButton`, not what the button hands MUI inside.

## The approach

1. **Plant a collision first.** An `onFocus` of the button's own, which logs a marker, goes into
   `shared`, and the Icon Button's stories run in today's order. It replaces the focus handler the
   Tooltip composed, so `InATooltip` and `ALinkInATooltip` should fail on the tip opening by Tab,
   and `ForwardsWhatItDeclares` on the caller's `onFocus`.
2. **`forwarded` leaves out a name it was not given**, as the plan review asked: each name is passed
   only when a caller or a Tooltip gave it, so a name nobody gave replaces nothing.
3. **Spread `forwarded` last in both branches**, after `shared` and after `disabled` or `href`.
4. **Plant the same collision again, twice.** With the logging plant, what a Tooltip injects now
   wins inside one, so every story passes. With a plant that throws its marker instead, the run
   reports the marker from `KeyboardOnly` alone, whose button is in no Tooltip and given no
   `onFocus`: the button's own handler still runs where nothing is forwarded, and nowhere else. A
   throw, because the run in today's order printed the logged marker only from the stories that
   failed, and none from `KeyboardOnly`, whose Tab focuses its button, so a log cannot show where a
   passing story's handler ran. Each plant is then taken out, and the file checked byte for byte
   against the change.
5. **The comment says what the order protects and what it costs**: nothing the button sets of its
   own can replace the focus, pointer and touch handlers and the description a Tooltip gives it, or
   an opener's state a caller gives it; a name nobody gave replaces nothing; and a handler of the
   button's own under one of those names is dropped whenever one is given, so it has to be composed
   with the forwarded one, never set beside it. It sits above the two branches, with the comment on
   why there are two.

## What I will change

- `apps/web/src/shared/icon-button/IconButton.tsx`

## What I expect to be hard, and what I am unsure of

- **Leaving out what was not given, and keeping the types.** The names stay listed one by one,
  KN-446's boundary, each passed only when it is defined, rather than filtered through
  `Object.entries`, which would type the result loosely.
- **No story can fail on the order alone today**, since nothing collides: the planted collision,
  run in both orders, is the proof.
- **The card's two stale claims** are recorded here rather than rewritten on the card.

## How I will know it works

- In today's order the plant fails `InATooltip`, `ALinkInATooltip` and `ForwardsWhatItDeclares`,
  measured before building: exactly those three failed of the eleven. In the new order the logging
  plant fails nothing, and the throwing plant's marker is reported from `KeyboardOnly` alone.
- Without the plant, the Icon Button's stories pass, tsc, lint and the unit project pass, and
  `IconButton.tsx`'s Prettier drift does not grow.

## Plan review, 2026-09-15, Codex gpt-5.6-terra

Not approved as written: the order is right, but forwarding every name as `undefined` when it was
not given is not. Spread last, such a name would erase a prop of the button's own on a button in
no Tooltip at all, which is worse than a Tooltip's contract. Taken: `forwarded` leaves out what it
was not given, a handler of the button's own under one of those names is composed with the
forwarded one, and the plant also shows the button's own handler running where nothing is
forwarded. It found the rest sound, MUI's composition as the plan reads it, and the card's stale
prose no change to its exit. The amended plan goes back to it before building.

## Second plan review, 2026-09-15, Codex gpt-5.6-terra

Approved. Leaving out what was not given keeps a plain Icon Button's own props, while a Tooltip's
or a caller's still win where they exist, and composing a handler of the button's own with the
forwarded one is the explicit decision to make the day one is needed. The logging plant proves the
Tooltip's focus handling and the caller's `onFocus` survive the last spread, and the throwing plant
proves the button's own handler still runs where nothing is forwarded.

## Built, 2026-09-15

- **`forwarded` leaves out what it was not given.** Each of its eleven names is passed only when it
  is defined, one conditional spread each, so the result keeps its types and a name nobody gave
  replaces nothing.
- **It is spread last in both branches**, after `shared` and after `disabled` or `href`. The comment
  above the branches says what that protects, the focus, pointer and touch handlers and the
  description a Tooltip gives, which MUI has already composed with the caller's, and an opener's
  state, and that a handler of the button's own under one of those names is composed with the
  forwarded one.
- **In today's order**, before the change, the logging plant failed exactly `InATooltip`,
  `ALinkInATooltip` and `ForwardsWhatItDeclares` of the eleven stories, and printed its marker from
  those three alone.
- **In the new order** the logging plant failed none of the eleven. The throwing plant left all
  eleven passing with one unhandled error carrying its marker, which Vitest traced to
  `KeyboardOnly` as the latest test, the only story that focuses a button with nothing forwarded.
  Each plant was taken out, and the file checked by hash.
- **Checks.** tsc and lint pass, run before the rewrap below, which changes no token.
  `IconButton.tsx`'s drift first came out at 54 against its 50, the last conditional spread running
  past the width; that spread is now written as Prettier writes it, over three lines, and the drift
  is back to 50. This plan's is 0.
- **Tests.** The Icon Button's eleven stories pass on the final file, and so does the whole unit
  project, 1506 tests.
- **No look.** Nothing a reader sees changed.
