import { useLingui } from '@lingui/react'
import { Box } from '@mui/material'
import type { StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { expect, fn, userEvent, waitFor, within } from 'storybook/test'
import { i18nFor, type Locale } from '../../i18n'
import { darkSemantic } from '../../theme/darkMode'
import { elevation, semantic, spacing, type StatusToken } from '../../theme/tokens'
import type { StoryMeta } from '../story-docs/story-meta'
import { fixtures } from '../story-fixtures'
import { columnOrders, type ColumnKind, type ColumnOrderId } from './columnOrders'
import { SortCaption } from './SortCaption'
import { SortMenu, type SortMenuProps } from './SortMenu'

// The board's Column Header, 983:104369: 276 wide and 40 tall, 4 in at the
// top and sides and 8 below, its caption at the inline end.
const HEADER_WIDTH = 276
const HEADER_HEIGHT = 40

// The status each kind of column stands for in the fixtures.
const STATUS_OF: Record<ColumnKind, StatusToken> = { saved: 'new', applied: 'applied', interview: 'interview', offer: 'offer', custom: 'custom-1' }

const columnName = (locale: Locale, kind: ColumnKind) => {
  const found = fixtures(locale).statuses.find((entry) => entry.token === STATUS_OF[kind])
  if (!found) throw new Error('the fixtures hold no such column')
  return found.name
}

// A column's orders and its default, in the story's language.
const ordersOf = (locale: Locale, kind: ColumnKind) => {
  const orders = columnOrders(i18nFor(locale), kind)
  const first = orders[0]
  if (!first) throw new Error('the column has no orders')
  return { orders, value: first.id }
}

// The menu open under its column's header, as the board opens it: the caption
// opens it again once it has closed, and the tick follows a choice.
const InTheHeader = ({ kind, ...args }: SortMenuProps & { kind: ColumnKind }) => {
  const { i18n } = useLingui()
  const [header, setHeader] = useState<HTMLElement | null>(null)
  const [open, setOpen] = useState(true)
  const [value, setValue] = useState<ColumnOrderId>(args.value)
  const chosen = args.orders.find((order) => order.id === value)
  return (
    <Box
      ref={setHeader}
      sx={{
        boxSizing: 'border-box',
        width: HEADER_WIDTH,
        height: HEADER_HEIGHT,
        display: 'flex',
        justifyContent: 'flex-end',
        alignItems: 'flex-start',
        paddingBlockStart: `${spacing['2xs']}px`,
        paddingInline: `${spacing['2xs']}px`,
        paddingBlockEnd: `${spacing.xs}px`,
      }}
    >
      <SortCaption
        caption={chosen?.caption ?? ''}
        column={columnName(i18n.locale === 'en-US' ? 'en-US' : 'fa-IR', kind)}
        open={open}
        onOpen={() => {
          setOpen(true)
        }}
      />
      <SortMenu
        {...args}
        value={value}
        anchorEl={open ? header : null}
        onChange={(order) => {
          args.onChange(order)
          setValue(order)
        }}
        onClose={() => {
          args.onClose()
          setOpen(false)
        }}
      />
    </Box>
  )
}

const meta = {
  title: 'Shared/SortMenu',
  component: SortMenu,
  args: { ...ordersOf('fa-IR', 'saved'), anchorEl: null, onChange: fn(), onClose: fn() },
  parameters: { controls: { include: ['value'] } },
  render: (args) => <InTheHeader {...args} kind="saved" />,
} satisfies StoryMeta<typeof SortMenu>

export default meta
type Story = StoryObj<typeof meta>

const px = (value: string) => Number.parseFloat(value) || 0

// A colour, or a shadow, as the browser computes it, borrowed on the host's own
// inline style and put back in the same tick. Never inside waitFor, KN-014.
const computed = (host: HTMLElement, value: string) => {
  const previous = host.style.color
  host.style.color = value
  const result = getComputedStyle(host).color
  host.style.color = previous
  return result
}
const shadowOf = (host: HTMLElement, value: string) => {
  const previous = host.style.boxShadow
  host.style.boxShadow = value
  const result = getComputedStyle(host).boxShadow
  host.style.boxShadow = previous
  return result
}

type Palette = Record<keyof typeof semantic, string>

// The open menu's parts: its panel, its list, the label and the orders.
const menuParts = async (locale: Locale) => {
  const i18n = i18nFor(locale)
  const list = await within(document.body).findByRole('menu', { name: i18n._('Sort this column') })
  const panel = list.parentElement
  const heading = within(list).getByText(i18n._('Sort this column'))
  if (!(panel instanceof HTMLElement)) throw new Error('the menu has no panel')
  return { list, panel, heading, orders: within(list).getAllByRole('menuitemradio') }
}

// Nodes 912:40045 and 919:2886: 220 wide at radius 8, one pixel of
// border/default inside and in the layout, Elevation/Card, 4 above and below;
// the label 12 on 19 at Medium in text/disabled, 8 above, 12 at the sides and
// 4 below; each order 218 wide and 40 tall, the default first and ticked. It
// hangs 4 under the header, from its inline end.
const isTheFiles = async (canvasElement: HTMLElement, locale: Locale, kind: ColumnKind, palette: Palette) => {
  const { list, panel, heading, orders } = await menuParts(locale)
  const style = getComputedStyle(panel)
  await expect(panel.getBoundingClientRect().width).toBe(220)
  await expect([px(style.borderTopWidth), px(style.borderTopLeftRadius)]).toEqual([1, 8])
  await expect(style.borderTopColor).toBe(computed(panel, palette['border/default']))
  await expect(style.backgroundColor).toBe(computed(panel, palette['bg/surface']))
  await expect(style.boxShadow).toBe(shadowOf(panel, elevation.card))
  await expect([px(getComputedStyle(list).paddingTop), px(getComputedStyle(list).paddingBottom)]).toEqual([4, 4])
  const label = getComputedStyle(heading)
  await expect(heading.getBoundingClientRect().height).toBe(31)
  await expect([px(label.paddingTop), px(label.paddingBottom), px(label.paddingInlineStart), px(label.paddingInlineEnd)]).toEqual([8, 4, 12, 12])
  await expect([px(label.fontSize), px(label.lineHeight), label.fontWeight]).toEqual([12, 19, '500'])
  await expect(label.color).toBe(computed(heading, palette['text/disabled']))
  const expected = columnOrders(i18nFor(locale), kind)
  await expect(orders.map((order) => order.textContent)).toEqual(expected.map((order) => order.label))
  await expect(orders.map((order) => order.getAttribute('aria-checked'))).toEqual(expected.map((_, index) => String(index === 0)))
  for (const order of orders) {
    const box = order.getBoundingClientRect()
    await expect([box.width, box.height]).toEqual([218, 40])
  }
  const header = canvasElement.querySelector('[aria-haspopup="menu"]')?.parentElement
  if (!(header instanceof HTMLElement)) throw new Error('the header is missing')
  const [under, over] = [header.getBoundingClientRect(), panel.getBoundingClientRect()]
  await expect(over.top - under.bottom).toBe(4)
  await expect(locale === 'fa-IR' ? over.left - under.left : under.right - over.right).toBe(0)
  // Focus starts on the column's order.
  await waitFor(() => expect(orders[0]).toHaveFocus())
}

export const Saved: Story = {
  // 912:82571: the saved column's four orders, the deadline first; 201 tall.
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async ({ canvasElement }) => {
    await isTheFiles(canvasElement, 'fa-IR', 'saved', semantic)
    const { panel } = await menuParts('fa-IR')
    await expect(panel.getBoundingClientRect().height).toBe(201)
  },
}

export const Applied: Story = {
  // 912:83039: the applied column's orders, the waiting time first.
  args: ordersOf('fa-IR', 'applied'),
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  render: (args) => <InTheHeader {...args} kind="applied" />,
  play: async ({ canvasElement }) => {
    await isTheFiles(canvasElement, 'fa-IR', 'applied', semantic)
  },
}

export const Interview: Story = {
  // 912:83507: the interview column's orders, the interview's date first.
  args: ordersOf('fa-IR', 'interview'),
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  render: (args) => <InTheHeader {...args} kind="interview" />,
  play: async ({ canvasElement }) => {
    await isTheFiles(canvasElement, 'fa-IR', 'interview', semantic)
  },
}

export const Offer: Story = {
  // 912:83975: the offer column's three orders, by arrival first; 161 tall.
  args: ordersOf('fa-IR', 'offer'),
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  render: (args) => <InTheHeader {...args} kind="offer" />,
  play: async ({ canvasElement }) => {
    await isTheFiles(canvasElement, 'fa-IR', 'offer', semantic)
    const { panel } = await menuParts('fa-IR')
    await expect(panel.getBoundingClientRect().height).toBe(161)
  },
}

// 919:2886's actions: 4 down, a divider of border/default, then editing the
// stage in text/primary and deleting it in text/error, 40 tall each.
const isTheCustoms = async (locale: Locale, palette: Palette) => {
  const i18n = i18nFor(locale)
  const { list, panel, orders } = await menuParts(locale)
  const divider = within(list).getByRole('separator')
  const edit = within(list).getByRole('menuitem', { name: i18n._('Edit status') })
  const remove = within(list).getByRole('menuitem', { name: i18n._('Delete status') })
  const last = orders.at(-1)
  if (!last) throw new Error('the menu has no orders')
  await expect(divider.getBoundingClientRect().top - last.getBoundingClientRect().bottom).toBe(4)
  await expect(divider.getBoundingClientRect().height).toBe(1)
  await expect(getComputedStyle(divider).borderBottomColor).toBe(computed(divider, palette['border/default']))
  await expect(edit.getBoundingClientRect().top).toBe(divider.getBoundingClientRect().bottom)
  await expect([edit.getBoundingClientRect().height, remove.getBoundingClientRect().height]).toEqual([40, 40])
  await expect(getComputedStyle(edit).color).toBe(computed(edit, palette['text/primary']))
  await expect(getComputedStyle(remove).color).toBe(computed(remove, palette['text/error']))
  await expect(panel.getBoundingClientRect().height).toBe(246)
}

export const Custom: Story = {
  // 919:2886: a stage the reader made orders as the offer column does, and can
  // be edited and deleted from here.
  args: { ...ordersOf('fa-IR', 'custom'), actions: { onEdit: fn(), onDelete: fn() } },
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  render: (args) => <InTheHeader {...args} kind="custom" />,
  play: async ({ canvasElement }) => {
    await isTheFiles(canvasElement, 'fa-IR', 'custom', semantic)
    await isTheCustoms('fa-IR', semantic)
  },
}

export const Choosing: Story = {
  // A press on another order hands it over and closes the menu; the caption
  // then names it, and opening again ticks it.
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async ({ args, canvasElement }) => {
    const i18n = i18nFor('fa-IR')
    const newest = columnOrders(i18n, 'saved')[1]
    const { orders } = await menuParts('fa-IR')
    const second = orders[1]
    if (!newest || !second) throw new Error('the saved column has no second order')
    await userEvent.click(second)
    await expect(args.onChange).toHaveBeenCalledWith(newest.id)
    await expect(args.onClose).toHaveBeenCalledOnce()
    await waitFor(() => expect(within(document.body).queryByRole('menu')).toBeNull())
    const name = `${newest.caption} ${i18n._('in the column')} ${columnName('fa-IR', 'saved')}`
    await userEvent.click(await within(canvasElement).findByRole('button', { name }))
    const again = await menuParts('fa-IR')
    await expect(again.orders.map((order) => order.getAttribute('aria-checked'))).toEqual(['false', 'true', 'false', 'false'])
    await waitFor(() => expect(again.orders[1]).toHaveFocus())
  },
}

export const Keyboard: Story = {
  // Focus starts on the chosen order; the arrows move it, and Escape closes
  // without choosing.
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async ({ args }) => {
    const { orders } = await menuParts('fa-IR')
    await waitFor(() => expect(orders[0]).toHaveFocus())
    await userEvent.keyboard('{ArrowDown}')
    await expect(orders[1]).toHaveFocus()
    await userEvent.keyboard('{Escape}')
    await waitFor(() => expect(within(document.body).queryByRole('menu')).toBeNull())
    await expect(args.onClose).toHaveBeenCalledOnce()
    await expect(args.onChange).not.toHaveBeenCalled()
  },
}

export const CustomActions: Story = {
  // Editing and deleting the stage close the menu and ask the board for them.
  args: { ...ordersOf('fa-IR', 'custom'), actions: { onEdit: fn(), onDelete: fn() } },
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  render: (args) => <InTheHeader {...args} kind="custom" />,
  play: async ({ args, canvasElement }) => {
    const i18n = i18nFor('fa-IR')
    const { actions } = args
    if (!actions) throw new Error('the story gives no actions')
    await userEvent.click(await within(document.body).findByRole('menuitem', { name: i18n._('Edit status') }))
    await expect(actions.onEdit).toHaveBeenCalledOnce()
    await waitFor(() => expect(within(document.body).queryByRole('menu')).toBeNull())
    await userEvent.click(await within(canvasElement).findByRole('button', { expanded: false }))
    await userEvent.click(await within(document.body).findByRole('menuitem', { name: i18n._('Delete status') }))
    await expect(actions.onDelete).toHaveBeenCalledOnce()
    await expect(args.onClose).toHaveBeenCalledTimes(2)
  },
}

export const InEnglish: Story = {
  // The menu hangs from the header's right edge, its inline end in English.
  args: ordersOf('en-US', 'saved'),
  globals: { locale: 'en-US', colorScheme: 'light' },
  play: async ({ canvasElement }) => {
    await isTheFiles(canvasElement, 'en-US', 'saved', semantic)
  },
}

export const Dark: Story = {
  args: { ...ordersOf('fa-IR', 'custom'), actions: { onEdit: fn(), onDelete: fn() } },
  globals: { locale: 'fa-IR', colorScheme: 'dark' },
  render: (args) => <InTheHeader {...args} kind="custom" />,
  play: async ({ canvasElement }) => {
    await isTheFiles(canvasElement, 'fa-IR', 'custom', darkSemantic)
    await isTheCustoms('fa-IR', darkSemantic)
  },
}
