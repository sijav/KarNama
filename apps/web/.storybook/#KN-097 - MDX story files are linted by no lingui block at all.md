# KN-097 · MDX story files are linted by no lingui block at all

Beside the Storybook config. Recorded after the fix, on 2026-09-11, under the
owner's rules of that day.

**Exit condition, from the board.** An .mdx file under src containing a bare
English aria-label fails npm run lint, or the stories glob no longer accepts
.mdx and DESIGN.md or AGENTS.md records which was chosen and why; either way a
committed fixture proves it.

## What was done

- The second way. No `.mdx` exists under `src`, and the docs pages are built
  from the story-docs markdown by the preview's own Docs page, so Storybook's
  stories glob takes `*.stories.ts(x)` alone and MDX is not accepted. Linting
  MDX would have meant a new plugin for a format nothing uses.
- AGENTS.md says so under "Documentation lives in markdown", and `main.ts`
  says why beside the glob; its comment that autodocs read an `.mdx` beside the
  component was stale and is corrected.
- `src/gate-fixtures/unlinted-copy.mdx` holds a bare English label in MDX, a
  file the old `../src/**/*.mdx` pattern would have indexed; `stories-glob.test.ts`
  loads `main.ts` and finds the fixture present and no pattern naming MDX. It
  failed on the old config.
- The whole storybook project still finds its 43 files, 267 of 267 passing.
