import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import ts from 'typescript'
import { describe, expect, it } from 'vitest'
import { elevation, iconSize, radius, semantic, spacing, status, type as typeScale } from './tokens'

/**
 * `tokens.ts` is checked against `DESIGN.md`, which is itself checked against
 * Figma by `agent/scripts/verify/KN-004.mjs`. Two links in a chain, each one
 * mechanical, so a colour cannot change in the design without something going
 * red here.
 *
 * Reading the contract rather than restating it is the point. A test that
 * repeated the hex codes would pass for exactly as long as someone kept both
 * copies in step by hand, which is the failure this is meant to prevent.
 */
const design = readFileSync(fileURLToPath(new URL('../../../../DESIGN.md', import.meta.url)), 'utf8')
const rows = design.split('\n').filter((line) => line.trim().startsWith('|'))

const rowFor = (token: string) => rows.find((line) => line.includes(`\`${token}\``))

describe('the token set agrees with DESIGN.md', () => {
  it.each(Object.entries(semantic))('%s is %s in the contract', (token, hex) => {
    const row = rowFor(token)
    expect(row, `${token} is in no DESIGN.md table`).toBeDefined()
    expect(row?.toLowerCase()).toContain(hex)
  })

  it.each(Object.entries(status))('status %s carries both of its colours', (name, pair) => {
    const row = rowFor(name)
    expect(row, `status ${name} is in no DESIGN.md table`).toBeDefined()
    expect(row?.toLowerCase()).toContain(pair.base)
    expect(row?.toLowerCase()).toContain(pair.container)
  })

  // The document writes the roles in title case with the family capitalised,
  // `Heading/L` and `Title`, while the code keys them in lower case. A typed
  // tuple list rather than a derived one, so looking the role up needs no cast:
  // a cast here would be small and would also be the first one in the codebase.
  const roles: readonly (readonly [keyof typeof typeScale, string])[] = [
    ['heading/l', 'Heading/L'],
    ['heading/m', 'Heading/M'],
    ['title', 'Title'],
    ['body', 'Body'],
    ['label', 'Label'],
  ]

  it.each(roles)('type role %s matches its size and line height', (name, label) => {
    const role = typeScale[name]
    const row = rowFor(label)
    expect(row, `type role ${label} is in no DESIGN.md table`).toBeDefined()
    expect(row).toContain(`${role.size} / ${role.lineHeight}`)
  })

  it('names every role in the scale, so none can be skipped by omission', () => {
    expect(roles.map(([name]) => name).toSorted()).toEqual(Object.keys(typeScale).toSorted())
  })

  it('states every spacing, radius and icon step exactly once', () => {
    const block = /```\nspacing([\s\S]*?)```/.exec(design)?.[1]
    expect(block, 'DESIGN.md has no spacing block').toBeDefined()
    for (const [name, value] of Object.entries(spacing)) {
      expect(block, `spacing ${name}`).toMatch(new RegExp(`(^|\\s)${name}\\s+${value}(\\s|$)`, 'm'))
    }
    for (const [name, value] of Object.entries(radius)) {
      expect(block, `radius ${name}`).toMatch(new RegExp(`(^|\\s)${name}\\s+${value}(\\s|$)`, 'm'))
    }
    for (const [name, value] of Object.entries(iconSize)) {
      expect(block, `icon ${name}`).toMatch(new RegExp(`(^|\\s)${name}\\s+${value}(\\s|$)`, 'm'))
    }
  })

  it('carries both effect styles, the two shadows that are not one, and nothing else', () => {
    expect(Object.keys(elevation)).toEqual(['card', 'modal', 'tooltip', 'bulkBar'])
    // The shadow numbers, in the order the design stacks them.
    expect(elevation.card).toBe('0 1px 3px 0 #0000000F, 0 1px 2px 0 #0000000A')
    expect(elevation.modal).toBe('0 8px 24px -4px #0000001F, 0 2px 6px -2px #00000014')
    // Read from node 410:469's design context. 24 percent black is 0x3D.
    expect(elevation.tooltip).toBe('0 6px 18px -2px #0000003D')
    // Read from node 401:436's effects with use_figma. 16 percent black is 0x29.
    expect(elevation.bulkBar).toBe('0 8px 24px -4px #00000029')
    // Still exactly two STYLES: the tooltip's and the bar's shadows are bound
    // to none, and the document has to say so where the table is, not only here.
    expect(design).toContain('exactly two effect styles')
    expect(design).toMatch(/`410:469`[^\n]*#0000003D[^\n]*0 6[^\n]*blur 18[^\n]*spread -2/)
    expect(design).toMatch(/`401:436`[^\n]*#00000029[^\n]*0 8[^\n]*blur 24[^\n]*spread -4/)
  })

  it('has five type roles, and Body/Small is not one of them', () => {
    expect(Object.keys(typeScale)).toHaveLength(5)
    expect(Object.keys(typeScale)).not.toContain('body/small')
  })

  it('has nine statuses, five default and four reserved', () => {
    expect(Object.keys(status)).toHaveLength(9)
    expect(Object.keys(status).filter((name) => name.startsWith('custom-'))).toHaveLength(4)
  })
})

// The lingui rule does not look at tokens.ts, TECH-DEBT.md 13, because every
// literal in it is a design value and the rule cannot tell a hex code from a
// word. This is the check that stands where the lint would. It reads the
// SOURCE, every string literal the parser finds, rather than the module's
// runtime values: a walk over exports never saw a string inside a function, a
// Map or a getter, and exempted the font stack by its name instead of its
// value, so each of those let copy through. KN-227.
const hex = /^#[0-9a-f]{6}([0-9a-f]{2})?$/i
// One layer of a box-shadow: four lengths and an eight-digit colour.
const shadowLayer = /^(-?\d+(px)? ){4}#[0-9a-f]{8}$/i
// A token name as the design writes it: lower case, digits and hyphens, in
// slash-separated steps, bg/brand/default.
const tokenName = /^[a-z0-9-]+(\/[a-z0-9-]+)*$/
// The one font stack: Vazirmatn first, then quoted families or CSS generics.
const fontStack = /^'Vazirmatn[^']*'(, ('[^']+'|[a-z-]+))+$/

