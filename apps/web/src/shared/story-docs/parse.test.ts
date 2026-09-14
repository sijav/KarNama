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

/** The message for a heading the format has no place for, KN-405. */
const stray = (line: number, heading: string, level: number) =>
  `line ${line}: "${heading}" is a level ${level} heading: a docs file has only its description, ## sections and ### entries`

/** The message for a fence that never closes, KN-405. */
const openFence = (line: number, marker: string) =>
  `line ${line}: the ${marker} fence opened here never closes, so every line after it is read as code`

describe('parseStoryDoc, the shapes KN-405 reports', () => {
  it.each([
    ['# Title', 1],
    ['#### Detail', 4],
    ['##### More', 5],
    ['###### Most', 6],
    ['#', 1],
    ['#\tTabbed', 1],
  ])('reports %j as a heading the format has no place for, and keeps it out of the entry', (heading, level) => {
    const markdown = ['## Props', '### placement', 'Where.', heading].join('\n')
    expect(parseStoryDoc(markdown).props).toEqual({ placement: 'Where.' })
    expect(problemsIn(markdown)).toEqual([stray(4, heading.trim(), level)])
  })

  it('reports a level-one title before the description, and keeps it out of the description', () => {
    const markdown = '# Title\nThe switch.\n\n## Props\n### placement\nWhere.'
    expect(parseStoryDoc(markdown).description).toBe('The switch.')
    expect(problemsIn(markdown)).toEqual([stray(1, '# Title', 1)])
  })

  it('reads a heading at the end of a Windows line, and a bare # before one', () => {
    const markdown = ['## Props', '### placement', 'Where.', '# Title', '#', ''].join('\r\n')
    expect(problemsIn(markdown)).toEqual([stray(4, '# Title', 1), stray(5, '#', 1)])
  })

  it('leaves #hashtag and seven # as text, as CommonMark does', () => {
    const markdown = ['## Props', '### placement', '#hashtag', '####### seven'].join('\n')
    expect(parseStoryDoc(markdown).props).toEqual({ placement: '#hashtag\n####### seven' })
    expect(problemsIn(markdown)).toEqual([])
  })

  it('does not read a stray heading inside a fence', () => {
    expect(problemsIn(['## Props', '### placement', '```md', '# not a heading', '#### nor this', '```'].join('\n'))).toEqual([])
  })

  it.each(['```', '~~~'])('reports a %s fence that never closes at the line it opened, leaving what follows inside it', (marker) => {
    const markdown = ['## Props', '### placement', 'Where.', `${marker}ts`, 'const x = 1', '## Stories', '### Default', 'D.'].join('\n')
    expect(parseStoryDoc(markdown).stories).toEqual({})
    expect(problemsIn(markdown)).toEqual([openFence(4, marker)])
  })

  it('reports an entry with no prose at its own heading, in the middle of a file and at its end, and keeps it', () => {
    const middle = ['## Stories', '### Default', '', '### Other', 'O.'].join('\n')
    expect(parseStoryDoc(middle).stories).toEqual({ Default: '', Other: 'O.' })
    expect(problemsIn(middle)).toEqual(['line 2: "### Default" under "## Stories" has no prose'])
    expect(problemsIn(['## Props', '### placement', '', ''].join('\n'))).toEqual(['line 2: "### placement" under "## Props" has no prose'])
  })

  it('reports an entry whose only line is a stray heading both ways, and keeps the entry empty', () => {
    const markdown = ['## Stories', '### Default', '# Title', '### Other', 'O.'].join('\n')
    expect(parseStoryDoc(markdown).stories).toEqual({ Default: '', Other: 'O.' })
    expect(problemsIn(markdown)).toEqual(['line 2: "### Default" under "## Stories" has no prose', stray(3, '# Title', 1)])
  })

  it('reports a stray heading and an open fence under an unknown section as well as the section', () => {
    expect(problemsIn(['## Notes', '# Title', '```', 'code'].join('\n'))).toEqual([
      'line 1: "## Notes" is not a section: the only ones are ## Props and ## Stories',
      stray(2, '# Title', 1),
      openFence(3, '```'),
    ])
  })

  it('reports an empty second entry once, as a second entry', () => {
    expect(problemsIn(['## Props', '### placement', 'P.', '### placement', ''].join('\n'))).toEqual([
      'line 4: "### placement" is a second entry named placement under "## Props"',
    ])
  })

  it('lists the problems in line order, whenever each was found', () => {
    // The #### at line 4 is found as it is read, the empty entry at line 3 only
    // at the next ###, and the open fence at line 7 only at the end.
    const markdown = ['# Title', '## Stories', '### Default', '#### Detail', '### Other', 'O.', '```'].join('\n')
    expect(problemsIn(markdown)).toEqual([
      stray(1, '# Title', 1),
      'line 3: "### Default" under "## Stories" has no prose',
      stray(4, '#### Detail', 4),
      openFence(7, '```'),
    ])
  })
})
