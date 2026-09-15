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
 * What does not fit is reported, not absorbed, each a problem naming its line:
 * a section other than those two and a second entry of one name, whose lines
 * are then kept out of every entry, text under a section before its first
 * `###`, and a `###` outside both sections, KN-202; a heading of level one or of
 * levels four to six, a fence that never closes, and an entry with no prose,
 * KN-405; and the first line inside a fence that holds its marks without
 * closing it, where a Docs page ends the fence, KN-524. The guard fails on any;
 * a Docs page renders the rest.
 */

export interface StoryDoc {
  /** Everything before the first heading. The component's own description. */
  description: string
  /** Prop name to its prose, from `## Props`. */
  props: Record<string, string>
  /** Story export name to its prose, from `## Stories`. */
  stories: Record<string, string>
  /**
   * What does not fit the format, one per line at fault, in line order, empty
   * for a file that does. Errors because they are read by whoever wrote the
   * file, never by a job seeker.
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

// A heading the format has no place for, KN-405: one `#`, or four to six, at the
// start of a line and then a space, a tab or the end of the line, as CommonMark
// has an ATX heading, the carriage return of a Windows line ending before that
// end included. Seven `#`, or `#` and then a letter, is not a heading, and stays
// text.
const STRAY = /^(?:#|#{4,6})(?:[ \t]|\r?$)/

/** A section heading we understand, or null for anything else. */
const sectionOf = (line: string): Section | null => {
  const name = line
    .replace(/^##\s+/, '')
    .trim()
    .toLowerCase()
  // The name the comparison narrowed, not a literal of its own, which the lingui
  // rule would read as copy, KN-215.
  return name === 'props' || name === 'stories' ? name : null
}

/**
 * A fenced code block suspends heading detection.
 *
 * Without this, a markdown example containing `### something` inside a fence
 * would register as a prop entry, and the guard would then demand a prop by
 * that name. Documentation that describes this very format is the obvious way
 * to hit it, and this file's own docs page will do exactly that.
 *
 * This is the parser's top-level fence grammar, KN-524, CommonMark's for a
 * fence outside a list or a block quote, neither of which it follows: a fence
 * opens on a line of at most three spaces and then three or more backticks or
 * tildes, and closes only on a line of at most three spaces and then the same
 * character, at least as many times, with nothing after the marks but spaces
 * and tabs. Four spaces or a tab before the marks make an indented code block,
 * which opens no fence. One reading is the Docs page renderer's and not
 * CommonMark's: a backtick in a backtick fence's info string still opens a
 * fence, as the markdown-to-jsx that `@storybook/addon-docs` bundles opens one,
 * where CommonMark would open none.
 */
const OPENER = /^ {0,3}(?:`{3,}|~{3,})/

// The run of marks at the start of what it is given.
const MARKS = /^(?:`+|~+)/

/** The run of marks a line opens a fence with, or empty for a line that opens none. */
const openingRun = (line: string): string => {
  if (!OPENER.test(line)) return ''
  const marks = line.trimStart()
  return marks.slice(0, marks.length - marks.replace(MARKS, '').length)
}

/**
 * Whether a line closes the fence a run opened: after at most three spaces the
 * run, or a longer one of its character, and then nothing but spaces and tabs,
 * the carriage return of a Windows line ending included.
 */
const closes = (line: string, run: string): boolean => {
  const marks = line.replace(/^ {0,3}/, '')
  return marks.startsWith(run) && /^[ \t]*\r?$/.test(marks.replace(MARKS, ''))
}

export const parseStoryDoc = (markdown: string): StoryDoc => {
  const doc: StoryDoc = { description: '', props: {}, stories: {}, problems: [] }
  const lines = markdown.split('\n')

  // Each problem with its line, put in line order at the end: an empty entry is
  // only known at the next heading, and an open fence only at the end, KN-405.
  const found: { line: number; error: Error }[] = []
  const report = (line: number, message: string) => {
    found.push({ line, error: new Error(`line ${line}: ${message}`) })
  }

  let section: Section | null = null
  // The section's heading as the file wrote it, for a problem under it.
  let heading = ''
  let entry: string | null = null
  // The entry's heading as written and its line, for a problem about its prose.
  let entryHeading = ''
  let entryLine = 0
  // Set while the lines belong nowhere: under an unknown section, or under a
  // second entry of a name. They are reported once, at their heading, and kept
  // out of every entry.
  let discard = false
  let buffer: string[] = []
  // The open fence's run of marks, empty while none is open, and the line it
  // opened.
  let fence = ''
  let fenceLine = 0
  // Set once a line of the open fence has been reported as where a Docs page
  // ends it, KN-524.
  let pageEnded = false
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
    if (entry !== null) {
      // Kept as an entry, so the guard does not report it a second time as
      // missing; a Docs page would draw its heading with nothing under it.
      doc[section][entry] = text
      if (text === '') report(entryLine, `"${entryHeading}" under "${heading}" has no prose`)
    } else if (text) report(at, `text under "${heading}" before its first ### belongs to no entry`)
  }

  lines.forEach((line, index) => {
    const number = index + 1
    // Inside a fence, everything is content, including something that looks
    // like a heading.
    if (fence) {
      if (closes(line, fence)) {
        fence = ''
      } else if (!pageEnded && line.includes(fence)) {
        // A Docs page's Markdown ends a fence at the first place its run appears
        // after the opening line, wherever it stands, so the page ends it here
        // and the fence's own closing line then opens another. Past this line
        // the page no longer reads the fence as this does, so only this one.
        pageEnded = true
        report(number, `the ${fence} in this line leaves the fence open in Markdown, but a Docs page ends the fence here`)
      }
      buffer.push(line)
      return
    }
    const run = openingRun(line)
    if (run) {
      // The whole run, so a fence of four backticks is not closed by three, nor
      // a ``` block by a ~~~ line.
      fence = run
      fenceLine = number
      pageEnded = false
      buffer.push(line)
      return
    }

    if (SECTION.test(line)) {
      flush(number + 1)
      section = sectionOf(line)
      heading = line.trim()
      entry = null
      discard = section === null
      if (discard) report(number, `"${heading}" is not a section: the only ones are ## Props and ## Stories`)
      return
    }

    if (ENTRY.test(line)) {
      if (section !== null) {
        flush(number + 1)
        const name = line.replace(/^###\s+/, '').trim()
        entry = name
        entryHeading = line.trim()
        entryLine = number
        discard = name in doc[section]
        if (discard) report(number, `"${entryHeading}" is a second entry named ${name} under "${heading}"`)
        return
      }
      // Under an unknown section it goes with the section, already reported;
      // before the first section it is an entry of nothing.
      if (!discard) report(number, `"${line.trim()}" is an entry outside ## Props and ## Stories`)
    }

    if (STRAY.test(line)) {
      // Reported wherever it stands, an unknown section included: renaming the
      // section would not make it a heading the format has. Kept out of every
      // text, so it is not taken for prose.
      const level = line.length - line.replace(/^#+/, '').length
      report(number, `"${line.trim()}" is a level ${level} heading: a docs file has only its description, ## sections and ### entries`)
      return
    }

    buffer.push(line)
  })
  flush(lines.length + 1)
  if (fence !== '') report(fenceLine, `the ${fence} fence opened here never closes, so every line after it is read as code`)

  doc.problems = found.sort((a, b) => a.line - b.line).map(({ error }) => error)
  return doc
}
