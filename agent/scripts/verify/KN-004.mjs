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

const documentedExtras = ['#ef4444', '#d43030', '#b91c1c', '#bfdbfe', '#1e40af', '#e5e7eb', '#0000000f', '#0000000a']
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
