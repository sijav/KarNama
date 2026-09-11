# KN-178 · The preferences story's localStorage restore races with other stories

Beside the preferences. Recorded after the fix, on 2026-09-11, under the
owner's rules of that day.

**Exit condition, from the board.** The story cannot pollute the shared store:
either the provider under test is given an injected storage rather than the
real one, or the storybook project serializes these stories explicitly, or the
story stubs window.localStorage for its own duration. Proved by running the
story concurrently with a story that reads stored preferences and asserting the
second is unaffected, not by reasoning about the scheduler.

## What was found

The card named one writer and there were four. The Preferences Provider's two
stories saved and restored around their write; the App Shell's
LanguageOnAPhone did the same; the Language Switch's Switching and the
Sidebar's SwitchLanguage chose English through the preview's provider and put
nothing back at all. Nothing read the leftovers today, because the preview
seeds both preferences from the toolbar globals for every story, but every one
of those writes went to the one store every story file shares.

## What was done

- The third of the card's routes, for every story rather than one:
  `.storybook/own-storage.ts` stands an in-memory Storage in for
  `localStorage` from the preview's `beforeEach`, before the first render, and
  puts the real one back in the cleanup. `localStorage` is read from each
  frame's own window, and the runner gives each story file a frame, so no
  story's store reaches another's. It is Storybook's, outside `src`, so no
  shipped code carries it.
- The Preferences Provider's stories and LanguageOnAPhone drop their save and
  restore. The provider's stories now check both halves: the story's own store
  holds `{ locale: 'en-US', colorScheme: 'dark' }`, and no real Storage in the
  frame had `setItem` called while they clicked. With the stand-in taken out of
  the preview, both stories fail on the second check, "expected setItem to not
  be called at all, but actually been called 2 times".
- AGENTS.md says every story has a store of its own and a story puts nothing
  back; the provider's docs say so in both languages.

## What is not claimed

- The concurrent run the exit asks for was not written: the owner's rule of
  2026-09-11 dropped proofs at the close. What stands in for it is the check
  above, which fails whenever a story's write reaches a real Storage, whatever
  runs beside it.
