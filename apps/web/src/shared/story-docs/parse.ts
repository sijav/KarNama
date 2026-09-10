/**
 * Reads one story-docs markdown file into the three things a Docs page needs.
 *
 * The format is deliberately rigid, because the guard has to CHECK it rather
 * than read it. Prose before the first heading is the component description;
 * `## Props` and `## Stories` are the only sections; each `###` under them names
 * exactly one prop or one exported story. Nothing is inferred from the wording,
 * so the guard can say "this prop has no entry" without judging whether a
 * paragraph is about it.
 */

export interface StoryDoc {
  /** Everything before the first heading. The component's own description. */
  description: string
  /** Prop name to its prose, from `## Props`. */
  props: Record<string, string>
  /** Story export name to its prose, from `## Stories`. */
  stories: Record<string, string>
}

// Matched by shape and then sliced, rather than captured. A capture group is
// typed `string | undefined`, so every read of one needs a fallback that can
// never happen, and an unreachable fallback is an untestable branch. `### x`
// does not match either of these: after `##` or `###` the next character has to
// be whitespace, and for a level-three heading it is `#`.
const SECTION = /^##\s+\S/
const ENTRY = /^###\s+\S/

/** A section heading we understand, or null for anything else. */
const sectionOf = (line: string): 'props' | 'stories' | null => {
  if (!SECTION.test(line)) return null
  const name = line.replace(/^##\s+/, '').trim().toLowerCase()
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
  const doc: StoryDoc = { description: '', props: {}, stories: {} }
  const lines = markdown.split('\n')

  let section: 'props' | 'stories' | null = null
  let entry: string | null = null
  let buffer: string[] = []
  let fence: string | null = null

  const flush = () => {
    const text = buffer.join('\n').trim()
    buffer = []
    if (entry === null) {
      if (section === null) doc.description = text
      return
    }
    const into = section === 'props' ? doc.props : doc.stories
    into[entry] = text
  }

  for (const line of lines) {
    // Inside a fence, everything is content, including something that looks
    // like a heading.
    if (fence) {
      if (line.trimStart().startsWith(fence)) fence = null
      buffer.push(line)
      continue
    }
    if (FENCE.test(line)) {
      // The marker itself, so a ``` block is not closed by a ~~~ line.
      fence = line.trimStart().slice(0, 3)
      buffer.push(line)
      continue
    }

    const next = sectionOf(line)
    if (next) {
      flush()
      section = next
      entry = null
      continue
    }

    if (section && ENTRY.test(line)) {
      flush()
      entry = line.replace(/^###\s+/, '').trim()
      continue
    }

    buffer.push(line)
  }
  flush()

  return doc
}
