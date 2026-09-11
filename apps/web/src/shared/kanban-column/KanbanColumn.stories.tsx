import { Box } from '@mui/material'
import type { StoryObj } from '@storybook/react-vite'
import { expect, fn, userEvent, waitFor, within } from 'storybook/test'
import type { Locale } from '../../i18n'
import { formatCount } from '../../i18n/formatCount'
import { semantic, status, type StatusToken } from '../../theme/tokens'
import { JobCard } from '../job-card'
import type { StoryMeta } from '../story-docs/story-meta'
import { fixtures } from '../story-fixtures'
import { KanbanColumn, type KanbanColumnProps } from './KanbanColumn'

type Layout = NonNullable<KanbanColumnProps['layout']>

// The cards a board would hand a column, from the story fixtures, each said
// two days back in numbers as node 137:44 writes it.
const cardsIn = (locale: Locale, count: number, layout: Layout) =>
  fixtures(locale)
    .jobs.slice(0, count)
    .map((job) => (
      <JobCard
        key={job.id}
        title={job.title}
        company={job.company}
        date={new Intl.RelativeTimeFormat(locale, { numeric: 'always' }).format(-2, 'day')}
        status={job.status}
        link={job.link}
        layout={layout}
        onOpen={() => undefined}
        onSelectedChange={() => undefined}
        onDelete={() => undefined}
        onChangeStatus={() => undefined}
      />
    ))

// A status's name and colour from the story fixtures, with the column's count
// and cards.
const columnOf = (locale: Locale, token: StatusToken, cards: number, layout: Layout = 'desktop') => ({
  name: fixtures(locale).names[token],
  colour: token,
  count: cards,
  layout,
  children: cardsIn(locale, cards, layout),
})

const CONTROLLED: (keyof KanbanColumnProps)[] = ['name', 'colour', 'count', 'layout', 'collapsed']
const LAYOUTS: Layout[] = ['desktop', 'mobile']

// The desktop column fills the board's height, 684 in the file; the phone's
// fills the screen's width, 390.
const HEIGHT = 684
const PHONE = 390

const meta = {
  title: 'Shared/KanbanColumn',
  component: KanbanColumn,
  args: {
    ...columnOf('fa-IR', 'new', 3),
    collapsed: false,
    onExpand: fn(),
    onAdd: fn(),
    onRename: fn(),
    onColourChange: fn(),
    onDelete: fn(),
  },
  argTypes: { layout: { control: 'radio', options: LAYOUTS }, colour: { control: 'select', options: Object.keys(status) } },
  parameters: { controls: { include: CONTROLLED } },
  decorators: [
    (Story, { args }) => (
      <Box sx={args.layout === 'mobile' ? { width: PHONE } : { height: HEIGHT }}>
        <Story />
      </Box>
    ),
  ],
} satisfies StoryMeta<typeof KanbanColumn>

export default meta
type Story = StoryObj<typeof meta>

const px = (value: string) => Number.parseFloat(value) || 0

// A token's value as the browser computes it, borrowed on the host's own
// inline style and put back in the same tick. Never inside waitFor, KN-014.
const computed = (host: HTMLElement, value: string) => {
  const previous = host.style.backgroundColor
  host.style.backgroundColor = value
  const result = getComputedStyle(host).backgroundColor
  host.style.backgroundColor = previous
  return result
}

const columnIn = (canvasElement: HTMLElement) => {
  const column = canvasElement.querySelector('section')
  if (!column) throw new Error('no column')
  return column
}
// The header is the column's first child, the card region its second.
const partOf = (column: HTMLElement, index: number) => {
  const part = column.children[index]
  if (!(part instanceof HTMLElement)) throw new Error(`the column has no part ${String(index)}`)
  return part
}
const addCardOf = (column: HTMLElement) => within(column).getByRole('button', { name: /افزودن فرصت شغلی به|Add a job opportunity to/u })

