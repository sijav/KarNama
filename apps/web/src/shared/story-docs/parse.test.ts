import { describe, expect, it } from 'vitest'
import { parseStoryDoc } from './parse'

/** What the parser reported, as the messages the guard prints. */
const problemsIn = (markdown: string) => parseStoryDoc(markdown).problems.map(({ message }) => message)

describe('parseStoryDoc', () => {
  it('takes everything before the first heading as the component description', () => {
    const doc = parseStoryDoc('The switch.\n\nTwo paragraphs.\n\n## Props\n### placement\nWhere.\n')
    expect(doc.description).toBe('The switch.\n\nTwo paragraphs.')
  })

  it('reads props and stories into separate maps', () => {
    const doc = parseStoryDoc(
      ['Prose.', '', '## Props', '### placement', 'Where it sits.', '', '## Stories', '### Sidebar', 'In the sidebar.'].join('\n'),
    )
    expect(doc.props).toEqual({ placement: 'Where it sits.' })
    expect(doc.stories).toEqual({ Sidebar: 'In the sidebar.' })
    expect(doc.problems).toEqual([])
  })

  it('keeps multi-paragraph entries whole', () => {
    const doc = parseStoryDoc('## Props\n### placement\nOne.\n\nTwo.\n')
    expect(doc.props.placement).toBe('One.\n\nTwo.')
  })

  it('reports a section heading it does not know, and keeps what is under it out of every entry', () => {
    // An unknown `##` must not silently become a props section, or an entry
    // under it would be demanded of a component that has no such prop.
    const doc = parseStoryDoc('## Notes\n### placement\nnot a prop entry\n')
    expect(doc.props).toEqual({})
    expect(doc.stories).toEqual({})
    expect(problemsIn('## Notes\n### placement\nnot a prop entry\n')).toEqual([
      'line 1: "## Notes" is not a section: the only ones are ## Props and ## Stories',
    ])
  })

  it('does not fold an unknown section after the stories into the last story, nor read its ### as a story', () => {
    // KN-202: the lines under `## Accessibility` were the Sidebar story's prose,
    // and a `###` under it a story of its own that no file exports.
    const markdown = ['## Stories', '### Sidebar', 'In the sidebar.', '', '## Accessibility', 'Reads well.', '### Keys', 'Tab.'].join('\n')
    expect(parseStoryDoc(markdown).stories).toEqual({ Sidebar: 'In the sidebar.' })
    expect(problemsIn(markdown)).toEqual(['line 5: "## Accessibility" is not a section: the only ones are ## Props and ## Stories'])
  })

  it('reports a second entry of one name and keeps the first', () => {
    // KN-202: the second replaced the first without a word, so a prop written up
    // twice lost the first attempt.
    const markdown = ['## Props', '### placement', 'First.', '### placement', 'Second.'].join('\n')
    expect(parseStoryDoc(markdown).props).toEqual({ placement: 'First.' })
    expect(problemsIn(markdown)).toEqual(['line 4: "### placement" is a second entry named placement under "## Props"'])
  })

  it('reads one name under Props and under Stories as two entries, not a second one', () => {
    const doc = parseStoryDoc(['## Props', '### open', 'P.', '## Stories', '### open', 'S.'].join('\n'))
    expect(doc.props).toEqual({ open: 'P.' })
    expect(doc.stories).toEqual({ open: 'S.' })
    expect(doc.problems).toEqual([])
  })

  it('reports text under a section before its first entry, naming the line the text starts on', () => {
    const markdown = ['## Stories', '', 'Belongs to nothing.', '### Sidebar', 'S.'].join('\n')
    expect(parseStoryDoc(markdown).stories).toEqual({ Sidebar: 'S.' })
    expect(problemsIn(markdown)).toEqual(['line 3: text under "## Stories" before its first ### belongs to no entry'])
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
    expect(parseStoryDoc('')).toEqual({ description: '', props: {}, stories: {}, problems: [] })
  })

  it('accepts Props and Stories in either order and either case', () => {
    const doc = parseStoryDoc('## stories\n### Sidebar\nS.\n\n## PROPS\n### placement\nP.\n')
    expect(doc.stories.Sidebar).toBe('S.')
    expect(doc.props.placement).toBe('P.')
  })

  it('does not mistake a level-three heading outside a known section for an entry, and reports it', () => {
    const doc = parseStoryDoc('Intro.\n\n### stray\ntext\n')
    expect(doc.props).toEqual({})
    expect(doc.stories).toEqual({})
    expect(problemsIn('Intro.\n\n### stray\ntext\n')).toEqual(['line 3: "### stray" is an entry outside ## Props and ## Stories'])
  })
})
