// Reads the ORDER of the commands inside a loop prompt's close-and-roast block.
//
// This exists because a prompt said the right thing in prose and the opposite
// in the command block underneath it, and the first check written for that read
// the whole document: it took the first `todo move <id> done` and the first
// `roast.py task` anywhere in the text and compared their positions. An editor
// who leaves a correctly ordered example higher up and reverses the real block
// passes that. A block is what gets copied; the sentence above it is not.
//
// It is a separate module so the check and its own tests can run the SAME
// extraction. Testing a copy of the logic proves the copy works.

/**
 * The step's block, found by its HEADING rather than by counting fences.
 *
 * Counting was the other option and it breaks the moment a third block is
 * added anywhere above. Checking every block that mentions both commands was
 * the other, and it cannot coexist with documentation that teaches by
 * counter-example. The heading says which block is normative, so the heading is
 * what selects it.
 *
 * The fence may be indented, and here it always is: the block sits inside a
 * numbered list item, so it is indented by three spaces. Matching a fence only
 * at the start of a line would find nothing at all and report the block as
 * missing, which reads exactly like a prompt that has no block.
 */
export const closeAndRoastBlock = (markdown) => {
  const lines = markdown.split('\n')

  // The step that closes and roasts, by what it says rather than by its number,
  // since renumbering the loop is a normal edit and should not break this.
  const heading = lines.findIndex(
    (line) => /^\s*\d+\.\s/.test(line) && /\bdone\b/i.test(line) && /\broast\b/i.test(line),
  )
  if (heading === -1) return { found: false, why: 'no numbered step mentions both closing and roasting' }

  let opening = -1
  for (let index = heading + 1; index < lines.length; index += 1) {
    // Stop at the next numbered step: a block belonging to a LATER step is not
    // this step's block, and running past the boundary is how a check ends up
    // reading somebody else's example.
    if (index !== heading && /^\s*\d+\.\s/.test(lines[index])) break
    if (/^\s*(```|~~~)/.test(lines[index])) {
      opening = index
      break
    }
  }
  if (opening === -1) return { found: false, why: 'that step has no command block under it' }

  const marker = /^\s*(```|~~~)/.exec(lines[opening])?.[1] ?? '```'
  const close = lines.findIndex((line, index) => index > opening && line.trimStart().startsWith(marker))
  if (close === -1) return { found: false, why: 'the command block is never closed' }

  return { found: true, body: lines.slice(opening + 1, close), from: opening, to: close }
}

/**
 * Whether that block closes the task before it hands it to a reviewer.
 *
 * Both commands are located by LINE, and a line that is only a comment does not
 * count: `# todo move <id> done` is documentation of a command, not the command.
 * Line order rather than character offset, because a shell block is a sequence
 * of lines and two commands on one line separated by a semicolon would be a
 * different shape worth failing on rather than guessing at.
 */
export const closesBeforeRoasting = (markdown) => {
  const block = closeAndRoastBlock(markdown)
  if (!block.found) return { ok: false, why: block.why }

  const executable = block.body.filter((line) => line.trim() && !line.trimStart().startsWith('#'))
  const closeAt = executable.findIndex((line) => /todo\s+move\s+\S+\s+done/.test(line))
  const roastAt = executable.findIndex((line) => /roast(\.py|\.mjs)?\s+task|npm run roast/.test(line))

  if (closeAt === -1) return { ok: false, why: 'the block never closes the task' }
  if (roastAt === -1) return { ok: false, why: 'the block never fires a roast' }
  if (closeAt === roastAt) return { ok: false, why: 'both commands are on one line, so the order is not readable' }
  return closeAt < roastAt
    ? { ok: true }
    : { ok: false, why: 'the block fires the roast BEFORE the close, whatever the prose above it says' }
}
