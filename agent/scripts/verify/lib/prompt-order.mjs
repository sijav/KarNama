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
 * Splits one shell line into words, remembering which were QUOTED.
 *
 * Quoted text is data, not command. That distinction is the whole of KN-190:
 * `echo "todo move <id> done"` was read as a close, so a block could roast
 * first and still look correct.
 *
 * The plan check warned against the obvious alternative, stripping quotes and
 * then searching the rest, because it "keeps rediscovering shell syntax one
 * exception at a time". This does not try to understand shell. It splits on
 * whitespace outside quotes, stops at an unquoted `#`, and hands back enough to
 * decide, plus enough to notice a shape it should not be deciding about.
 *
 * One honest gap. The quote handling below is NOT independently provable by
 * mutation, and I tried. Disable it and `grep "todo move <id> done" notes.md`
 * is still not read as a close, but for the wrong reason: the quote characters
 * glue onto the boundary words, so the tokens become `"todo` and `done"` and
 * the match fails on the punctuation rather than on the quoting. Every mutation
 * of this loop fails safe by accident, which means no test here can distinguish
 * "quoting works" from "quoting is dead code that happens to break the string".
 * What IS proved is the PRINTERS list and the UNSUPPORTED list, each caught by
 * its own mutation. Do not read the absence of a failing mutation for quoting
 * as evidence that it earns its place.
 */
const tokenise = (line) => {
  const tokens = []
  let current = ''
  let quote = null
  let quoted = false
  let index = 0

  const push = () => {
    if (current !== '' || quoted) tokens.push({ text: current, quoted })
    current = ''
    quoted = false
  }

  for (; index < line.length; index += 1) {
    const character = line[index]
    if (quote) {
      if (character === quote) quote = null
      else current += character
      continue
    }
    if (character === '"' || character === "'") {
      quote = character
      quoted = true
      continue
    }
    // A comment runs to the end of the line, and only outside quotes.
    if (character === '#' && current === '' && !tokens.length) return { tokens: [], comment: true }
    if (character === '#' && current === '') break
    if (/\s/.test(character)) {
      push()
      continue
    }
    current += character
  }
  push()
  return { tokens, unterminated: quote !== null }
}

// Shapes this deliberately does not decide about. `&&`, `;` and a pipe put two
// commands on one line, and a trailing backslash continues onto the next, so the
// ORDER within the block stops being the order of its lines. Reporting is the
// honest answer: guessing at them is the class of inference these cards keep
// removing. A single trailing `&` is NOT here, because backgrounding one command
// is exactly what the real prompt does.
const UNSUPPORTED = [
  [/&&/, 'a && chain puts two commands on one line, which this cannot order'],
  [/\|\|/, 'a || chain puts two commands on one line, which this cannot order'],
  [/(^|[^|])\|([^|]|$)/, 'a pipeline puts two commands on one line, which this cannot order'],
  [/;/, 'a semicolon puts two commands on one line, which this cannot order'],
  [/\\$/, 'a line continuation splits one command over two lines, which this cannot order'],
]

// Commands that print rather than run. `echo "todo move x done"` is caught by
// the quoting alone, but `echo todo move x done` is not, and a printer is never
// the command the order is about.
const PRINTERS = new Set(['echo', 'printf', 'cat'])

/** What one line of a command block actually does. */
export const readCommand = (line) => {
  if (!line.trim()) return { skip: true }

  for (const [pattern, why] of UNSUPPORTED) {
    // Checked against the line with quoted text removed, so a semicolon INSIDE
    // a quoted argument is not mistaken for a command separator.
    const bare = line.replace(/"[^"]*"|'[^']*'/g, '')
    if (pattern.test(bare)) return { unsupported: why }
  }

  const { tokens, comment } = tokenise(line)
  if (comment || !tokens.length) return { skip: true }

  const [head, ...rest] = tokens
  if (head.quoted) return { skip: true }
  const command = head.text.split(/[\\/]/).pop()
  if (PRINTERS.has(command)) return { skip: true }

  // Quoted arguments are KEPT, and the reason is worth writing down because I
  // had it wrong. I first dropped them, reasoning that a quoted string is data.
  // A mutation showed the filter protected nothing: the tokeniser already keeps
  // `"todo move <id> done"` as ONE token, so `includes('move')` is false with
  // or without it. What it could do is harm, by refusing to recognise
  // `todo move <id> "done"`, which is a real command someone might write.
  //
  // Tokenisation is what actually separates a mention from a command here, and
  // the printer list covers the unquoted case. Keeping a filter that changes no
  // outcome would have been a comment claiming a protection that was not there.
  const words = [command, ...rest.map((token) => token.text)]

  // `todo move <id> done`, or the same through npm.
  const closes = words.includes('move') && words.includes('done') && (command === 'todo' || words.includes('todo'))

  // `python .../roast.py task`, `node .../roast.mjs task`, `npm run roast`.
  // The roast is usually an ARGUMENT rather than the command, which is why
  // anchoring the match to the start of the line would find nothing in the file
  // this is written for.
  const roastScript = words.some((word) => /(^|[\\/])roast(\.py|\.mjs)?$/.test(word))
  const roasts = (roastScript && words.includes('task')) || (command === 'npm' && words.includes('roast'))

  return { closes, roasts, command }
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
    const executable = []
    for (const line of block.body) {
      const command = readCommand(line)
      if (command.skip) continue
      if (command.unsupported) return { ok: false, why: `${command.unsupported}: ${line.trim()}` }
      executable.push(command)
    }

    const closeAt = executable.findIndex((command) => command.closes)
    const roastAt = executable.findIndex((command) => command.roasts)

    if (closeAt === -1) return { ok: false, why: 'the marked block never closes the task' }
    if (roastAt === -1) return { ok: false, why: 'the marked block never fires a roast' }
    if (closeAt === roastAt) return { ok: false, why: 'one line both closes and roasts, so the order is not readable' }
    if (closeAt > roastAt) {
      return { ok: false, why: 'the block fires the roast BEFORE the close, whatever the prose above it says' }
    }
  }
  return { ok: true }
}
