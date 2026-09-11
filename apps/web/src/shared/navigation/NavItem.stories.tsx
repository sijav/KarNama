import { setupI18n } from '@lingui/core'
import { Box } from '@mui/material'
import type { StoryObj } from '@storybook/react-vite'
import { expect, fn, userEvent, waitFor, within } from 'storybook/test'
import type { Locale } from '../../i18n'
import { messages as en } from '../../i18n/locales/en-US'
import { messages as fa } from '../../i18n/locales/fa-IR'
import { semantic } from '../../theme/tokens'
import type { StoryMeta } from '../story-docs/story-meta'
import { CURRENT } from './destinations'
import { NavItem } from './NavItem'

// The sidebar gives its items 208, its 240 less 16 either side.
const ROW = 208

// The board's name, read from the catalog in the language a story pins, so the
// args hold what the canvas draws.
const boardIn = (locale: Locale) => {
  const i18n = setupI18n({ locale, messages: { [locale]: locale === 'fa-IR' ? fa : en } })
  return i18n._('My job opportunities')
}

const meta = {
  title: 'Shared/NavItem',
  component: NavItem,
  args: { icon: 'file', label: boardIn('fa-IR'), active: false, onClick: fn() },
  parameters: { controls: { include: ['icon', 'label', 'active'] } },
  decorators: [
    (Story) => (
      <Box sx={{ width: ROW }}>
        <Story />
      </Box>
    ),
  ],
} satisfies StoryMeta<typeof NavItem>

export default meta
type Story = StoryObj<typeof meta>

const px = (value: string) => Number.parseFloat(value) || 0

// A token's value as the browser computes it, borrowed on the host's own
// inline style and put back in the same tick. Never inside waitFor, KN-014.
const computed = (host: HTMLElement, property: 'color' | 'backgroundColor', value: string) => {
  const previous = host.style[property]
  host.style[property] = value
  const result = getComputedStyle(host)[property]
  host.style[property] = previous
  return result
}

export const Default: Story = {
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async ({ args, canvasElement }) => {
    // Node 184:9: 208 by 44, radius md, 12 of padding, the 20 icon at the
    // inline start and 8 after it the label at 14 and Medium in
    // text/secondary, in the page's font; nothing behind it.
    const item = within(canvasElement).getByRole('button', { name: args.label })
    const box = item.getBoundingClientRect()
    const style = getComputedStyle(item)
    await expect([box.width, box.height]).toEqual([ROW, 44])
    await expect([px(style.paddingLeft), px(style.borderTopLeftRadius)]).toEqual([12, 8])
    const icon = item.querySelector('svg')
    if (!icon) throw new Error('the item has no icon')
    await expect([icon.getBoundingClientRect().width, Math.round(box.right - icon.getBoundingClientRect().right)]).toEqual([20, 12])
    const label = within(item).getByText(args.label)
    await expect(Math.round(icon.getBoundingClientRect().left - label.getBoundingClientRect().right)).toBe(8)
    await expect([px(style.fontSize), Number(style.fontWeight)]).toEqual([14, 500])
    await expect(style.color).toBe(computed(item, 'color', semantic['text/secondary']))
    await expect(style.fontFamily).toBe(getComputedStyle(canvasElement).fontFamily)
    await expect(item).not.toHaveAttribute('aria-current')
    await userEvent.click(item)
    await expect(args.onClick).toHaveBeenCalledTimes(1)
  },
}

export const Active: Story = {
  args: { active: true },
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async ({ args, canvasElement }) => {
    // Node 184:13: bg/brand/container behind text/brand, and the current page.
    const item = within(canvasElement).getByRole('button', { name: args.label })
    await expect(getComputedStyle(item).backgroundColor).toBe(computed(item, 'backgroundColor', semantic['bg/brand/container']))
    await expect(getComputedStyle(item).color).toBe(computed(item, 'color', semantic['text/brand']))
    await expect(item.getAttribute('aria-current')).toBe(CURRENT)
  },
}

export const Hover: Story = {
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async ({ args, canvasElement }) => {
    // Node 512:738: bg/surface-secondary under the pointer, over the
    // reaction's 120 ms. The browser's own pointer, which only the runner has,
    // KN-225.
    if (!('__KARNAMA_STORY_TEST__' in globalThis)) return
    const browser = await import('vitest/browser')
    const item = within(canvasElement).getByRole('button', { name: args.label })
    const hovered = computed(item, 'backgroundColor', semantic['bg/surface-secondary'])
    await expect(getComputedStyle(item).transitionDuration).toBe('0.12s')
    await browser.userEvent.hover(item)
    await waitFor(() => expect(getComputedStyle(item).backgroundColor).toBe(hovered))
  },
}

export const Focus: Story = {
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async ({ args, canvasElement }) => {
    // The file draws no focus: the keyboard's is three pixels of border/focus
    // inside the row, as the Icon Button's.
    const item = within(canvasElement).getByRole('button', { name: args.label })
    await userEvent.tab()
    await expect(item).toHaveFocus()
    await waitFor(() => expect(px(getComputedStyle(item, '::after').borderTopWidth)).toBe(3))
  },
}

export const InEnglish: Story = {
  args: { label: boardIn('en-US') },
  globals: { locale: 'en-US' },
  play: async ({ args, canvasElement }) => {
    // Left to right, the icon is at the left.
    const item = within(canvasElement).getByRole('button', { name: args.label })
    const icon = item.querySelector('svg')
    if (!icon) throw new Error('the item has no icon')
    await expect(Math.round(icon.getBoundingClientRect().left - item.getBoundingClientRect().left)).toBe(12)
  },
}