export const Default: Story = {
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async ({ args, canvasElement }) => {
    // Node 241:125: 300 wide and the board's height, bg/surface-secondary,
    // radius lg, 12 of padding; the header 40 tall with the Size=M chip and
    // the count at its start and the menu's icon 4 from its end; the first
    // card 8 below; the Add Card row 36 tall, 12 from the bottom.
    const column = columnIn(canvasElement)
    const box = column.getBoundingClientRect()
    const style = getComputedStyle(column)
    await expect([box.width, box.height]).toEqual([300, HEIGHT])
    await expect([px(style.paddingTop), px(style.borderTopLeftRadius)]).toEqual([12, 16])
    await expect(style.backgroundColor).toBe(computed(column, semantic['bg/surface-secondary']))
    const header = partOf(column, 0)
    await expect(header.getBoundingClientRect().height).toBe(40)
    await expect(within(header).getByText(args.name).parentElement?.getBoundingClientRect().height).toBe(28)
    await expect(within(header).getByText(formatCount('fa-IR', args.count))).toBeInTheDocument()
    const trigger = within(header).getByRole('button', { name: new RegExp(args.name, 'u') })
    const icon = trigger.querySelector('svg')
    if (!icon) throw new Error('the trigger has no icon')
    await expect(Math.round(icon.getBoundingClientRect().left - header.getBoundingClientRect().left)).toBe(4)
    const first = column.querySelector('article')
    if (!first) throw new Error('no card')
    await expect(Math.round(first.getBoundingClientRect().top - header.getBoundingClientRect().bottom)).toBe(8)
    const add = addCardOf(column)
    await expect([add.getBoundingClientRect().width, add.getBoundingClientRect().height]).toEqual([276, 36])
    await expect(Math.round(box.bottom - add.getBoundingClientRect().bottom)).toBe(12)
    await userEvent.click(add)
    await expect(args.onAdd).toHaveBeenCalledTimes(1)
    // The trigger opens the column's menu and has focus back when it closes.
    await userEvent.click(trigger)
    const menu = await within(canvasElement.ownerDocument.body).findByRole('menu')
    await expect(within(menu).getAllByRole('menuitem')).toHaveLength(3)
    await userEvent.keyboard('{Escape}')
    await waitFor(() => expect(trigger).toHaveFocus())
  },
}

export const ManyCards: Story = {
  args: columnOf('fa-IR', 'new', 6),
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async ({ canvasElement }) => {
    // More cards than the column holds: they scroll between the header and
    // the Add Card row, which stays pinned at the bottom.
    const column = columnIn(canvasElement)
    const region = partOf(column, 1)
    const add = addCardOf(column)
    const bottom = add.getBoundingClientRect().bottom
    await expect(region.scrollHeight).toBeGreaterThan(region.clientHeight)
    region.scrollTop = region.scrollHeight
    await waitFor(() => expect(region.scrollTop).toBeGreaterThan(0))
    await expect(add.getBoundingClientRect().bottom).toBe(bottom)
    await expect(column.getBoundingClientRect().height).toBe(HEIGHT)
  },
}

export const Empty: Story = {
  args: columnOf('fa-IR', 'offer', 0),
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async ({ canvasElement }) => {
    // Node 241:46: an empty column says so in a dashed box 80 tall, and keeps
    // its Add Card row at the bottom.
    const column = columnIn(canvasElement)
    const message = within(column).getByText(/هنوز فرصت شغلی‌ای تو این مرحله نیست/u)
    await expect(message.getBoundingClientRect().height).toBe(80)
    await expect(getComputedStyle(message).borderTopStyle).toBe('dashed')
    await expect(Math.round(column.getBoundingClientRect().bottom - addCardOf(column).getBoundingClientRect().bottom)).toBe(12)
  },
}

