import { readFileSync, rmSync, writeFileSync } from 'node:fs'
import { basename, join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'
import { globSync } from 'node:fs'
import { withDefaultConfig } from 'react-docgen-typescript'
import { loadCsf } from 'storybook/internal/csf-tools'
import { beforeAll, describe, expect, it } from 'vitest'
import { fileNameFor, TITLE_SHAPE } from './catalog'
import { parseStoryDoc, type StoryDoc } from './parse'

/**
 * The guard KN-007 is about.
 *
 * It reads the repository rather than a fixture, so adding a story with no
 * markdown fails here without anyone having to register it anywhere. That is
 * the whole point: a documentation rule nobody can forget to opt into.
 *
 * The prop list comes from `react-docgen-typescript`, which is the same
 * extractor `main.ts` configures Storybook to use. Any other source could
 * disagree with the Controls table, and a guard that disagrees with the page it
 * guards is worse than none.
 */

const WEB = join(fileURLToPath(new URL('.', import.meta.url)), '..', '..', '..')
const SRC = join(WEB, 'src')
const DOCS = join(SRC, 'shared', 'story-docs')

interface StoryFile {
  file: string
  title: string
  /** The identifier given to `component:` in the meta, if any. */
  component: string | null
  /**
   * The meta HAS a `component`, but it is not a plain identifier.
   *
   * Distinct from `component: null`, which means there is none at all and is
   * legitimate. This third state exists because the previous version skipped
   * the prop check whenever it could not read the component, which fails OPEN:
   * the less a meta declared, the less it was asked to document.
   */
  componentUnreadable: boolean
  stories: string[]
}

/**
 * Every story file Storybook is configured to pick up, `.ts` as well as `.tsx`.
 *
 * Minus `gate-fixtures`, because `.storybook/main.ts` excludes it: it holds a
 * story that exists to FAIL the lint, KN-095, and it is not a component anyone
 * documents.
 */
const storyFiles = (): string[] =>
  globSync('**/*.stories.@(ts|tsx)', { cwd: SRC, exclude: ['gate-fixtures/**'] })
    .map((name) => join(SRC, name))
    .sort()

/**
 * Reads one story file's meta and story list from **Storybook's own CSF
 * parser**, not from a hand-rolled AST walk.
 *
 * The walk this replaces was wrong twice in one card. It collected stories only
 * from `export const`, so `export function KeyboardOnly()` needed no
 * documentation; and it found the meta by looking for a variable literally
 * called `meta`, so renaming it lost the title. Both were the same mistake:
 * reimplementing CSF semantics from TypeScript syntax and drifting from what
 * Storybook actually does.
 *
 * A plan check told me to widen the walk to classes and export lists. I checked
 * the installed indexer instead of taking that on trust, and it is a mixed
 * answer worth recording: `export { A }` and `export { A as B }` ARE indexed as
 * stories by Storybook 10.5.10, and `export class` is NOT. Guarding classes
 * would have made this stricter than Storybook, which is its own kind of wrong.
 *
 * So the parser IS the oracle. `loadCsf` also honours `includeStories`,
 * `excludeStories` and the reserved `__namedExportsOrder` for free — three more
 * rules the walk would have had to grow, and each of them a chance to disagree.
 */
export const readStoryFile = (file: string): StoryFile => {
  const relativePath = relative(WEB, file)
  // A sentinel, so "the meta has no title" is distinguishable from a title
  // that happens to equal whatever a fallback produces. `makeTitle` is required
  // by `loadCsf` and its result is indistinguishable from a real title, so this
  // is deliberately a shape `TITLE_SHAPE` would never accept.
  const NO_TITLE = '<no title in meta>'

  let parsed
  try {
    // `makeTitle` receives the meta's own title and its RETURN value becomes
    // `_meta.title`, so it is a filter rather than a fallback. I got that wrong
    // once by ignoring the argument, which made every file look untitled.
    //
    // The parameter is annotated `string | undefined` because that is what
    // arrives: Storybook's own type declares it non-nullable, and it genuinely
    // passes `undefined` when the meta has no title. Without the annotation the
    // linter calls the `??` unnecessary, on the strength of a type that is not
    // true at runtime.
    const makeTitle = (userTitle: string | undefined) => userTitle ?? NO_TITLE
    parsed = loadCsf(readFileSync(file, 'utf8'), { makeTitle, fileName: file }).parse()
  } catch (error) {
    // Storybook refuses a dynamic title with "CSF: unexpected dynamic title",
    // and refusing here for the same reason keeps the guard from silently
    // treating an unreadable meta as an absent one.
    // Narrowed rather than cast. `AGENTS.md` forbids TypeScript escape hatches
    // without asking, and this was the only `as` cast of its kind anywhere in
    // the application source, so it made the rule look negotiable.
    const because = error instanceof Error ? error.message : String(error)
    throw new Error(`${relativePath} could not be parsed as CSF: ${because}`, { cause: error })
  }

  const title = parsed._meta?.title
  if (title === undefined || title === NO_TITLE) throw new Error(`${relativePath} has no title in its meta`)

  // `component` comes back as the SOURCE TEXT of whatever was written, so
  // `LanguageSwitch`, `memo(Thing)` and `() => null` are all strings here. Only
  // a plain identifier can be matched against react-docgen output; anything
  // else is present-but-unreadable, which fails rather than skipping.
  const component = parsed._meta?.component
  const isIdentifier = typeof component === 'string' && /^[A-Za-z_$][\w$]*$/.test(component)

  return {
    file,
    title,
    component: isIdentifier ? component : null,
    componentUnreadable: component !== undefined && !isIdentifier,
    stories: parsed.indexInputs.map((input) => input.exportName),
  }
}

/** Props per component displayName, from one batched TypeScript program. */
const propsByComponent = (): Map<string, string[]> => {
  const files = globSync('**/*.@(ts|tsx)', { cwd: SRC })
    .filter((name) => !name.endsWith('.test.ts') && !name.endsWith('.test.tsx'))
    .map((name) => join(SRC, name))
  const parser = withDefaultConfig({
    savePropValueAsString: true,
    // Props inherited from React or MUI are not ours to document. Without this
    // every component would owe an entry for `className`, `key` and two hundred
    // DOM attributes, and the guard would be abandoned within a day.
    propFilter: (prop) => !prop.parent?.fileName.includes('node_modules'),
  })
  const found = new Map<string, string[]>()
  for (const component of parser.parse(files)) {
    found.set(component.displayName, Object.keys(component.props))
  }
  return found
}

const readDoc = (language: 'en' | 'fa', title: string): StoryDoc | null => {
  try {
    return parseStoryDoc(readFileSync(join(DOCS, language, fileNameFor(title)), 'utf8'))
  } catch {
    return null
  }
}

let files: StoryFile[]
let props: Map<string, string[]>

beforeAll(() => {
  files = storyFiles().map(readStoryFile)
  props = propsByComponent()
}, 120_000)

describe('story-docs guard', () => {
  it('finds the story files at all, so nothing below passes by finding nothing', () => {
    // The positive control. Every check here is "for each story file", and an
    // empty list satisfies all of them identically.
    expect(files.length).toBeGreaterThan(0)
    expect(files.map((entry) => entry.title)).toContain('Shared/LanguageSwitch')
  })

  it('every story title is a shape that maps to exactly one file name', () => {
    const seen = new Map<string, string>()
    for (const entry of files) {
      expect.soft(entry.title, `${relative(WEB, entry.file)} title`).toMatch(TITLE_SHAPE)
      const name = fileNameFor(entry.title)
      const clash = seen.get(name)
      expect.soft(clash, `${entry.title} and ${clash} both map to ${name}`).toBeUndefined()
      seen.set(name, entry.title)
    }
  })

  it('every story has a markdown entry in BOTH languages', () => {
    for (const entry of files) {
      for (const language of ['en', 'fa'] as const) {
        expect
          .soft(readDoc(language, entry.title), `${entry.title} is missing ${language}/${fileNameFor(entry.title)}`)
          .not.toBeNull()
      }
    }
  })

  it('every documented prop exists, and every real prop is documented', () => {
    for (const entry of files) {
      // Present but unreadable FAILS. Skipping here is what let a meta with an
      // inline component owe no prop documentation at all: the guard declined
      // to check whatever it could not understand, so being hard to understand
      // was rewarded.
      if (entry.componentUnreadable) {
        expect.soft(entry.componentUnreadable, `${relative(WEB, entry.file)} (${entry.title}): the meta's component is not a plain identifier, so its props cannot be checked`).toBe(false)
        continue
      }
      // Genuinely absent is legitimate: a docs-only entry has no component.
      if (!entry.component) continue
      const real = props.get(entry.component)
      expect.soft(real, `${entry.title}: react-docgen found no component called ${entry.component}`).toBeDefined()
      const doc = readDoc('en', entry.title)
      if (!doc || !real) continue
      const documented = Object.keys(doc.props)
      for (const name of documented) {
        expect.soft(real, `${entry.title}: documents a prop "${name}" that ${entry.component} does not have`).toContain(name)
      }
      for (const name of real) {
        expect.soft(documented, `${entry.title}: prop "${name}" of ${entry.component} has no entry`).toContain(name)
      }
    }
  })

  it('every exported story has an entry, and every entry names a real story', () => {
    for (const entry of files) {
      const doc = readDoc('en', entry.title)
      if (!doc) continue
      const documented = Object.keys(doc.stories)
      for (const name of documented) {
        expect.soft(entry.stories, `${entry.title}: documents a story "${name}" that is not exported`).toContain(name)
      }
      for (const name of entry.stories) {
        expect.soft(documented, `${entry.title}: story "${name}" has no entry`).toContain(name)
      }
    }
  })

  it('the Persian side documents everything the English side does', () => {
    for (const entry of files) {
      const en = readDoc('en', entry.title)
      const fa = readDoc('fa', entry.title)
      if (!en || !fa) continue
      for (const section of ['props', 'stories'] as const) {
        expect
          .soft(Object.keys(fa[section]).sort(), `${entry.title}: fa ${section} does not match en`)
          .toEqual(Object.keys(en[section]).sort())
      }
      expect.soft(fa.description.length, `${entry.title}: the Persian description is empty`).toBeGreaterThan(0)
    }
  })

  it('rejects a computed title instead of reading it as absent', () => {
    // No longer a backstop. Reading the file through Storybook's own CSF parser
    // means the guard now reports Storybook's diagnostic, "unexpected dynamic
    // title", which is the same refusal the indexer gives, from the same code.
    // Still tested directly, because a story file with a dynamic title cannot
    // be left in the tree for a mutation to run against.
    // Not named `.stories.tsx`, so it cannot be picked up by the glob above or
    // by Storybook if the process is interrupted between write and remove.
    const fixture = join(DOCS, '__title-fixture.tsx')
    writeFileSync(fixture, ['const meta = { title: `A/${"B"}` }', 'export default meta', ''].join('\n'))
    try {
      expect(() => readStoryFile(fixture)).toThrow(/unexpected dynamic title/)
    } finally {
      rmSync(fixture)
    }
  })

  it('no markdown file is orphaned, documenting a story that no longer exists', () => {
    const expected = new Set(files.map((entry) => fileNameFor(entry.title)))
    for (const language of ['en', 'fa'] as const) {
      for (const path of globSync('*.md', { cwd: join(DOCS, language) })) {
        expect.soft(expected, `${language}/${basename(path)} documents a story that no longer exists`).toContain(basename(path))
      }
    }
  })
})
