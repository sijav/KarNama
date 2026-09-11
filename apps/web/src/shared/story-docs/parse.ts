/**
 * Reads one story-docs markdown file into the three things a Docs page needs.
 *
 * The format is deliberately rigid, because the guard has to CHECK it rather
 * than read it. Prose before the first heading is the component description;
 * `## Props` and `## Stories` are the only sections; each `###` under them names
 * exactly one prop or one exported story. Nothing is inferred from the wording,
 * so the guard can say "this prop has no entry" without judging whether a
 * paragraph is about it.
 *
 * What does not fit is reported, not absorbed, KN-202: an unknown section used
 * to fold its lines into the entry before it, and a second entry of one name
 * replaced the first, both without a word. Each is a problem naming its line and
 * heading, and the guard fails on any; a Docs page renders the rest.
 */

export interface StoryDoc {
  /** Everything before the first heading. The component's own description. */
  description: string
  /** Prop name to its prose, from `## Props`. */
  props: Record<string, string>
  /** Story export name to its prose, from `## Stories`. */
  stories: Record<string, string>
  /**
   * What does not fit the format, one per line at fault, empty for a file that
   * does. Errors because they are read by whoever wrote the file, never by a
   * job seeker.
   */
  problems: Error[]
}

type Section = 'props' | 'stories'

// Matched by shape and then sliced, rather than captured. A capture group is
// typed `string | undefined`, so every read of one needs a fallback that can
// never happen, and an unreachable fallback is an untestable branch. `### x`
// does not match either of these: after `##` or `###` the next character has to
// be whitespace, and for a level-three heading it is `#`.
const SECTION = /^##\s+\S/
const ENTRY = /^###\s+\S/

/** A section heading we understand, or null for anything else. */
const sectionOf = (line: string): Section | null => {
  const name = line
    .replace(/^##\s+/, '')
    .trim()
    .toLowerCase()
  if (name === 'props') return 'props'
  if (name === 'stories') return 'stories'
  return null
}

/**
 * A fenced code block suspends heading detection.
 *
 * Without this, a markdown example containing `### something` inside a fence
 * would register as a prop entry, and the guard would then demand a prop by
 * that name. Documentation that describes this very format is the obvious way
 * to hit it, and this file's own docs page will do exactly that.
 */
const FENCE = /^\s*(?:```|~~~)/

export const parseStoryDoc = (markdown: string): StoryDoc => {
  const doc: StoryDoc = { description: '', props: {}, stories: {}, problems: [] }
  const lines = markdown.split('\n')

  let section: Section | null = null
  // The section's heading as the file wrote it, for a problem under it.
  let heading = ''
  let entry: string | null = null
  // Set while the lines belong nowhere: under an unknown section, or under a
  // second entry of a name. They are reported once, at their heading, and kept
  // out of every entry.
  let discard = false
  let buffer: string[] = []
  let fence: string | null = null
  // The line the lines in `buffer` began on, for a problem about them.
  let from = 1

  const flush = (next: number) => {
    const text = buffer.join('\n').trim()
    const at = from + buffer.findIndex((line) => line.trim() !== '')
    buffer = []
    from = next
    if (discard) return
    if (section === null) {
      doc.description = text
      return
    }
    if (entry !== null) doc[section][entry] = text
    else if (text) doc.problems.push(new Error(`line ${at}: text under "${heading}" before its first ### belongs to no entry`))
  }

  lines.forEach((line, index) => {
    const number = index + 1
    // Inside a fence, everything is content, including something that looks
    // like a heading.
    if (fence) {
      if (line.trimStart().startsWith(fence)) fence = null
      buffer.push(line)
      return
    }
    if (FENCE.test(line)) {
      // The marker itself, so a ``` block is not closed by a ~~~ line.
      fence = line.trimStart().slice(0, 3)
      buffer.push(line)
      return
    }

    if (SECTION.test(line)) {
      flush(number + 1)
      section = sectionOf(line)
      heading = line.trim()
      entry = null
      discard = section === null
      if (discard) doc.problems.push(new Error(`line ${number}: "${heading}" is not a section: the only ones are ## Props and ## Stories`))
      return
    }

    if (ENTRY.test(line)) {
      if (section !== null) {
        flush(number + 1)
        const name = line.replace(/^###\s+/, '').trim()
        entry = name
        discard = name in doc[section]
        if (discard) doc.problems.push(new Error(`line ${number}: "${line.trim()}" is a second entry named ${name} under "${heading}"`))
        return
      }
      // Under an unknown section it goes with the section, already reported;
      // before the first section it is an entry of nothing.
      if (!discard) doc.problems.push(new Error(`line ${number}: "${line.trim()}" is an entry outside ## Props and ## Stories`))
    }

    buffer.push(line)
  })
  flush(lines.length + 1)

  return doc
}
