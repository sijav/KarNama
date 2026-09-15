# KN-362 - Reading a posting moves focus to an unnamed box rather than to the status that says what is happening

## The card

A child of KN-029, found by its roast.

**Why.** Focus is how a screen reader user learns where they are after the button they pressed
disappears.

**Exit.** Focus goes to an element named by the loading message, or to the status region itself,
and a story reads the focused element's accessible name.

## Measured before planning, 2026-09-15

- **Chromium's own accessibility tree**, read through CDP on the add modal's `Loading` story: the
  focused node is `generic` with the name "", the `Box` with `tabIndex` -1 around the Loading State
  at `AddJobModal.tsx:220`. The `status` inside it has the name "" too.
- **A status is never named by its text.** ARIA takes the `status` role's name from its author
  alone, so focusing the status as it stands would still land on an element with no name.
- **The spoken line comes late.** The Loading State writes its line into the status 100 ms after
  the region appears, KN-326, while the add modal moves focus on the render that shows the step, so
  a name taken from that line would be empty as focus arrives. The line on screen, a `p` with
  `aria-hidden`, holds the message from the first frame and changes past fifteen seconds.

## The approach

1. **The story first.** The add modal's `Loading` story reads the focused element once the status
   shows: it has the accessible name «داره آگهی رو می‌خونه…» and it is the status. Run against
   today's code first; it must fail on the empty name.
2. **The status takes focus.** The Loading State gives its status `tabIndex` -1 and no outline, names
   it by the line on screen through `aria-labelledby` and an id from `useId`, and takes a `ref` for
   its status, which React 19 hands a component as a prop. The add modal passes its `loadingPanel`
   ref to the Loading State, and its `Box` keeps the layout alone, without `tabIndex`.
3. **The other way**, for the review to weigh: the add modal's `Box` takes a role and
   `aria-labelledby` the line, which needs the Loading State to take the line's id instead.
4. **The words.** DESIGN.md's add modal paragraph says the status takes focus, named by its line;
   both Loading State story docs describe the prop the Loading State gains.

## What I will change

- `shared/loading-state/LoadingState.tsx`: the `ref`, `tabIndex` and `aria-labelledby` on the
  status, and an id on the line on screen.
- `shared/add-job/AddJobModal.tsx`: the ref handed to the Loading State, the panel without focus.
- `shared/add-job/AddJobModal.stories.tsx`: `Loading` reads the focused element's name.
- `story-docs/en/Shared-LoadingState.md`, `story-docs/fa/Shared-LoadingState.md`, `DESIGN.md`.

## What I expect to be hard, and what I am unsure of

- **A focused live region may be heard twice**, once by its name as focus lands and once as its
  line is written 100 ms later. No screen reader runs on this machine, so this is not measured.
- **A name taken from an `aria-hidden` element.** The accessible name computation follows
  `aria-labelledby` into hidden content; whether every screen reader speaks it is for the review.
- **`ref` and the docs guard.** If react-docgen lists `ref`, both story docs describe it.
- **Past fifteen seconds** the name follows the line, since `aria-labelledby` reads the element as
  it is; whether a story should prove that is open.

## How I will know it works

- `Loading` fails against today's code on the empty name and passes after, and Chromium's tree
  reports the focused node as the status with the message as its name.
- The Loading State and add modal stories, the unit project, lint and tsc are clean; the loading
  panel is seen in fa-IR and en-US, light and dark.

## Plan review, 2026-09-15, Codex gpt-5.6-terra

Not approved as written. It found the ref sound in React 19 and a name taken from an `aria-hidden`
line allowed, since the name computation reads referenced hidden content. Judged, all three taken:

1. **Not the status: the panel takes focus.** A `status` is a polite live region, and MDN's page
   on the role says focus is not moved onto one while it updates. The add modal's panel `Box` keeps
   `tabIndex` -1, takes the role `group` and `aria-labelledby` the Loading State's line on screen,
   and the status stays unfocused and unnamed. This is the other way step 3 above named, and it
   replaces step 2.
2. **The first sentence is said once.** Focus names the panel by the message, and KN-326's line,
   written into the status 100 ms later, would say it again. So the Loading State takes
   `announceFirstLine`, true by default, and the add modal passes false: the status then stays
   empty for the first line and speaks only when the line changes past fifteen seconds. The Loading
   State on its own keeps KN-326's delayed first line. It also takes `lineId`, the id the add modal
   names its panel by, put on the line on screen.
3. **The stories.** The add modal's `Loading` reads that the focused element is a `group` holding
   the status, with the message as its accessible name, and that the status's spoken line is still
   empty after its 100 ms. A Loading State story given `announceFirstLine` false reads the spoken
   line empty at first and holding the slow line once the start moves past fifteen seconds, since a
   changed name alone is not an announcement.

What this leaves unproved: that a screen reader speaks the focused group's name, on which the quiet
first line relies. No screen reader runs on this machine.

## Points

Raised from 1 to 3 on 2026-09-15: two Loading State props, the add modal's panel, two stories and
both docs.

## Plan review again, 2026-09-15, Codex gpt-5.6-terra

Approved after one amendment, taken: told not to speak its first line, a Loading State whose wait
already began more than fifteen seconds ago speaks the slow line at once, so no state is silent for
good. The spoken line is empty and then the first line after 100 ms by default; empty until the
wait turns slow when `announceFirstLine` is false and the start is fresh; and the slow line at once
when it is false and the start is already past. `SpeaksTheSlowLineAtOnce` proves the last, beside
`SpeaksOnlyALaterLine` for the middle.

## Built, 2026-09-15

- **Stories first.** Against today's code `Loading` read the focused element's role as null,
  `SpeaksOnlyALaterLine` heard the first line after 100 ms, and `SpeaksTheSlowLineAtOnce` read an
  empty spoken line; all three pass now.
- **As reviewed.** The add modal's panel is a `group` named through `aria-labelledby` by the Loading
  State's line on screen, and the status is neither focused nor named. The Loading State speaks
  `line` when `announceFirstLine ? written : slow`, which gives the three cases the second review
  named.
- **Not proved.** That a screen reader voices the focused group's name, on which the quiet first
  line relies; no screen reader runs on this machine.
