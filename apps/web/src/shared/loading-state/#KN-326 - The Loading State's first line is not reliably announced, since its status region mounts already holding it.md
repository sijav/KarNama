# KN-326 - The Loading State's first line is not reliably announced, since its status region mounts already holding it

## The card

A child of KN-022, found by its roast.

**Why.** A screen reader user who presses extract and hears nothing cannot tell the press
worked.

**Exit.** The status region is in the page before its first line is written, so the first line
is a change, and a story shows the region empty when it mounts and filled after.

## Read before planning, 2026-09-15

- **The code.** `LoadingState.tsx` puts `role="status"` on its outer Box, which holds the dots,
  hidden from assistive technology, and the line, a `<p>` whose text is there from the first
  render. So the region enters the page already holding its line.
- **Where it mounts.** `AddJobModal.tsx` renders the Loading State fresh when the flow's step
  becomes loading, inside a Box it focuses, so in the product the region is inserted together
  with its line each time a posting is read. KN-362, open, is about that focus target.
- **The precedents.** The Input keeps `<span role="alert">` in the page from the first render and
  empty until an error, KN-286; the Bulk Action Bar and the Sort Control keep an out of sight
  `role="status"` Box, a named one pixel edge and the usual clip, in the page and empty until
  they have something to say. The Settings dialog's region mounts holding its text, the same
  miss as this card's: filed as KN-618.
- **The tension.** KN-324 made the first painted frame the file's, the line included, so the
  visible line cannot wait.
- **Storybook's mount.** No story here destructures `mount` in its play yet. In
  `@storybook/react`, `renderToCanvas` awaits its act around `renderElement`, which calls
  `root.render` inside act and otherwise resolves on a layout effect; neither sets a timer.
- **Linted in memory** on the files' own paths, a component and a story of this shape draw no
  message, `react-hooks/set-state-in-effect` among the rules.

## The approach

1. **The story first.** `WritesItsFirstLineAfterMounting`, after `StartMovesPastFifteenSeconds`:
   its render is a Button, «Extract details», the add flow's own, that mounts the state, its
   Controls off since what shows is the story's own state. Its play presses the button with
   `fireEvent`, which Storybook runs inside its act, finds the region's three children, the
   dots, an out of sight span and the line, reads the region atomic and the dots and the line
   hidden from assistive technology, reads the span empty straight after the press, before any
   timer can run, and waits for it to hold the reading line. Against today's component it
   fails, since the region holds no span. It was first written with Storybook's `mount`, which
   the Docs page leaves out, below.
2. **The component.** The outer Box keeps `role="status"` and says `aria-atomic="true"`
   outright, so what a screen reader hears of the region is only what is not hidden, read
   whole. The visible line takes `aria-hidden` and still draws its text on the first frame.
   Between the dots and the line comes a span out of sight, the Bulk Action Bar's clip and named
   edge, empty on the render that mounts the state; an effect sets a timer of 100 ms that writes
   the line into it, and its cleanup clears the timer, so a state gone before then leaves nothing
   behind. After that the span says what the line says, the change at fifteen seconds included.
   The span is out of flow, so the dots, the gap of 16 and the line keep their places.
3. **A plant, taken out again**: the span written on the render that mounts it; the story must
   fail at its read of the empty span.
4. **The words.** The story gets its entry in both languages' story docs, and DESIGN.md's Loading
   State says the region is in the page empty when the state appears and its first line is
   written a moment after, so it is read out as a change.

## File by file

- `apps/web/src/shared/loading-state/LoadingState.stories.tsx`
- `apps/web/src/shared/loading-state/LoadingState.tsx`
- `apps/web/src/shared/story-docs/en/Shared-LoadingState.md` and `fa/Shared-LoadingState.md`
- `DESIGN.md`

## Plan review, 2026-09-15, Codex gpt-5.6-terra

Not quite as written; the accessibility shape confirmed, three amendments taken, one not.

