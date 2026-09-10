// Independent check of DESIGN.md's tables against the Figma variable set read
// from node 7:2 and the type documentation at 416:21.
//
// Written with the Write tool rather than a shell heredoc: the first version
// went through a heredoc and `(\\D|$)` arrived as `(D|$)`, so every spacing and
// radius assertion demanded a literal "D" after the number and all thirteen
// "failed". The document was right and the checker was wrong.
import { readFileSync } from 'node:fs'

const ROOT = process.argv[2] ?? '.'
const doc = readFileSync(`${ROOT}/DESIGN.md`, 'utf8')
const rows = doc.split('\n').filter((line) => line.trim().startsWith('|'))
const problems = []

const semantic = {
  'bg/page': '#f6f7f9',
  'bg/surface': '#ffffff',
  'bg/surface-secondary': '#f3f4f6',
  'bg/brand/default': '#2563eb',
  'bg/brand/hover': '#1d4ed8',
  'bg/brand/container': '#dbeafe',
  'text/primary': '#111827',
  'text/secondary': '#6b7280',
  'text/disabled': '#9ca3af',
  'text/on-accent': '#ffffff',
  'text/brand': '#1d4ed8',
  'border/default': '#e5e7eb',
  'border/focus': '#2563eb',
  'border/error': '#ef4444',
}

const status = {
  new: ['#4b5563', '#e5e7eb'],
  applied: ['#4f46e5', '#e0e7ff'],
  interview: ['#b45309', '#fef3c7'],
  rejected: ['#b91c1c', '#fee2e2'],
  offer: ['#166534', '#dcfce7'],
  'custom-1': ['#0f766e', '#ccfbf1'],
  'custom-2': ['#7e22ce', '#f3e8ff'],
  'custom-3': ['#be185d', '#fce7f3'],
  'custom-4': ['#155e75', '#cffafe'],
}

const scale = { spacing: { '2xs': 4, xs: 8, sm: 12, md: 16, lg: 24, xl: 32, '2xl': 48, '3xl': 64 }, radius: { none: 0, sm: 4, md: 8, lg: 16, full: 999 } }

const type = [
  ['Heading/L', '24 / 32', 'SemiBold'],
  ['Heading/M', '20 / 28', 'SemiBold'],
  ['Title', '16 / 24', 'Medium'],
  ['Body', '14 / 22', 'Regular'],
  ['Label', '12 / 16', 'Medium'],
]

for (const [name, hex] of Object.entries(semantic)) {
  const row = rows.find((line) => line.includes(`\`${name}\``))
  if (!row) problems.push(`colour ${name} appears in no table`)
  else if (!row.toLowerCase().includes(hex)) problems.push(`colour ${name} should be ${hex}: ${row.trim()}`)
}

for (const [name, [base, container]] of Object.entries(status)) {
  const row = rows.find((line) => line.includes(`\`${name}\``))
  if (!row) {
    problems.push(`status ${name} appears in no table`)
    continue
  }
  const low = row.toLowerCase()
  if (!low.includes(base)) problems.push(`status ${name} base should be ${base}`)
  if (!low.includes(container)) problems.push(`status ${name} container should be ${container}`)
}

const block = doc.match(/```\nspacing([\s\S]*?)```/)
if (!block) {
  problems.push('no spacing and radius block found')
} else {
  for (const [family, entries] of Object.entries(scale)) {
    for (const [key, value] of Object.entries(entries)) {
      // Whole-token match, so `sm 12` under spacing is not satisfied by `sm 4`
      // under radius. Escaped once, in a plain string, and unit-tested below.
      const pattern = new RegExp(`(^|\\s)${key}\\s+${value}(\\s|$)`, 'm')
      if (!pattern.test(block[1])) problems.push(`${family} ${key}=${value} is not stated`)
    }
  }
}

for (const [role, metrics, weight] of type) {
  const row = rows.find((line) => line.includes(`\`${role}\``))
  if (!row) problems.push(`type role ${role} appears in no table`)
  else if (!row.includes(metrics) || !row.includes(weight)) problems.push(`type role ${role} should be ${metrics} ${weight}: ${row.trim()}`)
}
// Only a TABLE ROW is a defect. The prose that records its deletion is the
// thing stopping someone re-adding it, so it has to be allowed to say the name.
if (/`Body\/Small`\s*\|/.test(doc)) problems.push('Body/Small is listed as a type role, but Figma deleted it')

// The effect styles, read with get_variable_defs from the frames named in the
// table. These were missing entirely and the document asserted there was only
// one, which is the reason this task exists: the Foundations overview frame 7:2
// carries colours, spacing and radius but NOT effect or type styles, so a sweep
// that reads 7:2 alone cannot see them. Each row is checked whole, so a shadow
// whose blur or spread drifts is caught rather than only a missing hex.
const elevation = [
  ['Elevation/Card', '137:44', ['#0000000F', '0 1', 'blur 3', 'spread 0'], ['#0000000A', '0 1', 'blur 2', 'spread 0']],
  ['Elevation/Modal', '210:276', ['#0000001F', '0 8', 'blur 24', 'spread -4'], ['#00000014', '0 2', 'blur 6', 'spread -2']],
]

