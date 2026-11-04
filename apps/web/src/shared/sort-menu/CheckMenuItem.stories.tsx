import { useLingui } from '@lingui/react'
import { MenuList, Paper } from '@mui/material'
import type { StoryObj } from '@storybook/react-vite'
import { expect, fn, userEvent, waitFor, within } from 'storybook/test'
import { i18nFor, type Locale } from '../../i18n'
import { darkSemantic } from '../../theme/darkMode'
import { semantic } from '../../theme/tokens'
import type { StoryMeta } from '../story-docs/story-meta'
import { CheckMenuItem, type CheckMenuItemProps } from './CheckMenuItem'
import { columnOrders } from './columnOrders'

// The sort menu's items are 218 wide inside its one pixel edge.
const ITEM_WIDTH = 218

// An order of the saved column, as its menu names it.
const orderOf = (locale: Locale, index: number) => {
  const order = columnOrders(i18nFor(locale), 'saved')[index]
  if (!order) throw new Error('the saved column has no such order')
  return order.label
}

// The item in a menu of its own, as the sort menu holds it, on its panel.
const InTheMenu = (args: CheckMenuItemProps) => {
  const { i18n } = useLingui()
  return (
    <Paper elevation={0} sx={(theme) => ({ width: ITEM_WIDTH, backgroundColor: theme.karnama.semantic['bg/surface'], backgroundImage: 'none' })}>
      <MenuList aria-label={i18n._('Sort this column')} disablePadding>
        <CheckMenuItem {...args} />
      </MenuList>
    </Paper>
  )
}

const meta = {
  title: 'Shared/CheckMenuItem',
  component: CheckMenuItem,
  args: { label: orderOf('fa-IR', 1), selected: false, onClick: fn() },
  parameters: { controls: { include: ['label', 'selected'] } },
  render: (args) => <InTheMenu {...args} />,
} satisfies StoryMeta<typeof CheckMenuItem>

export default meta
type Story = StoryObj<typeof meta>

const px = (value: string) => Number.parseFloat(value) || 0

// A colour as the browser computes it, borrowed on the host's own inline style
// and put back in the same tick. Never inside waitFor, KN-014.
const computed = (host: HTMLElement, value: string) => {
  const previous = host.style.color
  host.style.color = value
  const result = getComputedStyle(host).color
  host.style.color = previous
  return result
}

type Palette = Record<keyof typeof semantic, string>

// The item's parts: its row, the tick's room at the inline start and the label.
const partsOf = (canvasElement: HTMLElement, args: CheckMenuItemProps) => {
  const item = within(canvasElement).getByRole('menuitemradio', { name: args.label })
  const [room, label] = [...item.children]
  if (!(room instanceof HTMLElement) || !(label instanceof HTMLElement)) throw new Error('the item is missing a part')
  return { item, room, label }
}

// Node 912:40044: 40 tall, 12 at the sides and 8 between, the tick's room 16
// at the inline start; the label 14 on 22, at Regular in text/primary, or at
// Medium in text/brand with the tick when chosen.
const isTheFiles = async (canvasElement: HTMLElement, args: CheckMenuItemProps, palette: Palette, direction: 'rtl' | 'ltr') => {
  const { item, room, label } = partsOf(canvasElement, args)
  const style = getComputedStyle(item)
  await expect(item.getBoundingClientRect().height).toBe(40)
  await expect([px(style.paddingInlineStart), px(style.paddingInlineEnd), px(style.columnGap)]).toEqual([12, 12, 8])
  const [box, spot, words] = [item.getBoundingClientRect(), room.getBoundingClientRect(), label.getBoundingClientRect()]
  await expect([spot.width, spot.height]).toEqual([16, 16])
  // The room leads: at the right in Persian, at the left in English.
  if (direction === 'rtl') {
    await expect(box.right - spot.right).toBe(12)
    await expect(spot.left - words.right).toBe(8)
  } else {
    await expect(spot.left - box.left).toBe(12)
    await expect(words.left - spot.right).toBe(8)
  }
  const set = getComputedStyle(label)
  await expect([px(set.fontSize), px(set.lineHeight)]).toEqual([14, 22])
  await expect(set.fontWeight).toBe(args.selected ? '500' : '400')
  await expect(set.color).toBe(computed(label, args.selected ? palette['text/brand'] : palette['text/primary']))
  await expect(item.getAttribute('aria-checked')).toBe(String(args.selected))
  const tick = room.querySelector('svg')
  if (args.selected) {
    if (!tick) throw new Error('the chosen item draws no tick')
    await expect(getComputedStyle(tick).color).toBe(computed(label, palette['text/brand']))
  } else {
    await expect(tick).toBeNull()
  }
}

// Under a real pointer the row fills with bg/surface-secondary. Only the test
// runner has a pointer to move.
const hovers = async (canvasElement: HTMLElement, args: CheckMenuItemProps, palette: Palette) => {
  if (!('__KARNAMA_STORY_TEST__' in globalThis)) return
  const { item } = partsOf(canvasElement, args)
  const fill = computed(item, palette['bg/surface-secondary'])
  const browser = await import('vitest/browser')
  await browser.userEvent.hover(item)
  await waitFor(() => expect(getComputedStyle(item).backgroundColor).toBe(fill))
}

export const Default: Story = {
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async ({ args, canvasElement }) => {
    await isTheFiles(canvasElement, args, semantic, 'rtl')
    await expect(getComputedStyle(partsOf(canvasElement, args).item).backgroundColor).toBe('rgba(0, 0, 0, 0)')
  },
}

export const Hover: Story = {
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async ({ args, canvasElement }) => {
    await hovers(canvasElement, args, semantic)
  },
}

export const Selected: Story = {
  args: { label: orderOf('fa-IR', 0), selected: true },
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async ({ args, canvasElement }) => {
    await isTheFiles(canvasElement, args, semantic, 'rtl')
    // Chosen, it keeps the panel's ground until the pointer comes.
    await expect(getComputedStyle(partsOf(canvasElement, args).item).backgroundColor).toBe('rgba(0, 0, 0, 0)')
  },
}

export const SelectedHover: Story = {
  args: { label: orderOf('fa-IR', 0), selected: true },
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async ({ args, canvasElement }) => {
    await hovers(canvasElement, args, semantic)
  },
}

export const KeyboardFocus: Story = {
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async ({ args, canvasElement }) => {
    // Tab reaches the item, which takes the hover's fill with the ring, and
    // Enter chooses it.
    const { item } = partsOf(canvasElement, args)
    await userEvent.tab()
    await expect(item).toHaveFocus()
    await waitFor(() => expect(getComputedStyle(item).backgroundColor).toBe(computed(item, semantic['bg/surface-secondary'])))
    await expect(px(getComputedStyle(item, '::after').borderTopWidth)).toBe(3)
    await userEvent.keyboard('{Enter}')
    await expect(args.onClick).toHaveBeenCalledOnce()
  },
}

export const InEnglish: Story = {
  args: { label: orderOf('en-US', 0), selected: true },
  globals: { locale: 'en-US', colorScheme: 'light' },
  play: async ({ args, canvasElement }) => {
    await isTheFiles(canvasElement, args, semantic, 'ltr')
  },
}

export const Dark: Story = {
  args: { label: orderOf('fa-IR', 0), selected: true },
  globals: { locale: 'fa-IR', colorScheme: 'dark' },
  play: async ({ args, canvasElement }) => {
    await isTheFiles(canvasElement, args, darkSemantic, 'rtl')
  },
}
