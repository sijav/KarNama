// Reads the ORDER of the commands inside a loop prompt's normative block.
//
// This is the third version. The first two are worth recording, because they
// failed the same way twice and the third fix is a different KIND of thing
// rather than a better guess:
//
//   1. It compared the first close command and the first roast command anywhere
//      in the whole document. A correctly ordered EXAMPLE higher up defeated it.
//   2. It selected the block by heading keywords, the first numbered step whose
//      line contained both "done" and "roast". A step headed "If a task is done,
//      roast it only after closing it" defeated it, because the real step was
//      headed "Close the task, then request review" and came second.
//
// Both INFERRED which block was normative from the words around it, and words
// are what an editor changes. So the block now says so itself:
//
//     <!-- roast-order -->
//     ```bash
//     todo move <id> done
//     roast ... &
//     ```
//
// Invisible in any renderer, impossible to produce by rewording, and greppable,
// so "which block is normative" has a literal answer instead of a heuristic one.
//
// The marker binds to ONE fence. Blank lines between the two are allowed and
// nothing else is: a marker floating above a paragraph that happens to precede a
// fence is the same inference problem wearing a marker, which the plan check
// named as the most likely way to get this wrong.

export const MARKER = '<!-- roast-order -->'

const FENCE = /^\s*(```|~~~)/

/**
 * Every block a marker claims. A list, not one block, because two markers mean
 * two normative blocks: either a mistake worth reporting or a file that has
 * grown a second rule, and both want checking rather than silently taking the
 * first. This is not the same as checking every fence, which would reject a
 * document teaching by counter-example.
 */
export const markedBlocks = (markdown) => {
  const lines = markdown.split('\n')
  const blocks = []
  const problems = []

  for (let index = 0; index < lines.length; index += 1) {
    if (!lines[index].includes(MARKER)) continue

    // Skip blank lines only. Anything else between the marker and the fence
    // means the marker is not attached to a block.
    let at = index + 1
    while (at < lines.length && !lines[at].trim()) at += 1

    if (at >= lines.length || !FENCE.test(lines[at])) {
      problems.push(`the marker on line ${index + 1} is not directly above a command block`)
      continue
    }

    const marker = FENCE.exec(lines[at])[1]
    const close = lines.findIndex((line, position) => position > at && line.trimStart().startsWith(marker))
    if (close === -1) {
      problems.push(`the block marked on line ${index + 1} is never closed`)
      continue
    }
    blocks.push({ body: lines.slice(at + 1, close), from: at, to: close })
  }

  return { blocks, problems }
}

/**
 * Whether every marked block closes the task before handing it to a reviewer.
 *
 * An unmarked file is reported as unmarked rather than guessed at. Falling back
 * to a heuristic would restore the exact inference this file exists to remove,
 * and it would do it silently, which is worse than saying the question cannot
 * be answered from this input.
 */
export const closesBeforeRoasting = (markdown) => {
  const { blocks, problems } = markedBlocks(markdown)
  if (problems.length) return { ok: false, why: problems.join('; ') }
  if (!blocks.length) {
    return { ok: false, why: `no block is marked with ${MARKER}, so which one is normative is not stated` }
  }

  for (const block of blocks) {
    // A line that is only a comment does not count: `# todo move <id> done` is
    // documentation of a command, not the command. Recognising a command in
    // command POSITION rather than command-shaped text anywhere on the line is
    // KN-190 and is deliberately not solved here.
    const executable = block.body.filter((line) => line.trim() && !line.trimStart().startsWith('#'))
    const closeAt = executable.findIndex((line) => /todo\s+move\s+\S+\s+done/.test(line))
    const roastAt = executable.findIndex((line) => /roast(\.py|\.mjs)?\s+task|npm run roast/.test(line))

    if (closeAt === -1) return { ok: false, why: 'the marked block never closes the task' }
    if (roastAt === -1) return { ok: false, why: 'the marked block never fires a roast' }
    if (closeAt === roastAt) return { ok: false, why: 'both commands are on one line, so the order is not readable' }
    if (closeAt > roastAt) {
      return { ok: false, why: 'the block fires the roast BEFORE the close, whatever the prose above it says' }
    }
  }
  return { ok: true }
}
