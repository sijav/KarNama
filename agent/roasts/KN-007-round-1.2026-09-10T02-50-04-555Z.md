1. The markdown format will break on the first component needing a real section such as `## Accessibility`, `## Usage`, or a long example. The parser does not reject that section, it silently appends it to the preceding prop/story entry. An accessibility section after `### KeyboardOnly`, for example, renders as part of that story’s prose. That is a bad contract, not rigidity. MDX is also configured as a Storybook source but wholly outside this guard.

2. The coverage argument is not sound. Wiring is behaviour here: a wrong channel, wrong event payload, failed cleanup, stale initial locale, or a `useOf` result incompatible with `preparedMeta` can all leave the page static, wrong-language, or crashed while `docs-locale.ts` and `catalog.ts` remain 100% covered. These files need a focused DocsContext/channel test, even if it mocks Storybook.

3. The prop mapping is unsafe:
   - Inline `component: () => …` is silently skipped.
   - Duplicate docgen `displayName`s overwrite each other in the `Map`, silently checking the wrong prop set.
   - A re-export under an alias normally fails loudly because the story identifier no longer matches the defining component’s display name.
   - `forwardRef`/`memo` work only when docgen preserves the named binding. Anonymous or oddly wrapped versions fail loudly or extract no useful props.
   - Generics are only as complete as docgen’s extraction, so missing extracted props can silently become undocumented props.
   
   The likely near-term cases are wrappers and re-exports, given this component library will wrap MUI primitives.

4. The private-shape probe has a visible failure mode: an English toolbar value on initial Docs navigation falls back to Persian until the user changes the toolbar. A Storybook upgrade can therefore produce English canvas/chrome with Persian prose, without a crash or test failure. Use the DocsContext’s public `componentStories()` plus `getStoryContext(story).globals` and its `channel`, rather than probing undocumented object fields and using the global addon channel.

Findings:

- **critical** — The guard does not inspect all valid CSF story exports. It only records exports declared as variable statements, so this valid story passes without a `### KeyboardOnly` entry:

  ```ts
  export function KeyboardOnly() {
    return <Button />
  }
  ```

  `readStoryFile` never collects function declarations or export-list declarations, so the guard’s “every exported story has an entry” test never checks them. This means the stated exit condition, adding a story without markdown fails the guard, is false. [guard.test.ts](D:\Kar\Gandom\KarNama\apps\web\src\shared\story-docs\guard.test.ts:87)

- **major** — The claimed rigid markdown contract is not enforced. Unknown level-two sections are accepted rather than rejected, and duplicate `###` names overwrite prior entries. For example, adding `## Accessibility` after a story is silently folded into the previous story’s prose, rather than producing a useful format error. This makes authors fight the format and lets malformed docs pass. [parse.ts](D:\Kar\Gandom\KarNama\apps\web\src\shared\story-docs\parse.ts:29) [parse.ts](D:\Kar\Gandom\KarNama\apps\web\src\shared\story-docs\parse.ts:83)

- **major** — Inline components evade prop documentation completely. The AST accepts `component` only when it is an identifier, then the guard explicitly skips prop checking when it is absent. A future story using an inline render component can have zero prop documentation and still pass. [guard.test.ts](D:\Kar\Gandom\KarNama\apps\web\src\shared\story-docs\guard.test.ts:75) [guard.test.ts](D:\Kar\Gandom\KarNama\apps\web\src\shared\story-docs\guard.test.ts:174)

- **major** — `DocsPage.tsx` and `useDocsLocale.ts` are excluded from coverage despite containing the critical integration behaviour. The proposed rationale conflicts with the repository’s total-coverage rule, and no automated test protects the toolbar subscription or Docs rendering path. [vitest.config.ts](D:\Kar\Gandom\KarNama\apps\web\vitest.config.ts:61) [useDocsLocale.ts](D:\Kar\Gandom\KarNama\apps\web\src\shared\story-docs\useDocsLocale.ts:28)

- **major** — Initial locale selection relies on undocumented DocsContext internals. If none of the guessed shapes survives a Storybook change, the page silently uses Persian regardless of the selected initial global; the later event listener does not repair it until a user changes the toolbar. [docs-locale.ts](D:\Kar\Gandom\KarNama\apps\web\src\shared\story-docs\docs-locale.ts:23) [useDocsLocale.ts](D:\Kar\Gandom\KarNama\apps\web\src\shared\story-docs\useDocsLocale.ts:30)

- **minor** — Documentation prose that the repository rule requires in markdown is embedded as a large JSDoc block in the Docs page implementation. The task’s own infrastructure violates the rule it is supposed to enforce. [DocsPage.tsx](D:\Kar\Gandom\KarNama\apps\web\src\shared\story-docs\DocsPage.tsx:5)

I ran the task verifier, but this read-only sandbox blocks its intentional fixture writes and Vite’s temporary config write, so that result is not a defect in the work.

VERDICT
score: 2.8
criticals: 1
one-line: Make the guard enumerate every valid CSF export, starting with exported function declarations and export lists.