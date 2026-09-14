# KN-446 · The Icon Button's TooltipTrigger type enforces nothing, and the runtime forwards more than it says

**Why, from the board.** A type that documents a boundary it does not enforce is
worse than none: the next reader trusts it and the tooltip breaks in a way
neither detector reports, because both only check aria-describedby.

**Exit condition, from the board.** What IconButton forwards and what its type
says it forwards are the same thing, and a comment says why the clone marker is
part of it.

## What is there, read 2026-09-14

- **The type**, `IconButton.tsx` line 26: `TooltipTrigger` picks six handlers,
  `onFocus`, `onBlur`, `onMouseOver`, `onMouseLeave`, `onTouchStart` and
  `onTouchEnd`, and `aria-describedby`; the `Opener` type beside it picks
  `aria-haspopup`, `aria-expanded` and `aria-controls`. Its comment says these
  are the props a trigger carries, "named and narrow rather than the whole of
  MUI's surface".
- **The runtime**, lines 150 and 157: each branch takes out the props it draws
  and spreads the rest, `...trigger`, onto MUI's button. The rest is whatever
  arrives, so the boundary is the type's claim and nothing else. TypeScript does
  not check a hyphenated JSX attribute against the props at all, and a
  `cloneElement` is not checked either.
- **What MUI's Tooltip clones onto its child**, `Tooltip.js` lines 483 to 537:
  its ref, the pointer, touch and focus handlers, a `className`, a `title` or a
  label depending on `describeChild`, the child's own props after its own, and,
  in development only, `data-mui-internal-clone-element`, which it reads back
  from the child's node after mounting, lines 504 to 509, logging that the child
  "is not forwarding its props correctly" when the node lacks it.
- **What reaches the Icon Button through our Tooltip**, `shared/tooltip/Tooltip.tsx`:
  it sets `describeChild` and passes an element as the title, so MUI's `title` is
  null; it clones the trigger's own `aria-describedby`, joined with the hidden
  description's id, KN-231 and KN-235, which MUI then keeps; and MUI's
  `className` is the empty string. So today the rest spread carries the six
  handlers, `aria-describedby`, the clone marker, an empty `className` and a
  null `title`.
- **The callers**, every `<IconButton` in `src` scanned for its attributes: they
  pass `aria-label`, `aria-haspopup`, `icon`, `iconSize`, `onClick`, `href`,
  `tone` and `ref`, and the stories spread their args. None passes a prop the
  type does not declare.
- **The detectors**: `InATooltip` and `ALinkInATooltip` watch the console, so
  MUI's forwarding error fails them, and our Tooltip reports a trigger whose node
  does not carry its description.

## The approach

1. **Forward exactly what the type declares, by name.** Each branch takes the
   declared trigger props out of the narrowed props, the six handlers,
   `aria-describedby`, the three opener attributes and the clone marker, and
   passes them to MUI's button one by one, instead of spreading the rest. The ref
   stays per shape, as KN-447 made it.
2. **The clone marker is declared**, `'data-mui-internal-clone-element'?:
   boolean` in `TooltipTrigger`, with the comment the exit asks for: MUI's
   Tooltip puts the marker on its child in development and reads it back from
   the child's node, so forwarding it is how the button shows MUI that it
   forwards what a Tooltip gives it; it is never set in a production build, so
   nothing is drawn from it there.
3. **The comment on the type says the boundary is now the runtime's too**: only
   these reach the element, and anything else a caller spreads in, a `title`, a
   class, a data attribute, is dropped.
4. **Not the other way round.** Widening the type to what the rest spread
   carries would be MUI's whole surface, which KN-310 chose against so that no
   caller reaches past the documented API.

## The tests

- **A story, `ForwardsWhatItDeclares`**: an Icon Button given its declared
  trigger props and, through a spread, three it does not declare, a data
  attribute, a `title` and a class; the button carries the declared ones, its
  handler runs on focus, and it carries none of the three. It fails on today's
  code, where the rest spread carries all three.
- **`InATooltip` and `ALinkInATooltip`** still pass: the tip opens on hover and
  on focus, describes the button, and nothing reaches the console.
