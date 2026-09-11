# KN-203 · The Docs page reads its initial language from undocumented Storybook internals and fails silently to Persian

Beside the docs page. Recorded after the fix, on 2026-09-12, under the owner's
rules of 2026-09-11.

**Exit condition, from the board.** The Docs page either resolves the initial
locale from something Storybook supports, or FAILS LOUDLY when it cannot,
rather than defaulting silently: a visible note on the page saying the language
could not be determined is enough. A test covers the resolution path, or the
reason it cannot be tested is recorded.

## What was found

The four guessed shapes were not the only problem. Storybook's published
`DocsContextProps` does have a way in: `storyById()` for the file's primary
story and `getStoryContext(story)` for its context. But that context's
`globals` are the toolbar's with the story's own laid over them, so on the
Language Switch page, whose first story pins Persian, `globals.locale` reads
`fa-IR` while the toolbar says English. `userGlobals` is the toolbar's alone.
Both were read off the running Storybook before choosing.

The toolbar's own behaviour was worth knowing too: Storybook 10.5.10 reloads
the whole preview frame when the toolbar changes on a Docs page, checked by
marking the frame's window and watching the mark disappear. So the first read
serves every change here, and the channel listener is for a Storybook that
updates the page in place.

## What was done

- `localeInContext` takes the two published calls and reads `userGlobals` by
  shape, with no probing of `store`; `localeInEvent` reads the same field from
  a `globalsUpdated` event, where Storybook's own `GlobalsUpdatedPayload`
  declares it. The event name is Storybook's `GLOBALS_UPDATED` constant, so the
  lint exemption for the `globalsUpdated` literal is gone with it.
- When neither can be read, the page says so: a blockquote above the prose, in
  English and in Persian, each in its own direction, from the catalogs. Checked
  by planting a failed read: the note appears and the page falls back to
  Persian; without the plant it is absent in both languages.
- `useDocsLocale` returns `{ locale, known }`. `docs-locale.ts` keeps every
  decision and is tested: the toolbar over a pinned story, a page with no
  primary story, a context with no `userGlobals`, an unknown language, and the
  event's shapes. 100 percent of its statements, branches, functions and lines.
- TECH-DEBT 21 records the one thing still read by shape, `userGlobals`, and
  what retires it.

## What is not claimed

- The hook and the page stay out of coverage, as `vitest.config.ts` argues: a
  Docs page cannot be rendered as a story. What is left in them is wiring, and
  the wiring was checked in the running Storybook, both languages, with and
  without the note.