const isDesignValue = (text: string) => hex.test(text) || fontStack.test(text) || text.split(', ').every((layer) => shadowLayer.test(layer))

/** Every string literal in `source` the checks refuse, with what it was used as. */
const copyIn = (source: string): string[] => {
  const file = ts.createSourceFile('tokens.ts', source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS)
  const found: string[] = []
  const visit = (node: ts.Node) => {
    if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) {
      const isKey = ts.isPropertyAssignment(node.parent) && node.parent.name === node
      const allowed = isKey ? tokenName.test(node.text) : isDesignValue(node.text)
      if (!allowed) found.push(`${isKey ? 'key' : 'value'} ${node.text}`)
    }
    // A template with substitutions can say anything, so it is never a token.
    if (ts.isTemplateExpression(node)) found.push(`template ${node.getText(file)}`)
    ts.forEachChild(node, visit)
  }
  visit(file)
  return found
}

describe('the token module holds design values and nothing a person reads', () => {
  it('has no string literal anywhere that is not a token name, a colour, a shadow or the font stack', () => {
    const source = readFileSync(fileURLToPath(new URL('./tokens.ts', import.meta.url)), 'utf8')
    expect(copyIn(source)).toEqual([])
  })

  // The check proved on the three ways round the old one, so it is not only
  // ever seen passing. The verifier plants the same cases in the real file.
  it.each([
    ['a string returned from a function', "export const deleteLabel = () => 'Delete this application'"],
    ['a string inside a Map', "export const labels = new Map([['delete', 'Delete this application']])"],
    ['copy assigned to the font stack', "export const fontFamily = 'Delete this application'"],
    ['a label keyed into a token object', "export const elevation = { label: 'Raised surface' }"],
  ])('refuses %s', (_case, planted) => {
    expect(copyIn(planted)).not.toEqual([])
  })
})
