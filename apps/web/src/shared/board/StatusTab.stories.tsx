import { useLingui } from '@lingui/react'
import { Box } from '@mui/material'
import type { StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { expect, fn, userEvent, within } from 'storybook/test'
import { i18n, type Locale } from '../../i18n'
import { formatCount } from '../../i18n/formatCount'
import { darkSemantic, darkStatus } from '../../theme/darkMode'
import { semantic, spacing, status } from '../../theme/tokens'
import type { StoryMeta } from '../story-docs/story-meta'
import { fixtures } from '../story-fixtures'
import { AddStatusTab, StatusTab, type StatusTabProps } from './StatusTab'

const FA = fixtures('fa-IR')
const EN = fixtures('en-US')

// The mobile board's row: its tabs and the add tab after them, the row a
// tablist the board names; pressing a tab chooses it.
const InARow = (args: StatusTabProps) => {
  const { i18n } = useLingui()
  const [chosen, setChosen] = useState(args.selected)
  return (
    <Box role="tablist" aria-label={i18n._('Status')} sx={{ display: 'flex', alignItems: 'center', gap: `${spacing.xs}px` }}>
      <StatusTab
        {...args}
        selected={chosen}
        onSelect={() => {
          setChosen(true)
          args.onSelect()
        }}
      />
    </Box>
  )
}

const meta = {
  title: 'Shared/StatusTab',
  component: StatusTab,
  args: { name: FA.names.applied, count: 3, token: 'applied', selected: false, onSelect: fn() },
  parameters: { controls: { include: ['name', 'count', 'token', 'selected'] } },
  render: (args) => <InARow {...args} />,
} satisfies StoryMeta<typeof StatusTab>

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
type Statuses = Record<keyof typeof status, { base: string; container: string }>

const tabIn = (canvasElement: HTMLElement, args: StatusTabProps, locale: Locale) =>
  within(canvasElement).getByRole('tab', { name: `${args.name} ${formatCount(locale, args.count)}` })

// Node 1274:3275: a pill 36 tall at radius full, an edge of one counted in the
// layout, 14 inside it at the sides and 6 between its parts; from the inline
// start the 8 dot in the status's base, the name at 13 on 20, the count at 12
// on 19 in the reader's digits. Default is bg/surface with an edge of
// border/default, the name text/primary at Medium and the count
// text/secondary; Active is bg/brand/container with an edge of text/brand and
// both text/brand, the name SemiBold.
const isTheFiles = async (canvasElement: HTMLElement, args: StatusTabProps, locale: Locale, palette: Palette, statuses: Statuses) => {
  const edge: keyof Palette = args.selected ? 'text/brand' : 'border/default'
  const fill: keyof Palette = args.selected ? 'bg/brand/container' : 'bg/surface'
  const words: keyof Palette = args.selected ? 'text/brand' : 'text/primary'
  const quiet: keyof Palette = args.selected ? 'text/brand' : 'text/secondary'
  const token: keyof Statuses = args.token ?? 'new'
  const tab = tabIn(canvasElement, args, locale)
  await expect(tab).toHaveAttribute('aria-selected', String(args.selected))
  const box = tab.getBoundingClientRect()
  await expect(box.height).toBe(36)
  const style = getComputedStyle(tab)
  await expect([px(style.borderTopWidth), style.borderTopStyle, px(style.paddingInlineStart), px(style.paddingInlineEnd), px(style.columnGap)]).toEqual([1, 'solid', 14, 14, 6])
  await expect(px(style.borderTopLeftRadius)).toBeGreaterThanOrEqual(18)
  await expect(style.borderTopColor).toBe(computed(tab, palette[edge]))
  await expect(style.backgroundColor).toBe(computed(tab, palette[fill]))
  const [dot, label, figure] = [...tab.children]
  if (!(dot instanceof HTMLElement) || !(label instanceof HTMLElement) || !(figure instanceof HTMLElement)) throw new Error('the tab is missing a part')
  const spot = dot.getBoundingClientRect()
  await expect([spot.width, spot.height]).toEqual([8, 8])
  await expect(getComputedStyle(dot).backgroundColor).toBe(computed(dot, statuses[token].base))
  await expect(dot.getAttribute('aria-hidden')).toBe('true')
  const rtl = style.direction === 'rtl'
  await expect(Math.round(rtl ? box.right - spot.right : spot.left - box.left)).toBe(15)
  const named = getComputedStyle(label)
  await expect([px(named.fontSize), px(named.lineHeight), named.fontWeight]).toEqual([13, 20, args.selected ? '600' : '500'])
  await expect(named.color).toBe(computed(label, palette[words]))
  const counted = getComputedStyle(figure)
  await expect([px(counted.fontSize), px(counted.lineHeight), counted.fontWeight]).toEqual([12, 19, '500'])
  await expect(counted.color).toBe(computed(figure, palette[quiet]))
  await expect(Math.round(rtl ? spot.left - label.getBoundingClientRect().right : label.getBoundingClientRect().left - spot.right)).toBe(6)
  await expect(Math.round(rtl ? label.getBoundingClientRect().left - figure.getBoundingClientRect().right : figure.getBoundingClientRect().left - label.getBoundingClientRect().right)).toBe(6)
}

export const Default: Story = {
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async ({ args, canvasElement }) => {
    await isTheFiles(canvasElement, args, 'fa-IR', semantic, status)
    // Not the chosen tab, so not the row's Tab stop.
    await expect(tabIn(canvasElement, args, 'fa-IR')).toHaveAttribute('tabindex', '-1')
  },
}

export const Active: Story = {
  args: { selected: true },
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async ({ args, canvasElement }) => {
    await isTheFiles(canvasElement, args, 'fa-IR', semantic, status)
    await expect(tabIn(canvasElement, args, 'fa-IR')).toHaveAttribute('tabindex', '0')
  },
}

export const Choose: Story = {
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async ({ args, canvasElement }) => {
    // A press chooses the tab, and the board shows its column.
    await userEvent.click(tabIn(canvasElement, args, 'fa-IR'))
    await expect(args.onSelect).toHaveBeenCalledOnce()
    await isTheFiles(canvasElement, { ...args, selected: true }, 'fa-IR', semantic, status)
  },
}

export const WithoutADot: Story = {
  // The Dot property off: the name leads.
  render: ({ token: _token, ...args }) => <InARow {...args} />,
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async ({ args, canvasElement }) => {
    const tab = tabIn(canvasElement, args, 'fa-IR')
    await expect(tab.children).toHaveLength(2)
    const rtl = getComputedStyle(tab).direction === 'rtl'
    const [label] = [...tab.children]
    if (!(label instanceof HTMLElement)) throw new Error('the tab has no name')
    await expect(Math.round(rtl ? tab.getBoundingClientRect().right - label.getBoundingClientRect().right : label.getBoundingClientRect().left - tab.getBoundingClientRect().left)).toBe(15)
  },
}

export const Add: Story = {
  // State=Add, 1274:3272: 38 by 36, a dashed edge of border/default, the 16
  // plus in text/secondary; a press makes a new status.
  render: () => {
    const onAdd = fn()
    return <AddStatusTab onAdd={onAdd} />
  },
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async ({ canvasElement }) => {
    const add = within(canvasElement).getByRole('button', { name: i18n._('Add status') })
    const box = add.getBoundingClientRect()
    await expect([box.width, box.height]).toEqual([38, 36])
    const style = getComputedStyle(add)
    await expect([px(style.borderTopWidth), style.borderTopStyle]).toEqual([1, 'dashed'])
    await expect(style.borderTopColor).toBe(computed(add, semantic['border/default']))
    await expect(style.color).toBe(computed(add, semantic['text/secondary']))
    const plus = add.querySelector('svg')?.getBoundingClientRect()
    await expect([plus?.width, plus?.height]).toEqual([16, 16])
  },
}

export const KeyboardFocus: Story = {
  args: { selected: true },
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async ({ args, canvasElement }) => {
    // The chosen tab is the row's Tab stop, and wears the ring inside its edge.
    const tab = tabIn(canvasElement, args, 'fa-IR')
    await userEvent.tab()
    await expect(tab).toHaveFocus()
    const ring = getComputedStyle(tab, '::after')
    await expect([ring.borderTopStyle, px(ring.borderTopWidth)]).toEqual(['solid', 3])
    await expect(ring.borderTopColor).toBe(computed(tab, semantic['border/focus']))
  },
}

export const InEnglish: Story = {
  args: { name: EN.names.applied },
  globals: { locale: 'en-US', colorScheme: 'light' },
  play: async ({ args, canvasElement }) => {
    await isTheFiles(canvasElement, args, 'en-US', semantic, status)
  },
}

export const Dark: Story = {
  args: { selected: true },
  globals: { locale: 'fa-IR', colorScheme: 'dark' },
  play: async ({ args, canvasElement }) => {
    await isTheFiles(canvasElement, args, 'fa-IR', darkSemantic, darkStatus)
  },
}
