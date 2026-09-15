# KN-325 - A Loading State whose startedAt moves past fifteen seconds shows the reading line for a render first

## The card

A child of KN-022, found by its roast.

**Why.** The component promises the slow line for a wait already past fifteen seconds, and a
status region reads out every change.

**Exit.** A startedAt already past fifteen seconds shows the slow line on its first render,
whether mounted with it or changed to it, and a story changes it while mounted.

## Read before planning, 2026-09-15

- **The code.** `useSlow` keeps in state the start it has seen run past, `pastFor`, and says
  slow only while `pastFor` is the current start; an effect keyed by the start sets a timer for
  what is left of the fifteen seconds, and the timer sets `pastFor`. Mounted with a start
  already past, the state's initializer sets `pastFor` at once, so that case is right today.
- **Measured** in the dev Storybook this session started: each story's `startedAt` changed
  while shown, through the preview's own args update, the way the Controls panel changes it,
  to twenty seconds back, with every text of the line recorded. From `PastFifteenSeconds` the
  slow line became the reading line 4 ms after the change and the slow line again 2 ms later,
  two changes for a status region to read out. From `Reading` the line kept the reading line
  through the render and became the slow line 6 ms after the change.
- **The lint.** The web workspace turns on eslint-plugin-react-hooks 7.1.1's recommended
  rules, `purity`, `set-state-in-render` and `set-state-in-effect` among them, read with
  ESLint's own `calculateConfigForFile`. Linted in memory on the file's path, `useSlow`
  returning `pastFor === start || untilSlow(start, Date.now()) === 0` fails `react-hooks/purity`
  for calling `Date.now` while rendering, where a clock read inside a snapshot handed to
  `useSyncExternalStore` lints clean, as the file does today.
- **The runner applies no args update** to a story, AGENTS.md section 7, so a play cannot move
  `startedAt` through its args, and no story in the repository changes a prop while mounted.
- **The catalogs** are `src/i18n/locales/en-US.ts` and `fa-IR.ts`, written by hand, and
  `catalog.test.ts` holds every id the code uses to both, refusing one nothing uses and one left
  in English. AGENTS.md section 3 still names a `.po` file and an extract step the app does not
  have: KN-617.

## The approach

1. **The story first.** `StartMovesPastFifteenSeconds`, after `PastFifteenSeconds`: its render
   holds the start in state, begun when the story shows, beside a Button, «Move the start
   back», that moves it to twice fifteen seconds before the press; its Controls are off, since
   the start is the story's own state and not an arg. Its play records every text the line
   shows with a MutationObserver, presses the button with testing-library's `fireEvent`, which
   Storybook's React preview runs inside its own act, and reads the slow line straight after,
   before any timer can run; presses it again, from one start past fifteen seconds to another,
   and reads the slow line again; and, after one more microtask, so the observer's records have
   arrived, finds the record never held the reading line after the first press. Against today's
   component it must fail at the first read.
2. **The component.** `useSlow` reads an outside store for each start, made with `useMemo` and
   read with `useSyncExternalStore`. Its snapshot is whether that start is past fifteen
   seconds, taken from the clock on the first read and kept, so React's repeated reads agree.
   Its subscription sets a timer for what is left, for a start already past as for any other,
   where it fires at once and changes nothing, and the timer marks the store past and tells
   React. React reads the snapshot while it renders, so a start already past shows the slow
   line on the render that gives it, mounted or changed, a move from one start past to another
   changes no text, and a clock set back after the timer fired does not take the line back.
3. **A plant, taken out again**: the snapshot kept without its first clock read, so only the
   timer marks a start past; the story must fail at the first read.
4. **The words.** The button's message goes in both catalogs; the story gets its entry in both
   languages' story docs; DESIGN.md's Loading State says a start already past fifteen seconds
   when it is given, or moved to, shows the slow line at once.

## File by file

- `apps/web/src/shared/loading-state/LoadingState.stories.tsx`
- `apps/web/src/shared/loading-state/LoadingState.tsx`
- `apps/web/src/i18n/locales/en-US.ts` and `fa-IR.ts`
- `apps/web/src/shared/story-docs/en/Shared-LoadingState.md` and `fa/Shared-LoadingState.md`
- `DESIGN.md`

## Plan review, 2026-09-15, Codex gpt-5.6-terra

Not quite as written, with two amendments; judged against the installed source.