for (const [style, node, first, second] of elevation) {
  const row = rows.find((line) => line.includes(`\`${style}\``))
  if (!row) {
    problems.push(`effect style ${style} appears in no table`)
    continue
  }
  if (!row.includes(`\`${node}\``)) problems.push(`${style} does not name the node it was read from, ${node}`)
  for (const part of [...first, ...second]) {
    if (!row.includes(part)) problems.push(`${style} is missing "${part}": ${row.trim()}`)
  }
}
// The tooltip's shadow, KN-218: a third row that is NOT an effect style. It is
// bound to no style on node 410:469, so it cannot be looked up by a style name;
// the row is found by its node and must say it is not a style, or the table
// would contradict "exactly two effect styles" two lines above it.
{
  const row = rows.find((line) => line.includes('`410:469`') && line.includes('#0000003D'))
  if (!row) problems.push('the tooltip shadow from 410:469 appears in no elevation row')
  else {
    for (const part of ['#0000003D', '0 6', 'blur 18', 'spread -2', 'no style']) {
      if (!row.includes(part)) problems.push(`the tooltip shadow row is missing "${part}": ${row.trim()}`)
    }
  }
}
// And the false claim must not come back. It survived one whole task. Same
// exemption as Body/Small above: the paragraph that records the correction has
// to be allowed to quote the thing it is correcting, or the document cannot
// warn anyone off re-adding it. So the phrase is a defect unless the sentence
// carrying it also says it was wrong.
for (const match of doc.matchAll(/only elevation/gi)) {
  const from = doc.lastIndexOf('.', match.index) + 1
  const to = doc.indexOf('.', match.index + match[0].length)
  const sentence = doc.slice(from, to === -1 ? doc.length : to)
  if (!/(was false|earlier version|no longer|used to)/i.test(sentence)) {
    problems.push(`the document still claims there is only one elevation: ${sentence.trim().replace(/\s+/g, ' ').slice(0, 80)}`)
  }
}
if (!/exactly two effect styles/i.test(doc)) problems.push('the document does not state how many effect styles there are')

// Variables the Foundations overview 7:2 does not carry, found by sweeping the
// component frames that use them. Each has to name the frame it was read from,
// because "read from component frames" without saying which is not traceable
// and the exit condition asks for traceable.
const offBoard = [
  ['bg/danger/default', '31:4', '#ef4444'],
  ['bg/danger/hover', '31:4', '#d43030'],
  ['accent/200', '31:4', '#bfdbfe'],
  ['accent/700', '31:4', '#1e40af'],
  ['gray/200', '31:4', '#e5e7eb'],
  ['red/700', '31:4', '#b91c1c'],
  ['text/error', '95:39', '#b91c1c'],
  ['black/base', '31:4', '#000000'],
]

for (const [name, node, hex] of offBoard) {
  const row = rows.find((line) => line.includes(`\`${name}\``) && line.includes(`\`${node}\``))
  if (!row) {
    problems.push(`${name} is not recorded as read from ${node}`)
    continue
  }
  if (!row.toLowerCase().includes(hex)) problems.push(`${name} should be ${hex}: ${row.trim()}`)
}

const documentedExtras = ['#ef4444', '#d43030', '#b91c1c', '#bfdbfe', '#1e40af', '#e5e7eb', '#0000000f', '#0000000a', '#0000001f', '#00000014', '#0000003d', '#000000']
const known = new Set([...Object.values(semantic), ...Object.values(status).flat(), ...documentedExtras])
for (const hex of new Set((doc.match(/#[0-9a-fA-F]{6,8}/g) ?? []).map((h) => h.toLowerCase()))) {
  if (!known.has(hex)) problems.push(`${hex} appears in the document but is not a Figma token or a documented extra`)
}

// Prove the checker can fail. A checker that only ever passes has said nothing.
const selfTest = [
  [/(^|\s)2xs\s+4(\s|$)/m.test('  2xs 4   xs 8'), true, 'spacing pattern should match'],
  [/(^|\s)sm\s+12(\s|$)/m.test('radius   none 0  sm 4'), false, 'spacing sm must not be satisfied by radius sm'],
]
for (const [got, want, label] of selfTest) {
  if (got !== want) problems.push(`CHECKER IS BROKEN: ${label}`)
}

if (problems.length) {
  process.stderr.write(`${problems.length} problem(s):\n  ${problems.join('\n  ')}\n`)
  process.exit(1)
}
process.stdout.write('DESIGN.md agrees with the Figma set on every colour, spacing, radius and type token.\n')
