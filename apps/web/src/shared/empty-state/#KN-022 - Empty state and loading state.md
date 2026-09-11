# KN-022 · Empty state and loading state

Beside the Empty State; the Loading State is in `src/shared/loading-state`.
Recorded after the build, on 2026-09-11, under the owner's rules of that day.

**Exit condition, from the board.** Both match Figma, the empty state carries a
call to action that starts the add flow, and the loading state stays honest
past 15 seconds rather than looking hung, which is the cold start case.

## What was built

- **Empty State**, node 159:80, read with use_figma: the round mark of 64 in
  `bg/surface-secondary`, the title, the body fixed at 220, and a Primary M
  button 32 below it, all 12 apart in 32 of padding. The file exposes the title
  and the body as text properties and the screens use it for the job list, the
  contacts and a search with no result, so the component takes `title`, `body`,
  `actionLabel` and `onAction`, translated by the caller. The action is
  required: every instance carries it and the file has no boolean to hide it.
  The title is an `h2`, the page's `h1` being the Page Header's.
- The title binds no text style, 16 at SemiBold on an automatic line height; it
  is composed as Title's 16 on 24 with SemiBold, so the state is 296 tall to the
  file's 297. DESIGN.md records it, and that the mark is about 1.02 to one on
  the `bg/page` every screen puts it on.
- **Loading State**, node 159:92: three dots of 10, 4 apart, in `border/focus`,
  and the line 16 below them in Body, `text/secondary`, as a status region. Each
  dot takes a 300 ms turn, so the lit one crosses the three in 900 and the file's
  frame is the moment the middle one is lit; reduced motion shows that frame
  still.
- Past fifteen seconds, timed from `startedAt` or from when the state first
  shows, the line says it is still reading and that a sleeping server takes up
  to a minute to wake. `wait.ts` holds the fifteen seconds and the countdown,
  unit tested at 0, 14,999 and 15,000 ms.
- Stories: JobList, Contacts, NoSearchResults and InEnglish for the Empty
  State, each pinning its language so its copy sits in the args; Reading,
  PastFifteenSeconds and InEnglish for the Loading State. Seen headless in a
  production build, light and dark: the dots take turns, the line turned after
  15.3 seconds, and reduced motion stood still on the file's frame.
