import { readFileSync, rmSync, writeFileSync } from 'node:fs'
import { basename, join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'
import { globSync } from 'node:fs'
import { withDefaultConfig } from 'react-docgen-typescript'
import ts from 'typescript'
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
  stories: string[]
}

/**
 * What the AST walk collects, as one object rather than three `let`s.
 *
 * Not a style choice. The walk assigns from inside a closure, and TypeScript's
 * control flow analysis cannot see that, so with separate `let` bindings it
 * narrows `title` to `null` and `titleIsLiteral` to `true` and then reports the
 * checks below as impossible. Properties of an object are re-widened after a
 * call, which is exactly the situation here.
 */
interface MetaFound {
  title: string | null
  component: string | null
  titleIsLiteral: boolean
}

/** Every story file Storybook is configured to pick up, `.ts` as well as `.tsx`. */
const storyFiles = (): string[] =>
  globSync('**/*.stories.@(ts|tsx)', { cwd: SRC }).map((name) => join(SRC, name)).sort()

/**
 * Reads one story file's meta with the TypeScript parser rather than a regex.
 *
 * A regex over `title:` matches the word in a comment, in a nested object, or
 * in a string that merely contains it. The AST knows which one is the meta's
 * own property, and it also lets a non-literal title be REJECTED rather than
 * silently mis-read.
 */
export const readStoryFile = (file: string): StoryFile => {
  const source = ts.createSourceFile(file, readFileSync(file, 'utf8'), ts.ScriptTarget.Latest, true)
  const found: MetaFound = { title: null, component: null, titleIsLiteral: true }
  const stories: string[] = []

  const readMeta = (object: ts.ObjectLiteralExpression) => {
    for (const property of object.properties) {
      if (!ts.isPropertyAssignment(property) || !ts.isIdentifier(property.name)) continue
      if (property.name.text === 'title') {
        if (ts.isStringLiteral(property.initializer)) found.title = property.initializer.text
        else found.titleIsLiteral = false
      }
      if (property.name.text === 'component' && ts.isIdentifier(property.initializer)) {
        found.component = property.initializer.text
      }
    }
  }

  const visit = (node: ts.Node) => {
    // `const meta = { ... }`, with or without `satisfies Meta<...>`.
    if (ts.isVariableDeclaration(node) && ts.isIdentifier(node.name) && node.name.text === 'meta' && node.initializer) {
      const initializer = ts.isSatisfiesExpression(node.initializer) || ts.isAsExpression(node.initializer) ? node.initializer.expression : node.initializer
      if (ts.isObjectLiteralExpression(initializer)) readMeta(initializer)
    }
    // Every named export that is not the meta is a story, which is CSF 3.
    if (ts.isVariableStatement(node) && node.modifiers?.some((modifier) => modifier.kind === ts.SyntaxKind.ExportKeyword)) {
      for (const declaration of node.declarationList.declarations) {
        if (ts.isIdentifier(declaration.name) && declaration.name.text !== 'meta') stories.push(declaration.name.text)
      }
    }
    ts.forEachChild(node, visit)
  }
  visit(source)

  // A backstop, and honest about being one. Storybook's own indexer rejects a
  // dynamic title first, with "CSF: unexpected dynamic title", so this branch is
  // not reachable by editing a story file that Storybook also loads. It stays
  // because this guard reads the source directly and must not silently treat a
  // computed title as absent, and it is covered by a direct test rather than by
  // a mutation, since the mutation never gets this far.
  if (!found.titleIsLiteral) {
    throw new Error(`${relative(WEB, file)} has a title that is not a string literal, so its docs file cannot be found`)
  }
  if (found.title === null) throw new Error(`${relative(WEB, file)} has no title in its meta`)
  return { file, title: found.title, component: found.component, stories }
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
    // Direct, because Storybook's indexer refuses a dynamic title before the
    // guard ever runs, so a repository mutation cannot reach this branch.
    // Not named `.stories.tsx`, so it cannot be picked up by the glob above or
    // by Storybook if the process is interrupted between write and remove.
    const fixture = join(DOCS, '__title-fixture.tsx')
    writeFileSync(fixture, ['const meta = { title: `A/${"B"}` }', 'export default meta', ''].join('\n'))
    try {
      expect(() => readStoryFile(fixture)).toThrow(/not a string literal/)
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
