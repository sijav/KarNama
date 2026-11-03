# KN-768 · The extraction loading, Loading / Extract 1031:3818

**Why**, from the board: components before screens; the redesigned add flow
composes it, and cannot be built to the design until it exists.

**Exit**, from the board: a story per variant of 1031:3818 renders it in fa-IR
and en-US, light and dark, with both story-docs entries; every size, gap, radius
and colour resolves through the tokens and matches `get_design_context` on
1031:3818; `DESIGN.md` names the node, its states and its rules; lint, tsc and
its tests pass. The animation stops under prefers-reduced-motion.

## What the file draws, read 2026-11-03 with use_figma

Loading / Extract, `1031:3818`, three variants, Step=1, 2 and 3, each 102 by 86:
a vertical frame filled with `color/bg/surface`, 32 of padding on every side
that binds no variable, centring the Dots frame, 38 by 22, fixed and without a
layout, its own fill `color/bg/surface` and its item spacing bound to
`spacing/2xs`. In it three ellipses of 10 in `color/border/focus` at x 0, 14 and
28: the lit one at y 0 and opacity 1, the other two at y 8 and opacity 0.45.
Step 1 lights the left one, Step 2 the middle one and Step 3 the right one.

Each variant's prototype waits 0.3 s, After delay, and then changes to the next
variant, 3 back to 1, by Smart animate, ease in and out, in 0.25 s. The set's
description: only three dots, the strong one moving from left to right, 1, 2, 3,
1, each step 0.3 s, and no status text, the user's decision of 1 Aban.
DESIGN-HANDOFF.md says the same in its list of what is settled.
`get_motion_context` returns no nodes, since the motion is prototype
interactions, which the MCP does not export; the values above are read off the
variants' reactions with use_figma.

## The question the card said to ask

The card says to ask the owner whether the design leaves a fifty second cold
start unexplained. It does, on screen, and the owner has already decided so
twice: the node's description calls it the user's decision of 1 Aban, and the
designer's handoff repeats it. There is nothing to ask. What stays is what the
design does not draw: the status region keeps saying what is happening, and past
fifteen seconds why it is slow, out of sight, to a screen reader, and the app
keeps warming the server on load. DESIGN.md's "The Loading State says why it is
slow" and AGENTS.md's cold start paragraph are rewritten to say so. KN-616, the
turning arc the owner chose for the old node on 2026-09-15, is superseded by the
later decision and dropped.

## The approach

1. Redraw `LoadingState` in place rather than add a second component. Its one
   use, the add flow's Loading panel, gets the design at once, and its props,
   its status and the behaviour of KN-325, KN-326 and KN-362 stay. The line on
   screen goes out of sight and still names the panel through `lineId`.
2. The dots: a box 22 high carrying `dir="ltr"` as an attribute, which the RTL
   plugin does not mirror, so the lit dot steps left to right in both
   languages; three dots of 10, `spacing/2xs` apart, in `border/focus`, with
   Step 1 as their resting style. One keyframes is the left dot's cycle, hold
   300 and move 250 at ease-in-out, which is Figma's ease in and out, a cycle of
   1650 ms; each dot plays it a step after the one before by a negative delay,
   so the first frame painted is Step 1, KN-324. Under prefers-reduced-motion
   the animation is none, Step 1 standing still.
3. Stories: Reading, moving, read at each step's time and halfway through a
   move; Step1, Step2 and Step3 holding each variant still; InEnglish and Dark;
   ReducedMotion, reading the dots' rule for reduced motion off the style
   sheets and their resting frame with the animations taken off; the five
   behaviour stories kept, reading the out of sight line. Every motion story
   reads the standing frame for a viewer who asked for less motion, the failure
   KN-615 records.
4. Both story docs, DESIGN.md's entry and its component table row, and AGENTS.md's
   paragraph. The docs claim no speech that no screen reader was run to show,
   KN-619.

## What is hard, and what is unsure

- Figma's After delay timer: whether it starts when a variant appears or when
  its Smart animate ends. Figma's help defines the delay as time spent on a
  frame, and its own loading animation tutorial pairs an After delay of 100 ms
  with a Smart animate of 300, which only plays out if the delay counts from
  arrival; neither page says so outright. Both read on 2026-11-03: Prototype
  triggers, help.figma.com article 360040035834, and Create a loading
  animation, article 18892560291351. So each step holds 300 ms and then moves
  for 250, a step of 550, and the description's "each step 0.3 s" is the
  hold. Had the designer meant 300 ms in all, the cycle would be 900.
- The RTL plugin mirrors CSS `direction`, so the dots' physical order comes
  from the `dir` attribute, which it never sees.
- The lingui rule reads strings outside `sx` as copy, so the motion's
  transforms are written inside the dots' `sx`, and the one media query a story
  reads is exempted by name.
- The runner draws several story files in one page at once, so asking the
  browser for less motion from a story would reach the stories beside it, as
  the real pointer does, KN-365. A first version did, through a browser
  command; ReducedMotion reads the rule off the style sheets instead, and the
  headless look runs every story with reduced motion in a context of its own.

## How it is checked

The stories as tests in the storybook project: the frame's sizes, the dots'
positions, colours in both schemes, the motion paused at each step's time and
halfway through a move, Step 1 standing still under reduced motion, and the five
behaviour stories. A headless look at the three steps, English and dark, and
every story's play passing in the dev Storybook with reduced motion on. Lint,
tsc, the unit project, and the drift of DESIGN.md and AGENTS.md held.
