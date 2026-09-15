# KN-449 - The InATooltip story's console spy is installed too late to see what it claims to watch

## The card

**Why.** The story's strongest claim is that neither component complains, and as written it cannot
see a complaint.

**Exit.** The spy is in place before the render and calls through, and the story still passes.

## Measured before planning, 2026-09-15

- **Half the card is already done.** `InATooltip`'s play installs `spyOn(console, 'error')` with no
  implementation, so the spy calls through to the console as it was, KN-401's guard included:
  KN-522 made it so, and the story's comment says so.
- **The other half stands.** The spy still goes up inside `play`, after the render and its mount
  effects, and the reports it claims to watch come before that: the Tooltip reports a child that
  took no ref in its ref callback, and MUI one that took no props in a mount effect, as
  `ALinkInATooltip`'s comment records. The note KN-446 left on the card measured it: a build that
  dropped `data-mui-internal-clone-element` from what the button forwards printed MUI's warning in
  all three tooltip renders and failed `ALinkInATooltip` and `ForwardsWhatItDeclares`, but not
  `InATooltip`.
- **The pattern to copy is in the same file.** `BlankName` and `ALinkInATooltip` install their spy
  in `beforeEach` and put it back in the cleanup that `beforeEach` returns, and read
  `console.error` in the play.

## The approach

1. **The control first.** The same plant as KN-446's note, `data-mui-internal-clone-element` left out
   of what `forwarded` passes in `IconButton.tsx`, and the Icon Button's stories run as they are:
   `InATooltip` should pass while MUI warns.
2. **The spy moves into `beforeEach`**, `spyOn(console, 'error')` with no implementation, put back
   by the cleanup it returns, as `ALinkInATooltip`'s is. The play reads `console.error` instead of
   a binding of its own, its `try` and `finally` go, and the story's comment says the spy watches
   from before the render and why.
3. **The plant again**: `InATooltip` must now fail, beside `ALinkInATooltip` and
   `ForwardsWhatItDeclares`. The plant is taken out, and the file checked byte for byte.

## What I will change

- `apps/web/src/shared/icon-button/IconButton.stories.tsx`

## What I expect to be hard, and what I am unsure of

- **A Docs page runs `beforeEach` too**, so the spy is up there as well; it calls through, so the
  page's console reads as it did.
- **Storybook restores its mocks before a render**, in its loaders, which run before `beforeEach`,
  so a spy put up there lives through the render and the play. `BlankName` and `ALinkInATooltip`
  rely on the same, and this story writes no args, so no second render comes after the play starts.
- **KN-448's roast is reading this folder**, so nothing here is edited until it lands.

## How I will know it works

- With the plant, `InATooltip` passes before the change and fails after it.
- Without the plant, the Icon Button's stories pass, tsc, lint and the unit project pass, and the
  story file's Prettier drift does not grow.

## Plan review, 2026-09-15, Codex gpt-5.6-terra

Approved. `beforeEach` runs before Storybook renders the story and its cleanup after the story
unmounts, so the spy covers the ref callbacks, the mount effects and the play, and the hover and
the Tab change only the Tooltip's own state, rendering nothing again. Leaving the clone marker out
is the right plant in the Vitest runner, where MUI warns. A production Storybook runs the
`beforeEach` too, but MUI does not warn there, so it is no place for the proof.

## Built, 2026-09-15

- **The spy is up before the render.** `InATooltip` puts `spyOn(console, 'error')` up in
  `beforeEach`, with no implementation, so it calls through, and the cleanup `beforeEach` returns
  puts it back, as `ALinkInATooltip`'s does. The play reads `console.error`, its `try` and
  `finally` are gone with their lines moved out one level, and the comment above says why it
  watches from before the render.
- **Before the change, the card was right.** With MUI's clone marker left out of what `forwarded`
  passes, MUI warned that the Tooltip's child does not forward its props, and of the eleven stories
  `ALinkInATooltip` and `ForwardsWhatItDeclares` failed while `InATooltip` passed.
- **After it, `InATooltip` fails too** under the same plant, beside the other two. `IconButton.tsx`
  was put back byte for byte each time, and the eleven stories pass without the plant.
- **Checks.** tsc and lint pass. The story file's Prettier drift is unchanged at 4, and this plan's
  is 0.
- **Tests.** The unit project passed except `session.test.ts`, whose two tests overran their 5 s in
  the full run, KN-551, and passed alone.
- **No look.** Nothing a reader sees changed.
