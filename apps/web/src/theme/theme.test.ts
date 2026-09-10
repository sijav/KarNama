import { compile, middleware, serialize, stringify } from 'stylis'
import { describe, expect, it } from 'vitest'
import { cacheFor, ltrPlugins, rtlPlugins } from './rtl'
import { buildTheme } from './theme'
import { radius, semantic, spacing } from './tokens'

describe('the theme is generated from the tokens', () => {
  it('takes its palette from the semantic set rather than from literals', () => {
    const theme = buildTheme('rtl')
    expect(theme.palette.primary.main).toBe(semantic['bg/brand/default'])
    expect(theme.palette.background.default).toBe(semantic['bg/page'])
    expect(theme.palette.text.secondary).toBe(semantic['text/secondary'])
    expect(theme.palette.divider).toBe(semantic['border/default'])
  })

  it('steps spacing in units of the smallest token, so every step is a whole multiple', () => {
    const theme = buildTheme('rtl')
    expect(theme.spacing(1)).toBe(`${spacing['2xs']}px`)
    for (const value of Object.values(spacing)) expect(value % spacing['2xs']).toBe(0)
  })

  it('rounds corners with the token scale', () => {
    expect(buildTheme('rtl').shape.borderRadius).toBe(radius.md)
  })

  it('carries the direction it was built for', () => {
    expect(buildTheme('rtl').direction).toBe('rtl')
    expect(buildTheme('ltr').direction).toBe('ltr')
  })

  it('exposes the status pairs and every elevation to components', () => {
    const theme = buildTheme('rtl')
    expect(Object.keys(theme.karnama.status)).toHaveLength(9)
    // The two effect styles and the tooltip's unnamed shadow, KN-218.
    expect(Object.keys(theme.karnama.elevation)).toEqual(['card', 'modal', 'tooltip'])
  })
})

describe('the RTL pipeline', () => {
  // Driven through stylis directly rather than through the emotion cache's
  // insert. In a non-DOM environment the cache's style sheet is empty, so every
  // assertion would pass over an empty string: a test that finds nothing rather
  // than a test that proves something.
  const render = (css: string, plugins: typeof rtlPlugins) => serialize(compile(css), middleware([...plugins, stringify]))

  const probe = '.probe { padding-left: 12px; text-align: left; } .probe::placeholder { padding-left: 4px; }'

  it('flips logical properties in RTL', () => {
    const out = render(probe, rtlPlugins)
    expect(out).toContain('padding-right:12px')
    expect(out).toContain('text-align:right')
  })

  it('survives the ::placeholder rule the version conflict used to crash on', () => {
    const out = render(probe, rtlPlugins)
    expect(out).toContain('::placeholder')
    expect(out).toMatch(/::placeholder[^}]*padding-right:\s*4px/)
  })

  it('leaves LTR alone, which is what makes the RTL result mean something', () => {
    const out = render(probe, ltrPlugins)
    expect(out).toContain('padding-left:12px')
    expect(out).not.toContain('padding-right')
  })

  it('picks the cache from the direction', () => {
    expect(cacheFor('rtl').key).toBe('karnama-rtl')
    expect(cacheFor('ltr').key).toBe('karnama')
  })
})