- **Plants**: the marker left out of what is forwarded fails `InATooltip` on MUI's
  console error; the rest spread put back fails the new story on its data
  attribute.
- lint, tsc, the Icon Button's stories, the Tooltip's, and the stories of the
  screens and components that use an Icon Button in a Tooltip or with a menu,
  the Settings Control, the Language Switch and the network page.

## Files

- `apps/web/src/shared/icon-button/IconButton.tsx`.
- `apps/web/src/shared/icon-button/IconButton.stories.tsx`, and the new story's
  docs in both languages.

## What I am unsure of

- **The marker's name is MUI's internal one.** A MUI upgrade that renames it
  changes MUI's own check with it; the console watch in `InATooltip` is what
  would catch the button falling behind.
- **What is dropped**: MUI's empty `className` and null `title` change nothing
  today. If our Tooltip ever passed a string title, MUI would put a native
  `title` on the trigger, and the Icon Button would no longer draw it.
- **A future caller spreading an undeclared hyphenated attribute** gets no type
  error, since TypeScript does not check those, and the attribute is dropped;
  the story is what documents that.

## Plan review, Codex, 2026-09-14

Codex approved the plan. No current composition loses a prop it needs: our
Tooltip passes MUI no `className`, no `followCursor` and an element as its title,
so MUI computes no native `title`; the Language Switch needs its ref,
`aria-expanded` and `aria-controls`, all kept; Settings and the network page use
`aria-haspopup`; and the focus-visible class is made inside MUI's button, not
forwarded to it. Declaring and forwarding the marker is right for the installed
MUI, 9.4.0, and no type-only version of the rest spread could work, since a type
removes nothing at runtime. Taken from it:

- **The new story also finds the clone marker on the button**, among what is
  allowed through, beside the absence of the spread data attribute, title and
  class.
- **A correction to the plants.** `InATooltip`'s console spy starts in its play,
  after the button has mounted, so it is not what hears MUI's warning, which
  MUI raises from an effect as the child mounts; the storybook project's own
  console guard, installed before every render, is. Which of the two fails when
  the marker is left out is read from the plant's run, not assumed.
- **The cost it names is the boundary's own**: if our Tooltip one day passes a
  `className`, `followCursor` or a string title, the Icon Button has to name and
  forward that prop.

## Result, 2026-09-14

- **Red first.** On today's code `ForwardsWhatItDeclares` failed at line 424,
  the spread data attribute on the button, with every declared prop, the marker
  and the focus handler reaching it: the failure was the one aimed at.
- **The change.** `TooltipTrigger` declares the clone marker, with the comment the
  exit asks for; `forwarded` passes the declared trigger and opener props by
  name; each branch takes its ref out of the props once and forwards the rest
  through `forwarded`. Reading `props.ref` directly first failed the hooks
  linter's refs rule, which then treats every read of `props` in render as a
  read of a ref.
- **The docs.** react-docgen reads a key declared inline in the type as a real
  prop, so the props guard asked for an entry for the marker, and it has one in
  both languages, saying it is MUI's and never a caller's.
- **Green.** The Icon Button's stories pass, 11; the stories of the Tooltip, the
  Language Switch, the Settings Control, the Contact Card and the network page,
  48; the whole web unit project once the marker was documented.
- **Plants**, each restored byte for byte, checked by hash. The marker left out
  printed MUI's forwarding error in all three tooltip renders and failed
  `ALinkInATooltip`, whose spy is installed before the render, and
  `ForwardsWhatItDeclares` on its marker check. It did **not** fail
  `InATooltip`, whose spy starts in its play after MUI has logged, which is
  KN-449, now noted with this; and the review was wrong that the project's global
  console guard would fail it, since that guard hears React's own warnings only,
  KN-401. The rest spread put back failed `ForwardsWhatItDeclares` at line 424.
- **The rest.** tsc and lint are clean. `IconButton.tsx` was not the formatter's
  at HEAD, 61 differences then and 50 now; the stories file keeps the 4 it had.
