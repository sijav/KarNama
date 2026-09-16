# KN-564 - Two more stories send another tab's storage event only milliseconds after the providers listen

## The card

**Why.** A story that passes by a few milliseconds fails at random where the machine is slower,
which would stop KN-226's check, and every deploy behind it, for a story that is right.

**Exit.** `SignedOutInAnotherTab` and `ChangedInAnotherTab` dispatch no storage event before the
providers' listeners are on the window, shown by the same timing on a production Storybook, and both
still pass under Vitest and in the production build.

A child of KN-013, from its roast, measured by KN-560.

## Measured before planning, 2026-09-16

- **The same timing, on a production build of today's tree**, each story opened bare at 1280 by 720
  with `addEventListener`, `removeEventListener` and `dispatchEvent` wrapped before the page's
  scripts, as KN-560 did:
  - `SignedInInAnotherTab`, which waits for KN-560's mark: four listeners at 544 ms, its dispatch at
    546 with four listening, then three go and come back as the reader arrives.
  - `SignedOutInAnotherTab`: three listeners at 518 ms, `karnama.records` at 526 with three
    listening, `karnama.session` at 574. It wins by **8 ms**.
  - `ChangedInAnotherTab`: three listeners at 529 ms, `karnama.records` at 537 with three listening,
    and a second dispatch at 621. It wins by **8 ms**.
- **What KN-560 built**: `ListeningAround` in `App.stories.tsx`, a component that draws an empty
  span, `data-testid="listening"`, before its children and hides it in its own effect. React runs a
  parent's passive effects after its children's, so the mark must be the **parent** of the provider
  whose listener matters; KN-560's plan review made exactly that correction.
- **Which provider must hear each event.** `SignedOutInAnotherTab` has no decorator of its own: the
  board and the session live in the preview's own providers, `.storybook/preview.tsx`, which are
  ancestors of every story. `ChangedInAnotherTab` reads the board from the **meta's**
  `RecordsProvider` in `JobsScreen.stories.tsx`, which sits inside the preview's providers and
  outside the story.
- **So a story-level decorator cannot mark either of them**, read from the installed Storybook
  rather than from its documentation: `prepareStory` builds the list as the story's decorators, then
  the meta's, then the project's, and `defaultDecorateStory` reduces it so that each later decorator
  wraps the ones before it. The preview's are outermost, the meta's next and a story's own
  innermost, so a mark in a story decorator is a child of both providers and its effect runs before
  theirs, which is the mistake KN-560's review caught once already.

## The approach

1. **The mark becomes a story-only helper of its own**, `shared/story-fixtures/listening.tsx`,
   beside `keyboard.ts` and `clock.ts`, taking the id of the mark it draws so two marks can stand in
   one tree without colliding. `App.stories.tsx` imports it in place of its local copy.
2. **The preview marks its own providers**, `.storybook/preview.tsx`: `withProviders` returns the
   helper **around** `AppProviders`, drawing `listening-preview`, so the mark's effect runs after
   the providers' inside it. Written out, the nesting is the helper, then `AppProviders`, then the
   story; the helper is never inside `AppProviders`, which would mark too early. Every story gets an
   empty hidden span and nothing else.
3. **JobsScreen's meta marks its board provider**, drawing `listening-board`: the meta's decorator
   returns the helper **around** its `RecordsProvider`, never within it, so a story there can wait
   for the provider whose board it reads.
4. **The two stories wait** for the mark that covers the provider whose event they send, exactly as
   `SignedInInAnotherTab` waits: `SignedOutInAnotherTab` for the preview's, `ChangedInAnotherTab`
   for the board's, before the first write and dispatch.
5. **The docs**: both stories' entries say the other tab's write is sent only once this tab is
   listening, as KN-560's entry does.

## What I will change

- `apps/web/src/shared/story-fixtures/listening.tsx`, new; that folder has no helper barrel,
  `keyboard.ts` and `clock.ts` being imported by their own paths, so nothing else changes there
- `apps/web/.storybook/preview.tsx`
- `apps/web/src/app/App.stories.tsx`
- `apps/web/src/screens/JobsScreen.stories.tsx`
- `apps/web/src/shared/story-docs/en/App-Shell.md` and `fa/App-Shell.md`,
  `en/Screens-Jobs.md` and `fa/Screens-Jobs.md`, their two entries

## What I expect to be hard, and what I am unsure of

- **Whether the preview should carry a mark at all.** It is the only place that is a parent of the
  preview's providers, and the span is empty and hidden; the alternative is for each story to bring
  its own providers, which changes what the story exercises. The review's call.
- **Two marks in one tree.** They are told apart by their ids, and a story waits for the one whose
  provider it depends on. A story that waits for the wrong one would prove nothing, so each wait
  names the provider it means in a comment.
