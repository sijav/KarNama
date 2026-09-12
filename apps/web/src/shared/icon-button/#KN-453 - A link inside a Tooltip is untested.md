# KN-453 · A link inside a Tooltip is untested

Beside the component, per `agent/RALPH.md` step 2b. Written before the work.
Child of KN-447, from its roast.

## The card

**Why.** The mail control on the contact card is a link, and explaining an
icon-only control is exactly what a tooltip is for, so the untested combination
is the one the product actually ships.

**Exit condition.** A story wraps a Tooltip round an Icon Button with an `href`
and asserts the anchor carries the description and opens the tip on hover and on
focus.

## What is actually wrong

`InATooltip` wraps the **button** branch. `HandsBackItsElement` renders the
**link** branch with no Tooltip. Nothing covers the two together, so if the link
branch stopped spreading its trigger props both stories would stay green while a
tip on the contact card's mail control lost its ref, its description, MUI's
injected listeners and the clone marker MUI reads to decide whether its child
forwards props.

## The approach

One story, mirroring `InATooltip` on the other branch:

- a `Tooltip` round an `IconButton` with an `href`, named and titled through
  lingui as `InATooltip` is;
- assert the element is a **link**, not a button, and that it carries the
  address;
- assert it is described from the first render, before anything opens: the
  `aria-describedby` resolves to the tip's text;
- open it by hover, close it, open it by focus alone;
- assert neither component said anything at the console.

The console spy is the one thing to get right. KN-449 already records that
`InATooltip` installs its spy inside `play`, after the render, where it cannot
see the Tooltip's own synchronous report or MUI's mount-effect warning, and that
it replaces `console.error` instead of calling through. That card is open and
owns the fix for both stories; this one should not copy the broken shape, so the
new story installs its spy the way `BlankName` in the same file does.

## File by file

- `src/shared/icon-button/IconButton.stories.tsx` — the new story.
- `src/shared/story-docs/{en,fa}/Shared-IconButton.md` — its entry in both
  languages.

Nothing in the component changes: if the story fails, that is the finding.

## What I am unsure about

- Whether a tip on an anchor opens on **focus** the same way it does on a
  button. An anchor with an href is focusable, so it should, but that is the
  assertion most likely to surprise me.
- Whether asserting an empty console from a spy installed before the render
  will now catch something the existing story hides, in which case this card
  turns up a real defect rather than just covering a gap.

## Corrected after the plan roast, 2026-09-12

- **Focus is reached with Tab, not with `.focus()`.** MUI opens the tip only
  when the focus is keyboard-visible, so the story tabs to the link and asserts
  it has focus, the way a reader gets there.
- **The mutation I proposed would not have proved anything.** Dropping
  `{...trigger}` from the link branch takes the anchor's ref with it, so
  `HandsBackItsElement` fails too and the new story is not what caught it. The
  honest mutation keeps the ref and drops the description, the listeners and
  MUI's clone marker: then the ref story stays green and only the new one goes
  red.
- The story also asserts the link's accessible NAME is still its own, which is
  what proves `describeChild` did not turn the tip's text into the anchor's
  name.

## How I will know it worked

`npx vitest run --project storybook src/shared/icon-button` is green with the
new story, and the mutation above makes it fail while the other two stay green.