export const EveryCardFiltered: Story = {
  // A board that filters its cards hands the column a list in which nothing
  // renders, false and null and an empty list: the column says it is empty,
  // as it does with no children at all, KN-353.
  args: { ...columnOf('fa-IR', 'offer', 0), children: [false, null, []] },
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async ({ canvasElement }) => {
    const column = columnIn(canvasElement)
    await expect(within(column).getByText(/هنوز فرصت شغلی‌ای تو این مرحله نیست/u)).toBeVisible()
  },
}

export const Collapsed: Story = {
  args: { ...columnOf('fa-IR', 'rejected', 0), count: 14, collapsed: true },
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async ({ args, canvasElement }) => {
    // Collapsed to its count, as the owner settled for rejected: the header
    // alone, one button that says it is closed, and a press opens it.
    const column = columnIn(canvasElement)
    await expect(column.getBoundingClientRect().height).toBe(64)
    await expect(within(column).queryByRole('article')).toBeNull()
    const opener = within(column).getByRole('button', { expanded: false })
    await expect(opener).toHaveAccessibleName(`${args.name} ${formatCount('fa-IR', args.count)}`)
    await expect(getComputedStyle(within(opener).getByText(formatCount('fa-IR', args.count))).fontFamily).toBe(
      getComputedStyle(column).fontFamily,
    )
    await userEvent.click(opener)
    await expect(args.onExpand).toHaveBeenCalledTimes(1)
  },
}

export const LongName: Story = {
  args: { ...columnOf('fa-IR', 'custom-2', 1), name: fixtures('fa-IR').longStatusName },
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async ({ args, canvasElement }) => {
    // A long status name is cut in its chip; the header keeps its 40, and the
    // count stays 8 from the menu's icon, the header's gap in the file.
    const column = columnIn(canvasElement)
    const header = partOf(column, 0)
    await expect(header.getBoundingClientRect().height).toBe(40)
    const trigger = within(header).getByRole('button', { name: new RegExp(args.name, 'u') })
    const icon = trigger.querySelector('svg')
    if (!icon) throw new Error('the trigger has no icon')
    const count = within(header).getByText(formatCount('fa-IR', args.count))
    await expect(Math.round(count.getBoundingClientRect().left - icon.getBoundingClientRect().right)).toBe(8)
  },
}

export const Mobile: Story = {
  args: columnOf('fa-IR', 'interview', 3, 'mobile'),
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async ({ canvasElement }) => {
    // Node 241:176: the phone's column is its cards alone, 16 of padding and
    // 12 between them; the status is chosen above it, so no header and no
    // Add Card row.
    const column = columnIn(canvasElement)
    await expect(column.getBoundingClientRect().width).toBe(PHONE)
    await expect(px(getComputedStyle(column).paddingTop)).toBe(16)
    const [first, second] = [...column.querySelectorAll('article')]
    if (!first || !second) throw new Error('fewer than two cards')
    await expect(first.getBoundingClientRect().width).toBe(358)
    await expect(Math.round(second.getBoundingClientRect().top - first.getBoundingClientRect().bottom)).toBe(12)
    await expect(within(column).queryByRole('button', { name: /افزودن فرصت شغلی به|Add a job opportunity to/u })).toBeNull()
  },
}

export const MobileEmpty: Story = {
  args: columnOf('fa-IR', 'offer', 0, 'mobile'),
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async ({ canvasElement }) => {
    const column = columnIn(canvasElement)
    await expect(within(column).getByText(/هنوز فرصت شغلی‌ای تو این مرحله نیست/u)).toBeInTheDocument()
  },
}

export const InEnglish: Story = {
  args: columnOf('en-US', 'new', 2),
  globals: { locale: 'en-US' },
  play: async ({ args, canvasElement }) => {
    // Left to right, the chip is at the left and the menu's icon at the right.
    const column = columnIn(canvasElement)
    const header = partOf(column, 0)
    // The chip is its label's parent.
    const chip = within(header).getByText(args.name).parentElement
    if (!chip) throw new Error('no chip')
    await expect(Math.round(chip.getBoundingClientRect().left - column.getBoundingClientRect().left)).toBe(16)
  },
}
