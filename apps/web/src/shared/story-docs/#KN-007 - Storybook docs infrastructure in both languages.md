# Plan — KN-007, Storybook docs infrastructure in both languages, with its guard

## The task, from the board

`src/shared/story-docs` with `en/` and `fa/` markdown per story, a loader that
applies whichever language the Storybook toolbar is set to, and a guard test that
fails when a prop or story has no entry, an entry names something that no longer
exists, or the Persian side is missing what the English side documents.

**Why now.** Documentation prose is banned from `.tsx` files, so it needs
somewhere to live before the first component ships with a story — and KN-008
through KN-030, the whole component library, block on this card.

**Exit condition.** Adding a story with no markdown entry fails the guard test, a
Docs page reads fully in Persian and fully in English, and planting a
deliberately missing prop entry is caught.

## What already exists

Storybook 10.5.10, React 19, `@storybook/addon-docs`, `docs: { defaultName:
'Docs' }`, `typescript.reactDocgen: 'react-docgen-typescript'`. `preview.tsx`
already has the **Language** and **Theme** toolbars as globals `locale` and
`colorScheme`, and wraps every story in the real `AppProviders`. Four stories
exist: `Shared/LanguageSwitch`, `Theme/Tokens`, `App`, and
`Core/PreferencesProvider`. `useGlobals` is exported from `storybook/preview-api`
and I confirmed it is a function in the installed version.

## The shape

```
src/shared/story-docs/
  en/Shared-LanguageSwitch.md      fa/Shared-LanguageSwitch.md
  catalog.ts     import.meta.glob of both trees, keyed by title and locale
  parse.ts       markdown -> { description, props, stories }
  DocsPage.tsx   the docs page, reads the toolbar locale
  guard.test.ts  the exit condition
```

**File name from the story title**: `Shared/LanguageSwitch` becomes
`Shared-LanguageSwitch.md`. One file per story title, both languages, same name.

**The markdown contract**, so the guard can check it rather than read it:

```md
Component prose, any length, before the first heading.

## Props
### placement
Where the switch sits.

## Stories
### Sidebar
What this story is for.
```

`## Props` and `## Stories` are the two sections; each `###` is one prop or one
story by its exact name. Nothing is inferred from the prose.

**The loader** is `parameters.docs.page`, a component that calls `useGlobals()`
for `locale`, picks the `fa` or `en` entry, and renders `Title`, `Markdown` of
the description, `Controls`, and `Stories` from `@storybook/addon-docs/blocks`.
Prop descriptions reach the Controls table by being merged into `argTypes` at
the same point. It re-renders when the toolbar changes because `useGlobals` is a
hook, which is the whole reason for using a docs page component rather than the
static `docs.description.component` parameter, which is a string fixed at load.

## The guard, which IS the exit condition

Three clauses, three checks, each with a mutation:

1. **Every story title has both files.** Titles are discovered by globbing
   `src/**/*.stories.tsx` and reading `title:` out of the meta, so adding a story
   with no markdown fails without anyone registering it anywhere.
2. **Props match the component's real props.** The truthful source is
   `react-docgen-typescript`, which is what Storybook itself uses here, so the
   guard and the Controls table cannot disagree. Every documented prop must
   exist and every existing prop must be documented.
3. **The Persian side matches the English side.** The same `###` names under both
   sections, in both files. Not a translation check, a completeness check.

Stories are checked the same way as props, against the story file's exported
names.

## What I am unsure of

**Running `react-docgen-typescript` inside a vitest run may be slow or awkward**,
since it builds a TypeScript program. If it costs seconds per component the
guard becomes something people skip. The fallback is to check props against the
`argTypes` declared in the story file, which is weaker and I would have to say
so, because `argTypes` is hand-written and a prop missing from both the story
and the docs would pass.

**Whether `useGlobals` works inside a docs page** in Storybook 10. The docs page
renders in the preview iframe, so the hook should be available, but the docs
blocks are rendered outside the story render loop and I have not proved the
re-render happens on a toolbar change.

**Whether the file-per-title naming survives** a title containing something
awkward. `Shared/LanguageSwitch` is fine; a title with a space or a slash deeper
than one level needs a rule, and I would rather define it now than discover it.

## How I will know it worked

The three exit clauses, each as a named test: a story with no markdown entry
fails; a documented prop that no longer exists fails; a prop the component has
that nothing documents fails; a `###` present in `en` and missing in `fa` fails.
Then Storybook actually opened, and a Docs page read top to bottom in Persian and
again in English, which is gate step 7 and the clause no test covers.

---

## Revision 2, after the plan check and after PROVING the risky part

The check said "not yet" and named the right things. Its first instruction was
to prove the highest-risk assumption before building anything else, which I did,
and the result changed the design.

**PROVEN, in a real Storybook, before writing the guard:**

- **Autodocs had to be turned on.** There were no `autodocs` tags anywhere, so
  there was no Docs page for `parameters.docs.page` to replace. This fails
  invisibly: the Docs tab simply does not appear. `tags: ['autodocs']` is now in
  `preview.tsx`.
- **`useGlobals` from `storybook/preview-api` is the WRONG hook**, exactly as
  the check said. It reads the preview hook context, which exists while a story
  or decorator renders; a Docs page is neither, so it never sees a toolbar
  change. What works, and what I verified by clicking the toolbar and watching
  the page change with no reload, is subscribing to the preview channel's
  `globalsUpdated` event via `addons.getChannel()`, with the INITIAL value read
  defensively out of `DocsContext`.
- **A pinned story keeps its own language while the page follows the toolbar.**
  With the toolbar on English the prose is English and the `Sidebar` canvas
  still renders Persian, because that story sets `globals: { locale: 'fa-IR' }`.
  That is correct and worth stating, since it looks like a bug at a glance.

**Changed by the check, and now settled:**

- **`Controls` and `Stories` cannot be handed my prose.** They read Storybook's
  own prepared `argTypes` and story descriptions, fixed at load. So the
  localized prop and story prose is rendered by the page itself as its own
  sections, and those blocks keep doing types, defaults and canvases.
- **What "fully Persian" means is now decided and written into `DocsPage.tsx`:**
  the prose this repository owns is localized; Storybook's own chrome, the
  Controls headings and "Show code", stays English because Storybook does not
  localize it and no parameter makes it. Confirmed on screen.
- **The guard must scan `*.stories.ts` as well as `*.stories.tsx`**, because
  that is what `main.ts` configures, and a `.stories.ts` would otherwise slip
  past the missing-markdown check.
- **One parser instance for all files.** Measured here: 6.9s for the first file
  and about 1s each after, because each `parse()` builds its own TypeScript
  program. Batched into one call instead.
- **`react-docgen-typescript` is declared directly in `apps/web`** rather than
  leaned on as a Storybook transitive dependency.
- **Filenames must not collide.** `/` to `-` is not reversible, so the guard
  rejects any title that is not `Segment/Segment` of plain identifiers, and
  rejects two titles mapping to one file.
