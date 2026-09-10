# KN-262 · FromArgs copies the Input's blank-error rule instead of sharing it

CHILD OF KN-011, the Input, and found by the KN-259 roast.

**Why, from the board.** A test oracle that restates the rule it checks drifts
silently the first time the rule moves. Critical on the owner's order of
2026-09-10, as a finding on a built component.

**Exit condition, from the board.** The blank rule lives in one module that the
Input and its stories both import, with no second copy of the pattern anywhere
under src; a unit test covers the rule's boundaries; and a mutation that widens
the rule in that module changes what FromArgs expects without editing the
story.

## Where it stands before this card starts

KN-261's plan check pointed out that "defined once" could not hold while
FromArgs carried its own copy, so KN-261 made the story import `isBlank` from
`blank.ts`, and its verifier already checks the first two clauses: the anchored
blank pattern exists in exactly one file under `src`, and `blank.test.ts` covers
the rule's boundaries. What is left is the third clause, and it is a proof, not
a change: no product code moves in this card.

## The approach

The proof has to show the story FOLLOWS the module, which is only visible when
the rule changes and the story is not touched. FromArgs leaves `error` unset,
and unset is blank under any rule, so the change has to be seen with an error
set, through Storybook's own URL args on a production build, the harness
KN-247's check already uses:

1. Widen the rule in `blank.ts` so that `x7` counts as blank, by adding letters
   and digits to the class. Build. Load FromArgs with `error: x7`. The Input
   drops the error, and FromArgs, asking the same `isBlank`, expects the helper:
   the play function must pass. That is the story's expectation changing with
   the module and nothing else.
2. The control that makes step 1 mean something: widen the rule the same way,
   but put the old copy back into FromArgs. Now the Input drops the error while
   the copy still expects `x7` as the description, and the play function must
   fail. Without this, step 1 would also pass for a story that asserted nothing.
3. Unchanged, FromArgs with `error: x7` passes too, since `x7` is a real message
   under the real rule, expected as the description by both.

## What I am unsure of

- Whether a production build per step is too slow for a verifier. Each is about
  ten seconds here and there are three; the price is paid once, at close.
- Reading the verdict: the errored render phase and playFunctionThrewException,
  recorded from the moment Storybook assigns its channel, as KN-247 found
  storyFinished reports success for a play function that threw.

## How I will know it worked

`node agent/scripts/verify/KN-262.mjs` runs the three steps above and requires
pass, fail, pass, and re-checks the first two clauses the way KN-261 does.

## The check, and what changed after it

The second model kept the pass, pass, fail control as sound and asked for two
changes, both taken:

- **Not three production builds.** The build harness reads Storybook internals,
  the preview's channel global and its story store, which an upgrade can break
  independently of the product. The configured Storybook Vitest browser project
  runs a story's play function through public API, so the verifier appends a
  temporary story, FromArgs with `error: 'x7'`, runs it there under each of the
  three states, and takes it out again. Nothing in KN-262's exit condition is
  about URL args.
- **A real "no second copy" guard.** KN-261's check looked for one literal
  prefix, which a copy with reordered classes, a `new RegExp` or a
  strip-and-compare would slip past. This one looks for the rule's building
  blocks anywhere under `src`, `\p{Cf}`, `\p{M}`, `Default_Ignorable_Code_Point`
  and a `trim()` emptiness test, and allows them only in `blank.ts` and in the
  catalog test's own contract, which KN-268 is about.

It also noted that mutation verifiers must run on a worktree nobody is editing,
which is the lesson KN-259 already recorded in `STATE.md`.
