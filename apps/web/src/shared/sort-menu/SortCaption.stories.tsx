import type { StoryObj } from '@storybook/react-vite'
import { expect, fn, userEvent, waitFor, within } from 'storybook/test'
import { i18nFor, type Locale } from '../../i18n'
import { darkSemantic } from '../../theme/darkMode'
import { semantic } from '../../theme/tokens'
import type { StoryMeta } from '../story-docs/story-meta'
import { fixtures } from '../story-fixtures'
import { columnOrders } from './columnOrders'
import { SortCaption, type SortCaptionProps } from './SortCaption'

// The saved column's caption and name, in the story's language.
const savedColumn = (locale: Locale) => {
  const order = columnOrders(i18nFor(locale), 'saved')[0]
  const column = fixtures(locale).statuses[0]
  if (!order || !column) throw new Error('the fixtures hold no saved column')
  return { caption: order.caption, column: column.name }
}

const meta = {
  title: 'Shared/SortCaption',
  component: SortCaption,
  args: { ...savedColumn('fa-IR'), open: false, onOpen: fn() },
  parameters: { controls: { include: ['caption', 'column', 'open'] } },
} satisfies StoryMeta<typeof SortCaption>

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

// The caption's parts: the button, its words and the ⋯.
const partsOf = (canvasElement: HTMLElement, args: SortCaptionProps, locale: Locale) => {
  const button = within(canvasElement).getByRole('button', { name: `${args.caption} ${i18nFor(locale)._('in the column')} ${args.column}` })
  const words = within(button).getByText(args.caption)
  const dots = button.querySelector('svg')
  if (!dots) throw new Error('the caption draws no ⋯')
  return { button, words, dots }
}

// Node 961:97159: the caption 11 on 17 at Regular in text/disabled, then the
// ⋯, 16 in text/secondary, 8 after it at the inline end; 17 tall in all.
const isTheFiles = async (canvasElement: HTMLElement, args: SortCaptionProps, locale: Locale, palette: Palette) => {
  const { button, words, dots } = partsOf(canvasElement, args, locale)
  const style = getComputedStyle(words)
  await expect([px(style.fontSize), px(style.lineHeight), style.fontWeight]).toEqual([11, 17, '400'])
  await expect(getComputedStyle(button).color).toBe(computed(button, palette['text/disabled']))
  await expect(button.getBoundingClientRect().height).toBe(17)
  const [text, icon] = [words.getBoundingClientRect(), dots.getBoundingClientRect()]
  await expect([icon.width, icon.height]).toEqual([16, 16])
  await expect(locale === 'fa-IR' ? text.left - icon.right : icon.left - text.right).toBe(8)
  await expect(getComputedStyle(dots).color).toBe(computed(dots, palette['text/secondary']))
  await expect(button.getAttribute('aria-haspopup')).toBe('menu')
  await expect(button.getAttribute('aria-expanded')).toBe(String(args.open))
}

export const Default: Story = {
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async ({ args, canvasElement }) => {
    await isTheFiles(canvasElement, args, 'fa-IR', semantic)
  },
}

export const Hover: Story = {
  // Under a real pointer the caption turns text/primary and the ⋯ keeps its
  // colour. Only the test runner has a pointer to move.
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async ({ args, canvasElement }) => {
    if (!('__KARNAMA_STORY_TEST__' in globalThis)) return
    const { button, dots } = partsOf(canvasElement, args, 'fa-IR')
    const [primary, secondary] = [computed(button, semantic['text/primary']), computed(dots, semantic['text/secondary'])]
    const browser = await import('vitest/browser')
    await browser.userEvent.hover(button)
    await waitFor(() => expect(getComputedStyle(button).color).toBe(primary))
    await expect(getComputedStyle(dots).color).toBe(secondary)
  },
}

export const KeyboardFocus: Story = {
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async ({ args, canvasElement }) => {
    // Tab reaches it with the Inline Link's outline, three wide and two clear,
    // and Enter asks for the menu.
    const { button } = partsOf(canvasElement, args, 'fa-IR')
    await userEvent.tab()
    await expect(button).toHaveFocus()
    const style = getComputedStyle(button)
    await expect([style.outlineStyle, px(style.outlineWidth), px(style.outlineOffset)]).toEqual(['solid', 3, 2])
    await expect(style.outlineColor).toBe(computed(button, semantic['border/focus']))
    await userEvent.keyboard('{Enter}')
    await expect(args.onOpen).toHaveBeenCalledOnce()
  },
}

export const Open: Story = {
  // While its menu is open it says so, and looks as it does at rest, as the
  // board's frames draw it.
  args: { open: true },
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async ({ args, canvasElement }) => {
    await isTheFiles(canvasElement, args, 'fa-IR', semantic)
  },
}

export const InEnglish: Story = {
  args: savedColumn('en-US'),
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
