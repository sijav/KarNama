import { describe, expect, it } from 'vitest'
import { parseStoryDoc } from './parse'

describe('parseStoryDoc', () => {
  it('takes everything before the first heading as the component description', () => {
    const doc = parseStoryDoc('The switch.\n\nTwo paragraphs.\n\n## Props\n### placement\nWhere.\n')
    expect(doc.description).toBe('The switch.\n\nTwo paragraphs.')
  })

  it('reads props and stories into separate maps', () => {
    const doc = parseStoryDoc(['Prose.', '', '## Props', '### placement', 'Where it sits.', '', '## Stories', '### Sidebar', 'In the sidebar.'].join('\n'))
    expect(doc.props).toEqual({ placement: 'Where it sits.' })
    expect(doc.stories).toEqual({ Sidebar: 'In the sidebar.' })
  })

  it('keeps multi-paragraph entries whole', () => {
    const doc = parseStoryDoc('## Props\n### placement\nOne.\n\nTwo.\n')
    expect(doc.props.placement).toBe('One.\n\nTwo.')
  })

  it('ignores a section heading it does not know', () => {
    // An unknown `##` must not silently become a props section, or an entry
    // under it would be demanded of a component that has no such prop.
    const doc = parseStoryDoc('## Notes\n### placement\nnot a prop entry\n')
    expect(doc.props).toEqual({})
    expect(doc.stories).toEqual({})
  })

  it('does not read a heading inside a fenced code block', () => {
    // The case this file's own documentation will hit: a markdown example that
    // shows the format. Without fence tracking the guard would demand a prop
    // called `placement` because an example mentioned one.
    const doc = parseStoryDoc(['## Props', '### placement', 'Real.', '', '```md', '### notAProp', 'inside a fence', '```'].join('\n'))
    expect(Object.keys(doc.props)).toEqual(['placement'])
    expect(doc.props.placement).toContain('```md')
  })

  it('treats a tilde fence the same as a backtick fence', () => {
    const doc = parseStoryDoc(['## Props', '### placement', '~~~md', '### notAProp', '~~~'].join('\n'))
    expect(Object.keys(doc.props)).toEqual(['placement'])
  })

  it('is empty rather than throwing on an empty file', () => {
    expect(parseStoryDoc('')).toEqual({ description: '', props: {}, stories: {} })
  })

  it('accepts Props and Stories in either order and either case', () => {
    const doc = parseStoryDoc('## stories\n### Sidebar\nS.\n\n## PROPS\n### placement\nP.\n')
    expect(doc.stories.Sidebar).toBe('S.')
    expect(doc.props.placement).toBe('P.')
  })

  it('does not mistake a level-three heading outside a known section for an entry', () => {
    const doc = parseStoryDoc('Intro.\n\n### stray\ntext\n')
    expect(doc.props).toEqual({})
    expect(doc.stories).toEqual({})
  })
})
