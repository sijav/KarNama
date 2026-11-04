import { Box } from '@mui/material'
import type { StoryObj } from '@storybook/react-vite'
import { expect, fn, userEvent, within } from 'storybook/test'
import { i18n, type Locale } from '../../i18n'
import { formatCount } from '../../i18n/formatCount'
import { darkSemantic } from '../../theme/darkMode'
import { semantic } from '../../theme/tokens'
import type { StoryMeta } from '../story-docs/story-meta'
import { fixtures } from '../story-fixtures'
import { CompanyMatch, type CompanyMatchPerson, type CompanyMatchProps } from './CompanyMatch'

// The job modal's people tab is 672 wide, and a phone's detail page 358.
const TAB_WIDTH = 672
const PHONE_WIDTH = 358

const FA = fixtures('fa-IR')
const EN = fixtures('en-US')
type Fixtures = typeof FA

const personOf = (contact: Fixtures['contacts'][number], company: string): CompanyMatchPerson => ({
  id: contact.id,
  name: contact.fullName,
  role: contact.role,
  company,
})

// The fixtures' first person with a role and a company, and that company.
const matchOf = (set: Fixtures) => {
  const found = set.contacts.find((contact) => contact.role !== '' && contact.company !== null)
  const company = found?.company
  if (found === undefined || company === undefined || company === null) throw new Error('the fixtures hold no person at a company')
  return { company, people: [personOf(found, company)] }
}

// The same company with a second person from the fixtures at it.
const twoOf = (set: Fixtures) => {
  const { company, people } = matchOf(set)
  const other = set.contacts.find((contact) => !people.some((person) => person.id === contact.id))
  if (!other) throw new Error('the fixtures hold one person')
  return { company, people: [...people, personOf(other, company)] }
}

// The fixtures' longest name, with its long role and company.
const longestOf = (set: Fixtures) => {
  const found = [...set.contacts].sort((a, b) => b.fullName.length - a.fullName.length)[0]
  const company = found?.company
  if (found === undefined || company === undefined || company === null) throw new Error('the fixtures hold no long person at a company')
  return { company, people: [personOf(found, company)] }
}

const InATab = ({ width = TAB_WIDTH, ...args }: CompanyMatchProps & { width?: number }) => (
  <Box sx={{ width }}>
    <CompanyMatch {...args} />
  </Box>
)

const meta = {
  title: 'Shared/CompanyMatch',
  component: CompanyMatch,
  args: { ...matchOf(FA), onConnect: fn() },
  parameters: { controls: { include: ['company', 'people'] } },
  render: (args) => <InATab {...args} />,
} satisfies StoryMeta<typeof CompanyMatch>

export default meta
type Story = StoryObj<typeof meta>

const px = (value: string) => Number.parseFloat(value) || 0

// A colour as the browser computes it, borrowed on the host's own inline style
// and put back in the same tick. Never inside waitFor, KN-014.
const computed = (host: HTMLElement | SVGElement, value: string) => {
  const previous = host.style.color
  host.style.color = value
  const result = getComputedStyle(host).color
  host.style.color = previous
  return result
}

type Palette = Record<keyof typeof semantic, string>

const firstOf = (args: CompanyMatchProps) => {
  const [person] = args.people
  if (!person) throw new Error('the story has nobody')
  return person
}

// The title as the catalog says it, in the reader's digits.
const titleOf = (args: CompanyMatchProps, locale: Locale) => {
  const one = new Intl.PluralRules(locale).select(args.people.length) === 'one'
  const from = one ? i18n._('person from') : i18n._('people from')
  const network = one ? i18n._('is in your network') : i18n._('are in your network')
  return `${formatCount(locale, args.people.length)} ${from} ${args.company} ${network}`
}

const boxIn = (canvasElement: HTMLElement, args: CompanyMatchProps, locale: Locale) =>
  within(canvasElement).getByRole('group', { name: titleOf(args, locale) })