- **Taken: a snapshot that is kept, not a clock read on every call.** React reads the snapshot
  more than once for one render and wants the same answer while the store has not changed; a
  read of the clock each time could straddle the fifteen seconds. The clock is read on the
  first read for a start and kept, which the purity rule accepts, since the read is inside the
  snapshot and not the component's body.
- **Taken in part: an act round the press.** Storybook's React preview, `beforeAll` in
  `@storybook/react`'s entry, sets testing-library's `eventWrapper` to its own act, which turns
  `IS_REACT_ACT_ENVIRONMENT` on for that scope alone and is a plain call in a production build;
  nothing in `.storybook` turns it on. React 19.0.8 warns of an update outside act only while
  it is on, and logs that the environment is not configured when its own `act` is called with it
  off, which the storybook project fails on, and a production build has no `act` at all, which
  the published Storybook is. So the press goes through `fireEvent`, not `act` from React, and
  React's act waits on microtasks alone, so the read still comes before a zero delay timer.
- **Taken: the timer's callback covered by design.** The subscription sets the timer for every
  start, so for `PastFifteenSeconds` it fires at once and changes nothing, with no branch that
  skips it.

## Second plan review, 2026-09-15, Codex gpt-5.6-terra

Sound, with one clarification in the story; not sent a third time.

- **Taken, as confirmation.** `fireEvent` dispatches synchronously inside Storybook's act, so
  the read after it sees the press's committed render before a zero delay timer, and in a
  production build the wrapper is a plain call while the click takes React's own path. The
  kept snapshot covers a mount with a past start, a change to one, a move from one past start
  to another, StrictMode's repeated reads and a clock set back.
- **Taken: a microtask before the record is read.** A MutationObserver delivers its records in
  a microtask, so the play yields one before it looks for the reading line among them, still
  before any timer.
- **Kept, not taken: the first value computed as the store is made.** The review would read the
  clock when `useMemo` makes the store; the plan reads it on the snapshot's first read, which
  React makes in that same render, so it is one read in the same render either way, and it
  stays out of `useMemo`'s callback.
- **Not taken: telling React only when the store changes from not past to past.** React reads
  the snapshot again on a notification and does nothing when it has not changed, so the
  notification for a start already past costs one read, where a condition round it would add a
  branch whose one side only a story waiting fifteen seconds reaches, under total coverage.

## What I expect to be hard, and what I am unsure of

- **Whether the read comes after the press's render and before the old timer.** act renders
  the update and runs its effects before it returns, and the old code's zero delay timer is a
  task, which cannot run before the play's next line. The run against today's component shows
  whether the read tells the two apart.
- **React's check that a snapshot is stable.** The kept snapshot changes only when the timer
  marks it, and the timer tells React, so the two reads React compares agree.
- **Coverage.** `LoadingState.tsx` stays covered whole: the first read's clock read runs on
  every story's first render, and the timer's callback in `PastFifteenSeconds` and the new
  story, where the delay is 0.
- **Whether the store is the smallest honest change.** Reading the clock while rendering is one
  line and fails the purity rule; a line keyed by its start would remount its text, which a
  status region can read out again.

## How I will know it works

- `StartMovesPastFifteenSeconds` fails at its first read against today's component, and passes
  after the change with the other three stories, with no React warning.
- With the snapshot kept without its clock read, it fails at its first read.
- The unit project, the catalog test among it, lint and tsc are clean, and every changed file's
  drift is what HEAD's is.
- Seen in Storybook in fa-IR and en-US, light and dark, the slow line shows at once after each
  press.

## Result, 2026-09-15

- `useSlow` reads a store per start with `useSyncExternalStore`: its snapshot is the clock read
  on the first read and kept, and its timer, set for every start, marks it past and tells
  React. It lints clean, the purity rule among the rules.
- `StartMovesPastFifteenSeconds` failed alone at its first read, line 153, against today's
  component, which drew the reading line there; after the change the Loading State's four
  stories pass; with the snapshot kept without its clock read it failed alone at line 153
  again, and `LoadingState.tsx` was put back byte for byte.
- The unit project 1496 of 1496, two more than before the change, lint and tsc clean, and
  every changed file's drift what HEAD's was, DESIGN.md's 236 among them.
- Seen in the dev Storybook at device scale 2, in fa-IR and en-US, light and dark: after the
  story's own play, two more real presses of the button, labelled in each language, recorded
  the slow line alone, with no page error; the screenshots show the slow line and the button at
  the inline start, in Persian dark and in English light.
