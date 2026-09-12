# KN-356 · The tab bar gives its place to the bulk bar

Beside the component, per `agent/RALPH.md` step 2b. Child of KN-027, from its
roast.

## The card

**Why.** On the phone, selection is how several job opportunities move or go at
once; two bars fighting for the foot of the screen hide one of them.

**Exit condition.** Navigation takes whether the page is selecting, below md the
tab bar is gone while it is and the Bulk Action Bar sits in its place, the
sidebar is untouched, and a story selects and sees one bar at the foot.

## What is actually wrong

Node `185:19`'s description says the tab bar gives its place to the Bulk Action
Bar during bulk selection. `Navigation` always renders the fixed tab bar below
md and takes no prop saying the page is selecting. The bar is fixed at the same
`zIndex.appBar`, 24 up from the bottom, so on a phone the two sit on top of each
other.

## The approach

- `Navigation` takes `selecting?: boolean`. Below md, while it is true, it
  renders nothing: the tab bar is simply not there, so the bulk bar has the foot
  of the screen to itself. Above md nothing changes at all, because the sidebar
  is beside the page and the bulk bar floats over the content.
- The shell passes it. `App` knows nothing about selection today; the screens
  hold it. So the selection has to reach the shell: the simplest honest route is
  that the screens tell it, which means lifting "is anything selected" out of
  the screens, or a small piece of shared state.
- The bar's own offset stays as the file draws it. It is 24 from the bottom
  either way; the tab bar's 72 is what was covering it.

## What I am unsure about

- **How the shell learns.** Three shapes: a callback from each screen up to
  `App`, a context that any screen can set, or moving the selection itself into
  a provider. The first is the least machinery and the most wiring; the second
  is what the preferences and records already do here.
- Whether removing the tab bar while selecting is right, or whether it should
  stay and the bulk bar sit above it. The file's own description says it gives
  its place, so the file settles it.
- What a reader does to get the tab bar back: clearing the selection, which the
  bar's own close already does.

## How I will know it worked

A story at a phone's width with a selection live shows the bulk bar and no tab
bar, and the same story with nothing selected shows the tab bar; the desktop
story is unchanged.