// How far a part sits from the inline start or end of what holds it.
const fromStart = (outer: DOMRect, inner: DOMRect, rtl: boolean) => Math.round(rtl ? outer.right - inner.right : inner.left - outer.left)
const fromEnd = (outer: DOMRect, inner: DOMRect, rtl: boolean) => Math.round(rtl ? inner.left - outer.left : outer.right - inner.right)

// Node 1096:3111: the tab's width, 88 tall for one person; 12 above and below,
// 16 at the sides and 8 between its rows, at radius md in bg/brand/container.
// The title row 16 tall at the inline start: the user-plus at 16 in
// text/brand, then the title in Label in text/brand, 8 apart. The person 40
// tall and the width less the sides: the name in Title in text/primary over
// the role and company in Label in text/secondary at the inline start, and
// Connect, 36 tall and centred, in bg/surface with text/brand at the inline
// end.
const isTheFiles = async (canvasElement: HTMLElement, args: CompanyMatchProps, locale: Locale, palette: Palette) => {
  const box = boxIn(canvasElement, args, locale)
  const outer = box.getBoundingClientRect()
  const style = getComputedStyle(box)
  const rtl = style.direction === 'rtl'
  await expect([outer.width, outer.height]).toEqual([TAB_WIDTH, 88])
  await expect([px(style.paddingTop), px(style.paddingBottom), px(style.paddingInlineStart), px(style.paddingInlineEnd), px(style.rowGap)]).toEqual([
    12, 12, 16, 16, 8,
  ])
  await expect(px(style.borderTopLeftRadius)).toBe(8)
  await expect(style.backgroundColor).toBe(computed(box, palette['bg/brand/container']))
  const [titleRow, personRow] = [...box.children]
  if (!(titleRow instanceof HTMLElement) || !(personRow instanceof HTMLElement)) throw new Error('the prompt is missing a row')
  const titled = titleRow.getBoundingClientRect()
  await expect([Math.round(titled.top - outer.top), titled.height, fromStart(outer, titled, rtl)]).toEqual([12, 16, 16])
  const [icon, title] = [...titleRow.children]
  if (!(icon instanceof SVGElement) || !(title instanceof HTMLElement)) throw new Error('the title row is missing a part')
  const drawn = icon.getBoundingClientRect()
  await expect([drawn.width, drawn.height, fromStart(titled, drawn, rtl)]).toEqual([16, 16, 0])
  await expect(icon.getAttribute('aria-hidden')).toBe('true')
  await expect(getComputedStyle(icon).color).toBe(computed(icon, palette['text/brand']))
  const heading = getComputedStyle(title)
  await expect([px(heading.fontSize), px(heading.lineHeight), heading.fontWeight, px(heading.letterSpacing)]).toEqual([12, 16, '500', 0.2])
  await expect(heading.color).toBe(computed(title, palette['text/brand']))
  const said = title.getBoundingClientRect()
  await expect(Math.round(rtl ? drawn.left - said.right : said.left - drawn.right)).toBe(8)
  const row = personRow.getBoundingClientRect()
  await expect([Math.round(row.top - titled.bottom), row.height, row.width]).toEqual([8, 40, TAB_WIDTH - 32])
  const [text, action] = [...personRow.children]
  if (!(text instanceof HTMLElement) || !(action instanceof HTMLElement)) throw new Error('the person is missing a part')
  await expect(fromStart(row, text.getBoundingClientRect(), rtl)).toBe(0)
  const [name, role] = [...text.children]
  if (!(name instanceof HTMLElement) || !(role instanceof HTMLElement)) throw new Error('the person is missing a line')
  const named = getComputedStyle(name)
  await expect([px(named.fontSize), px(named.lineHeight), named.fontWeight]).toEqual([16, 24, '500'])
  await expect(named.color).toBe(computed(name, palette['text/primary']))
  const roled = getComputedStyle(role)
  await expect([px(roled.fontSize), px(roled.lineHeight), roled.fontWeight]).toEqual([12, 16, '500'])
  await expect(roled.color).toBe(computed(role, palette['text/secondary']))
  const button = within(personRow).getByRole('button', { name: i18n._('Connect') })
  const pressed = button.getBoundingClientRect()
  await expect([pressed.height, Math.round(pressed.top - row.top), fromEnd(row, pressed, rtl)]).toEqual([36, 2, 0])
  await expect(getComputedStyle(button).backgroundColor).toBe(computed(button, palette['bg/surface']))
  await expect(getComputedStyle(button).color).toBe(computed(button, palette['text/brand']))
}

