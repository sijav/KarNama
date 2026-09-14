# KN-356 · The tab bar gives its place to the bulk bar

Beside the component, per `agent/RALPH.md` step 2b. Child of KN-027, from its
roast.

## The card

**Why.** On the phone, selection is how several job opportunities move or go at
once; two bars fighting for the foot of the screen hide one of them.

**Exit condition.** Navigation takes whether the page is selecting, below md the
tab bar is gone while it is and the Bulk Action Bar sits in its place, the
sidebar is untouched, and a story selects and sees one bar at the foot.

## What was wrong, when it was filed

Node `185:19`'s description says the tab bar gives its place to the Bulk Action
Bar during bulk selection. `Navigation` always rendered the fixed tab bar below
md and took no prop saying the page was selecting. The bar is fixed at the same
`zIndex.appBar`, 24 up from the bottom, so on a phone the two sat on top of each
other.

## What the groundwork built, 924e515

- `Navigation` takes `selecting?: boolean`. Below md, while it is true, it
  renders nothing, so the bulk bar has the foot of the screen to itself. Above
  md nothing changes: the sidebar is beside the page and the bulk bar floats
  over the content.
- `App` holds `selecting` and passes it to `Navigation`; `JobsScreen` and
  `NetworkScreen` report it through `onSelecting`, before the paint, so no frame
  shows both bars.
- The bar's own offset stays as the file draws it, 24 from the bottom.

The story was left, because a phone could not start a selection until KN-428.

## Measured, 2026-09-14

In Chromium with the Pixel 7 profile at 390 by 844, against the dev server, in
Persian with the sample data loaded, listing every element fixed to the screen
whose box reaches its lower 160 pixels:

- **At rest:** one, the tab bar, 390 by 72, flush with the bottom, and the
  `navigation` landmark «فضای کار» in the page.
- **With a card chosen by a held touch:** one, the Bulk Action Bar, the region
  «کارهای گروهی», 358 by 108, its two rows wrapped, 24 up from the bottom; no
  `navigation` landmark at all.
- **After the bar's own close, «لغو انتخاب»:** one again, the tab bar, as before.

So the exit condition's behaviour holds in the app. What is left is the story.

## The approach

1. **`Selecting`, a story of the shell**, in `App.stories.tsx`, because the
   selection is the page's and the tab bar the shell's, and only the shell holds
   both. In Persian, it:
   - loads the sample data from Settings, as `LaidOutAsTheFrames` does;
   - **on a desktop, 1440 by 900:** chooses a card by its checkbox, focused and
     pressed as the board's `Selecting` story does, and asserts the bulk bar is
     there and the sidebar still beside the page; lets the selection go with the
     bar's close;
   - **on a phone, 390 by 844:** counts one fixed element at the foot, flush
     with it and holding the `navigation` landmark, the tab bar; holds the first
     card with a synthetic touch until the bar comes up; counts one fixed element
     at the foot and asserts it is the bar, then that the bar is 24 up from the
     bottom, and only after the count that the landmark is gone; presses the
     bar's close and counts one fixed element at the foot again, the tab bar;
   - puts the viewport back after.
2. **No product change.**
3. **Its entry in `story-docs/en` and `story-docs/fa`, `App-Shell.md`.**

"One fixed element at the foot" is counted rather than read off roles, because
what the card is about is two things painted on top of each other at the bottom
of the screen, and a second bar drawn without a landmark would pass a query for
landmarks. The helper reads each element's computed `position: fixed`, skips
what is not drawn, keeps a box that meets the lower 160 pixels, and looks only
inside the story's canvas, so a dialog or a menu portalled into the body is not
counted.

## Proof that the story can fail

Two plants, one at a time. `Navigation` ignoring `selecting`, drawing the tab bar
whatever it says, must fail the count while the card is chosen; `App` passing
`selecting={false}` to it, the shell never told, must fail the same count, which
proves the wiring from the page to the shell and not only the component.

## What I am unsure about

- **The desktop half.** The sidebar being untouched is also a matter of the code
  never touching it; the story asserts it while a selection is live all the same,
  since that is what the exit condition names.
- **The count's window.** The lower 160 pixels take in the bar's 108 and its 24,
  and the tab bar's 72; a toast or snackbar fixed at the foot would count too,
  and none exists in the product today.
- **The helper.** A third copy of the small synthetic touch, beside the two in
  the board's and the card's stories, where KN-530 already asks that they say
  what they are; KN-428's roast found keeping them local to each file sound.
  This copy says what it is from the start.

## How I will know it worked

The story passes; each plant fails it at the count while a card is chosen, and
the restored files pass again; lint, tsc and the unit project's docs guard pass.

## Plan review, Codex, 2026-09-14

Codex, with web search, found the plan sound: one shell story is the proof,
since only it exercises the page telling `App` and `App` telling `Navigation`,
which a `Navigation` story with `selecting` set cannot; counting fixed elements
is more honest than roles for this defect, and the 160 pixel window holds both
bars. Two points, both taken: the count comes before the assertion that the
`navigation` landmark is gone, since either plant leaves the tab bar, landmark
and all, and would otherwise fail on the landmark first without proving the
count; and the helper decides by computed `position: fixed` and the box meeting
the lower window, never by roles or classes, scoped to the story's canvas.