- **Taken: `aria-atomic="true"` on the region.** A status region is atomic by default, and W3C's
  technique ARIA22 notes that some environments do not honour the default.
- **Taken: `parameters.docs.story.autoplay` on the new story.** A story that destructures
  `mount` draws nothing on a Docs page unless its play autoplays there, so its entry would be
  blank; the look opens the Docs page to see it drawn.
- **Taken: 100 ms, not a frame and then a zero delay timer.** No standard names a delay that
  every screen reader needs, and delivery from live regions varies between browsers and screen
  readers; the review names 100 ms as a common convention. It is one timer where the plan had
  two steps, and it also runs in a background tab, where a frame would wait. The effect's
  cleanup clears it.
- **Not taken: a manual pass with NVDA, JAWS and VoiceOver added to how this is known.** No screen
  reader runs where this is built, so the check could not be done here; the story proves the
  structure the exit names, a region empty when it mounts and written after, and nothing here
  claims more.

Not sent a second time: the amendments are the review's own.

## Found while building, 2026-09-15

- **A story that mounts in its play is left off the Docs page.** Written with `mount` and
  `parameters.docs.story.autoplay`, the story drew on its own page and in the runner, but the
  Docs page drew the four other stories and not this one, in both languages, measured in the
  dev Storybook. `@storybook/addon-docs`' Stories block filters out every story whose play uses
  `mount`, whatever autoplay says, and autoplay only lets a single Story block draw one, read in
  its `blocks.js`; `DocsPage.tsx` uses the Stories block. So the review's autoplay amendment was
  half right, and the story mounts the state from a button instead, pressed with `fireEvent`,
  which reads the span before any timer as `mount` did and draws on the Docs page like the rest.

## What I expect to be hard, and what I am unsure of

- **Whether 100 ms is enough for every screen reader.** It is a convention, not a guarantee, as
  the review says; the region at least exists empty for that long before its line arrives.
- **`mount` in a play** is new here: the runner and the story's own page take it, the Docs page
  only with autoplay.
- **The existing stories** find the region by its role and read its first child as the dots and
  its last as the line; the span sits between them, so both still hold.
- **Coverage.** The timer's callback runs in the new story, which waits for it; in the other
  stories the timer is cleared if the state goes before it fires.

## How I will know it works

- `WritesItsFirstLineAfterMounting` fails against today's component, and passes after the change
  with the other four stories.
- With the span written on the render that mounts it, it fails at its read of the empty span.
- The unit project, lint and tsc are clean, and every changed file's drift is what HEAD's is.
- Seen in Storybook in fa-IR and en-US, light and dark, the state looks as it did, its span
  holds the line, and the Docs page draws the new story's entry.

## Result, 2026-09-15

- The region says `aria-atomic`, its dots and visible line are hidden from assistive technology,
  the line still drawn from the first render, and between them an out of sight span is empty on
  the render that mounts the state and given the line after 100 ms, by a timer the effect's
  cleanup clears.
- `WritesItsFirstLineAfterMounting` mounts the state from «Extract details», pressed with
  `fireEvent`. Against HEAD's component, swapped in and put back byte for byte, it failed alone
  at its check of the region's three children, line 196, no span existing; with the span
  written on the render that mounts it, it failed alone at its read of the empty span, line
  202; after the change the five stories pass.
- The unit project 1496 of 1496, lint and tsc clean, and every changed file's drift what HEAD's
  was, DESIGN.md's 236 among them.
- Seen in the dev Storybook: in fa-IR and en-US, light and dark, the region's three children
  hidden as planned and the span holding the reading line, with no page error; on the Docs page
  in both languages the story's block is drawn with its button, and a press there filled the
  span. The first version, with `mount`, was left off that page, as above, and AGENTS.md
  section 7 records it.
- No screen reader was run: the story proves the region empty when the state mounts and
  written after, not that a given screen reader speaks it.