export const Default: Story = {
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async ({ args, canvasElement }) => {
    await isTheFiles(canvasElement, args, 'fa-IR', semantic)
  },
}

export const Connect: Story = {
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async ({ args, canvasElement }) => {
    // Connect is heard with whose it is, and says which person to link, by
    // pointer and by keyboard.
    const person = firstOf(args)
    const row = within(canvasElement).getByRole('group', { name: person.name })
    const connect = within(row).getByRole('button', { name: i18n._('Connect') })
    await userEvent.click(connect)
    await expect(args.onConnect).toHaveBeenCalledWith(person.id)
    connect.blur()
    await userEvent.tab()
    await expect(connect).toHaveFocus()
    await userEvent.keyboard('{Enter}')
    await expect(args.onConnect).toHaveBeenCalledTimes(2)
  },
}

export const Several: Story = {
  // Two from the company: the title counts them in the plural, and each is a
  // row of their own, 8 apart.
  args: twoOf(FA),
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async ({ args, canvasElement }) => {
    const box = boxIn(canvasElement, args, 'fa-IR')
    const [first, second] = args.people.map((person) => within(box).getByRole('group', { name: person.name }).getBoundingClientRect())
    if (!first || !second) throw new Error('a person is missing')
    await expect(Math.round(second.top - first.bottom)).toBe(8)
    await expect(box.getBoundingClientRect().height).toBe(88 + 8 + 40)
  },
}

export const Nobody: Story = {
  // With nobody from the company in the network, there is no prompt.
  args: { people: [] },
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).queryByRole('group')).toBeNull()
  },
}

export const LongName: Story = {
  // On a phone's 358, the longest name's role and company are cut at their
  // end, and Connect keeps its size, 12 past them.
  args: longestOf(FA),
  render: (args) => <InATab {...args} width={PHONE_WIDTH} />,
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async ({ args, canvasElement }) => {
    const row = within(canvasElement).getByRole('group', { name: firstOf(args).name })
    const [text] = [...row.children]
    const role = text?.children[1]
    if (!(text instanceof HTMLElement) || !(role instanceof HTMLElement)) throw new Error('the person has no role')
    await expect(role.scrollWidth).toBeGreaterThan(role.clientWidth)
    const button = within(row).getByRole('button', { name: i18n._('Connect') })
    await expect(button.scrollWidth).toBeLessThanOrEqual(button.clientWidth)
    await expect(Math.round(text.getBoundingClientRect().left - button.getBoundingClientRect().right)).toBe(12)
    // The long company wraps the title, and the icon stays on its first line.
    const [titleRow] = [...(row.parentElement?.children ?? [])]
    const [icon, title] = [...(titleRow?.children ?? [])]
    if (!icon || !title) throw new Error('the title row is missing a part')
    await expect(title.getBoundingClientRect().height).toBeGreaterThan(16)
    await expect(icon.getBoundingClientRect().top).toBe(title.getBoundingClientRect().top)
  },
}

export const InEnglish: Story = {
  args: matchOf(EN),
  globals: { locale: 'en-US', colorScheme: 'light' },
  play: async ({ args, canvasElement }) => {
    await isTheFiles(canvasElement, args, 'en-US', semantic)
  },
}

export const Dark: Story = {
  globals: { locale: 'fa-IR', colorScheme: 'dark' },
  play: async ({ args, canvasElement }) => {
    await isTheFiles(canvasElement, args, 'fa-IR', darkSemantic)
  },
}
