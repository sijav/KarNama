# KN-434 - Prose is back in the TSX where story-docs owns it, and it prints in the Persian docs

## The card

**Why.** Two copies of the same prose drift, and the one in the TSX is the one nobody translates, so
a Persian reader gets English in the middle of their documentation.

**Exit.** No prop or story in the screens or IconButton carries prose the markdown already holds,
and the Persian docs page shows no English.

## Measured before planning, 2026-09-15

- **The card's line numbers are from 2026-09-12 and have moved.** A search of every story file in
  `src` for a `/** */` block directly above a story's export finds seven, and no others:
  `JobsScreen.stories.tsx` above `People`, `Adding` and `Selecting`; `NetworkScreen.stories.tsx`
  above `Editing`; `App.stories.tsx` above `Navigating` and `FromAnOldAddress`; and
  `Button.stories.tsx` above `States`.
- **Each prints in English on the Persian Docs page.** Read from the running Storybook with the
  locale set to fa-IR: the board's page holds the `People`, `Adding` and `Selecting` blocks, the
  network page's `Editing`, the shell's `Navigating` and `FromAnOldAddress`, and the Button's
  `States`.
- **The Icon Button's half is gone.** Its `href` prop carries no JSDoc now, its Docs page in fa-IR
  holds none of its blocks, and its two remaining blocks explain the code, on the Tooltip's trigger
  and on the union that keeps a link from being disabled.
- **The markdown holds every story.** Both languages' story docs have an entry for each of the seven.

## The approach

1. **Four blocks go**, `People`, `Adding`, `Selecting` and `States`: each says less than its
   markdown entry already does.
2. **Three keep the sentence that explains the story's code, as a line comment**, which Storybook
   does not read as the story's description: `Editing`'s note that what is left empty is kept as
   nothing, `Navigating`'s that a path pushed from outside fires no popstate so the story fires
   Back's, and `FromAnOldAddress`'s that the frame is given the old hash before the shell renders.
3. **The proof** is the same search of the five Persian Docs pages, which found the prose before the
   change and must find none of it after.

## What I will change

- `screens/JobsScreen.stories.tsx`, `screens/NetworkScreen.stories.tsx`, `app/App.stories.tsx`,
  `shared/button/Button.stories.tsx`

## What I expect to be hard, and what I am unsure of

- **What counts as explaining the code.** The rule of AGENTS.md section 3 is that prose for whoever
  edits the file is a comment and prose for whoever uses the component is markdown; the three kept
  sentences are about how the story itself works, not about the screen.
- **Nothing can fail first in a story**: the defect is prose on a page, so the proof is the page's
  own text, searched before and after.

## How I will know it works

- The five Persian Docs pages hold none of the seven blocks' English, where they held all seven.
- The four story files pass, and the unit project with the docs guard, lint and tsc are clean.

## Plan review, 2026-09-15, Codex gpt-5.6-terra

Not approved as written: it missed the props its own exit names. Judged, all taken:

1. **The screens' props carry prose too.** `JobsScreenProps` holds five JSDoc descriptions,
   `addOpen`, `onAddClose`, `onSelecting`, `onSignOut` and `onExtract`, and `NetworkScreenProps`
   two, `onSelecting` and `onSignOut`; each is described, more fully, in both languages' Props
   sections, read on 2026-09-15. They do not print today, since this Docs page draws no Description
   block and its Controls table shows no prop descriptions, but the exit says no prop in the screens
   carries prose the markdown holds. All seven go, and each interface takes the line the other
   components carry: the props are documented in story-docs, not here, KN-207. `JobsScreen.tsx`
   and `NetworkScreen.tsx` join the change.
2. **The story half stands.** Storybook 10.5.10 reads a story's description only from a leading
   `/**` block, and the built bundle turned all seven into story descriptions; a `//` comment is
   not read, so the three kept sentences stay for whoever edits the story.
3. **The proof is two searches.** The Persian pages are searched for each removed English sentence,
   not for English at all, since Storybook's own chrome stays English; and a source scan finds no
   `/**` block left above a story export in the four story files and none in either screen's props.
