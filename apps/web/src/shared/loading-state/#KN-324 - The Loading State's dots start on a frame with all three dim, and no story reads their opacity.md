# KN-324 - The Loading State's dots start on a frame with all three dim, and no story reads their opacity

## The card

A child of KN-022, found by its roast.

**Why.** The first frame is the one a fast answer shows and the one a screenshot catches, and
the file draws the middle dot lit.

**Exit.** The first painted frame is the file's, the middle dot at 1 and the others at 0.4, and
a story reads the three opacities at the start and one turn later.

## Read before planning, 2026-09-15

- **The file.** Node `159:92`, the Loading State on the Components canvas, read with use_figma:
  the Dots frame `159:98` holds three ellipses of 10, 4 apart, in `#2563eb`, and only the
  middle one, `159:100` at x 14, is at opacity 1; `159:99` and `159:101` are at 0.4. The
  component has no reactions, and its description asks for the motion in code, naming a
  `spinnerArc` that should turn, which the node does not draw.
- **The code.** `LoadingState.tsx` turns each dot through keyframes of 0.4 at 0 percent, 1 at
  16.667, 0.4 at 33.333 and 0.4 at 100, over 900 ms, with delays of -900, -600 and -300 ms.
- **Measured** in the dev Storybook this session started, the Reading story, each dot's one
  animation paused and put at a time: at 0 the three read 0.4, 0.4 and 0.4, and a read taken
  before any pause, every current time at 0, read the same; the middle dot first reads lit at
  450; and a lit dot reads 0.999988, not 1, since 16.667 percent of 900 is not 150.
- **The stories** check the dots' size, colour and duration and that their three delays
  differ, never an opacity. `InEnglish`'s comment says the first dot takes the first turn, and
  its story docs, in both languages, that the dots take their turns from the left.
- **Less motion.** In the dev Storybook with Playwright's `reducedMotion` at reduce, the dots
  stand still at 0.4, 1 and 0.4, the file's frame, but Reading's play throws in
  `drawsTheFrame`, which reads a duration of 0.9s: filed as KN-615, a child of KN-022. The
  helper this card adds changes nothing for that reader, since the play throws before it.
- **DESIGN.md**, the Loading State: the moment the middle one is lit is the file's frame, and a
  reader who asks for less motion gets that frame standing still, which the code's base
  opacity draws.

## The approach

1. **The story first.** A helper in `LoadingState.stories.tsx`, called from `Reading`, takes
   each dot's one animation, waits for it to be ready, pauses it, puts it at a time and reads
   the three opacities: at 0, the first frame painted, 0.4, 1 and 0.4; at 300, one turn later,
   0.4, 0.4 and 1. It plays them again in a `finally`. Against today's component it must fail
   at 0.
2. **The component.** The keyframes put the lit moment at the cycle's ends, 1 at 0 and 100
   percent and 0.4 at 16.667 and 83.333, the same turn moved by half a turn, and each dot's
   delay is how many turns ago it was lit: the middle one now, 0; the one before it one turn
   ago, -300; the one after it two, -600. The lit dot still travels from the inline start to
   the inline end, and the base opacity, the reduced motion frame, is unchanged. The comment
   says the motion starts on the file's frame.
3. **A plant, taken out again**: the delays reversed, so the lit dot travels the other way; the
   story must fail at 300.
4. **Words the change makes wrong.** `InEnglish`'s comment, and its story docs in both
   languages, say the lit dot travels from left to right, not that the first dot takes the
   first turn. DESIGN.md's Loading State says the motion starts on the file's frame, and that
   the description names a spinning arc the node does not draw.

## File by file

- `apps/web/src/shared/loading-state/LoadingState.stories.tsx`
- `apps/web/src/shared/loading-state/LoadingState.tsx`
- `apps/web/src/shared/story-docs/en/Shared-LoadingState.md` and `fa/Shared-LoadingState.md`
- `DESIGN.md`

## Plan review, 2026-09-15, Codex gpt-5.6-terra

Approved, after one amendment to the helper.

- **Taken, as confirmation.** At 0 the new delays give 0.4, 1 and 0.4, and at 300 0.4, 0.4 and
  1; the lit dot travels the way it did; 1 at both 0 and 100 percent makes the boundary at 900
  safe; negative delays start each dot inside its cycle, where a positive delay would lean on
  the base opacity while later dots had not begun; nothing else reads the delays; and the
  reduced motion frame is still the base opacities.
- **Taken: wait for each animation's `ready` before pausing it.** The review says a pending
  animation's current time can be unresolved and `pause()` may throw then. The probe read the
  pending animations at a current time of 0, which is resolved, so that case does not arise
  here; waiting costs one `await`, so the helper waits.
- **Not taken: a frame between the seek and the read.** `getComputedStyle` resolves style when
  it is read, and the probe's reads after each seek, one after another in one task, gave each
  time its own opacities.

## What I expect to be hard, and what I am unsure of

- **Whether a paused animation at 0 is the frame painted first.** A CSS animation is pending
  until its first frame and holds its current time at 0 meanwhile, and the read taken before
  any pause, every current time at 0, drew the same three opacities as the seek to 0.
- **The iteration boundary.** One turn later the third dot's active time is exactly 900, the
  start of its second iteration; the keyframes' 100 percent is 1 as well as their 0, so either
  side of the boundary reads 1.
- **Playing the dots again** leaves them a turn on from where they were, all together, which
  nobody can see.

## How I will know it works

- `Reading` fails at 0 against today's component, and passes after the change with the other
  two stories.
- With the delays reversed, `Reading` fails at 300.
- The unit project, lint and tsc are clean, and the DESIGN.md drift stays what HEAD's is.
- Seen in Storybook, the dots' first frame is the file's in fa-IR light, en-US light and fa-IR
  dark; en-US dark has no story, since `InEnglish` pins the light scheme.

## Result, 2026-09-15

- The dots are lit at the ends of their cycle, 1 at 0 and 100 percent and 0.4 at 16.667 and
  83.333, and each is delayed by how many turns ago it was lit: -300, 0 and -600 ms. The base
  opacity is unchanged.
- `Reading` failed at 0 against the old component, the middle dot 0.4 where 1 was expected,
  and passes after the change with the other two stories; with the delays reversed it failed
  at 300 alone, and `LoadingState.tsx` was put back byte for byte.
- The unit project 1494 of 1494, lint and tsc clean, and every changed file's drift what HEAD's
  was, DESIGN.md's 236 among them.
- Seen in the dev Storybook at device scale 2: in fa-IR light, en-US light and fa-IR dark the
  frame first shown read 0.4, 1 and 0.4 with every animation at a current time of 0, and the
  screenshots show the middle dot lit; a turn on, the last dot read 1, which the Persian
  screenshot shows at the left.
- KN-615 carries the stories' failure under reduced motion.