- **The second dispatch at 621 ms in `ChangedInAnotherTab`** carries a null key and is the story's
  own, `JobsScreen.stories.tsx` lines 1277 to 1280: another tab's `clear()` of the whole store, the
  one write with no key, which the play sends after clearing storage itself. Read there rather than
  taken on trust. It is after the listeners either way, so only the first dispatch is in this card's
  race.
- **Storybook's decorator order** is the whole reason for the two marks. It is documented, and the
  measurement above is what it rests on rather than the documentation.

## How I will know it works

- **The timing, on a production build of the change**: in both stories the first dispatch comes
  after the listeners, as `SignedInInAnotherTab`'s does.
- Both stories pass under Vitest with their files' other stories, and in the production build, bare
  and inside the manager, with no failure and no console error.
- The unit project passes, the docs guard among them; tsc and lint pass; no changed file's Prettier
  drift grows, and this plan's is 0.
- A look at both stories in the dev Storybook: nothing new is drawn, the marks being empty and
  hidden.

## Plan review, 2026-09-16, Codex gpt-5.6-terra

Not approved until two things, both taken above. **The correction**: the later null-key dispatch in
`ChangedInAnotherTab` is the story's own explicit send after its `clear()`, not a provider's write
arriving back; the file says so at lines 1277 to 1280, read rather than taken on trust, and it
changes neither the first dispatch's race nor the fix. **The detail**: write the nestings out, since
this is the step most likely to be built backwards, the helper wrapping `AppProviders` in the
preview and wrapping the meta's `RecordsProvider` in the Jobs file, never inside either. Otherwise
it judged the approach sound and the smallest honest change: a story's own decorator sits too far
inside the tree, Storybook layering global, then component, then story; the production timing trace
is the right proof, since removing a wait is no dependable negative control for a race; and two
marks are safe given constant, distinct ids, canvas-scoped queries, and a comment in each play
naming the provider it covers. The amended plan goes back to it before building.

## Second plan review, 2026-09-16, Codex gpt-5.6-terra

Approved, the amended plan being the smallest honest fix. The helper now wraps `AppProviders` and
the Jobs meta's `RecordsProvider` explicitly, which puts each mark after the listener effects it
speaks for, and a story's own decorator cannot do that, since Storybook layers a project's
decorators outside a component's and a story's. The production timing trace is the right proof, the
corrected account of the later null-key event is accurate and beside the race, and distinct ids,
canvas-scoped queries and a comment naming the covered provider make two marks safe. Vitest with the
production runs, bare and inside the manager, are coverage enough; no wider restructuring of the
providers is warranted.

## Built, 2026-09-16

- **The helper**, `shared/story-fixtures/listening.tsx`: `ListeningAround` takes the id of the mark
  it draws, beside `PREVIEW_LISTENING`, `BOARD_LISTENING` and `OWN_LISTENING`, the last being the
  `listening` KN-560 drew, so its story and both its docs entries are untouched. The three ids sit
  under one targeted lingui disable: they are identifiers a story looks itself up by, as a storage
  key is.
- **The marks.** `.storybook/preview.tsx` wraps `AppProviders` in the helper, and
  `JobsScreen.stories.tsx`'s meta wraps its `RecordsProvider`, each around the providers it speaks
  for rather than inside them. `App.stories.tsx`'s local copy is gone with the React imports it
  needed.
- **The waits.** `SignedOutInAnotherTab` waits for the preview's mark, since it brings no provider
  of its own, and `ChangedInAnotherTab` for the board's; each comment names the provider its mark
  covers.
- **The proof, on a production build of the change**, timed from the page's start with
  `addEventListener` and `dispatchEvent` wrapped before its scripts, and each mark watched:
  - `SignedOutInAnotherTab`: three listeners at 548 ms, the preview's mark hid at 557, the first
    dispatch at 559.
  - `ChangedInAnotherTab`: three listeners at 565 ms, both marks hid at 574, the first dispatch at 576.
  - `SignedInInAnotherTab`, KN-560's: four listeners at 539 ms, its marks at 541, its dispatch at 541.
  - No play reported a failure. The dispatch now follows the mark, which follows the providers'
    effects, so the order is caused rather than won: before the change the same build had the two
    dispatching 8 ms after their listeners with nothing making them.
- **Checks.** App/Shell's stories pass 14 of 14 and JobsScreen's 27 of 27; the unit project passed
  1525 of 1527, its two failures `session.test.ts` under load, KN-551, which passed alone, 2 of 2;
  tsc and lint pass. Drift: the helper 0 as a new file, `preview.tsx` 0, `JobsScreen.stories.tsx` 4
  as before, and `App.stories.tsx` **13 against HEAD's 14**, the import's place having been measured
  with the drift tool itself, since that file's block is unsorted at HEAD and every other position
  cost a line.
- **The look**, both stories in light and in dark: each mark is hidden and 0 by 0, and there is no
  page or console error.
