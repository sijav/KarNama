import type { StoryObj } from '@storybook/react-vite'
import { expect, fn, userEvent, waitFor, within } from 'storybook/test'
import { i18n, type Locale } from '../../i18n'
import { formatTimeOfDay } from '../../i18n/formatTimeOfDay'
import { darkSemantic } from '../../theme/darkMode'
import { elevation, semantic } from '../../theme/tokens'
import type { StoryMeta } from '../story-docs/story-meta'
import { HALF_HOURS, TimeList } from './TimeList'

// The file's chosen time, ۱۰:۰۰, and the six its window shows, ۰۹:۰۰ to ۱۱:۳۰.
const TEN = 10 * 60
const WINDOW = [9 * 60, 9 * 60 + 30, 10 * 60, 10 * 60 + 30, 11 * 60, 11 * 60 + 30]

const meta = {
  title: 'Shared/TimeList',
  component: TimeList,
  args: { value: TEN, onChange: fn() },
  // The time is the reader's, which each story sets; every play reads the drawing.
  parameters: { controls: { disable: true } },
} satisfies StoryMeta<typeof TimeList>

export default meta
type Story = StoryObj<typeof meta>

const px = (value: string) => Number.parseFloat(value) || 0

// A value as the browser computes it, borrowed on the host's own inline style
// and put back in the same tick. Never inside waitFor, KN-014.
const borrowed = (host: HTMLElement, property: 'color' | 'boxShadow', value: string) => {
  const previous = host.style[property]
  host.style[property] = value
  const result = getComputedStyle(host)[property]
  host.style[property] = previous
  return result
}

// How opaque a computed colour is: rgb() is whole, rgba() says.
const alphaOf = (colour: string) => Number(/rgba\([^)]*,\s*([\d.]+)\)$/.exec(colour)?.[1] ?? 1)

const listIn = (canvasElement: HTMLElement) => within(canvasElement).getByRole('listbox', { name: i18n._('Time') })
const optionsIn = (list: HTMLElement) => within(list).getAllByRole('option')

// The options the window shows whole.
const shownIn = (list: HTMLElement) => {
  const view = list.getBoundingClientRect()
  return optionsIn(list).filter((option) => {
    const box = option.getBoundingClientRect()
    return box.top >= view.top && box.bottom <= view.bottom
  })
}

// Where an option's time is drawn, its text's own box.
const wordsOf = (option: HTMLElement) => {
  const range = option.ownerDocument.createRange()
  range.selectNodeContents(option)
  return range.getBoundingClientRect()
}

// Node 774:16897: 244 by 216, bg/surface with one pixel of border/default
// inside, radius 10 and its own shadow; the 48 half-hours, six of them shown,
// the first 7 in, each 32 tall and 230 wide, 34 apart, radius 6, its time at
// the inline start 10 in, 13 on 20, Selected, 786:1751, in bg/brand/container
// and text/brand at Medium, the rest with no fill in text/primary at Regular.
const isTheFiles = async (canvasElement: HTMLElement, locale: Locale, palette: Record<keyof typeof semantic, string>, shown: readonly number[], chosen: number | null) => {
  const rtl = locale === 'fa-IR'
  const list = listIn(canvasElement)
  const panel = list.parentElement
  if (!panel) throw new Error('the list has no panel round it')
  const box = panel.getBoundingClientRect()
  await expect([box.width, box.height]).toEqual([244, 216])
  const style = getComputedStyle(panel)
  await expect(px(style.borderTopLeftRadius)).toBe(10)
  await expect([style.borderTopStyle, px(style.borderTopWidth)]).toEqual(['solid', 1])
  await expect(style.borderTopColor).toBe(borrowed(panel, 'color', palette['border/default']))
  await expect(style.backgroundColor).toBe(borrowed(panel, 'color', palette['bg/surface']))
  await expect(style.boxShadow).toBe(borrowed(panel, 'boxShadow', elevation.popover))
  await expect(optionsIn(list).map((option) => option.textContent)).toEqual(HALF_HOURS.map((minutes) => formatTimeOfDay(locale, minutes)))
  const visible = shownIn(list)
  await expect(visible.map((option) => option.textContent)).toEqual(shown.map((minutes) => formatTimeOfDay(locale, minutes)))
  const [first] = visible
  if (!first) throw new Error('the window shows nothing')
  await expect(first.getBoundingClientRect().top - box.top).toBe(7)
  for (const [index, option] of visible.entries()) {
    const row = option.getBoundingClientRect()
    await expect([row.width, row.height, row.top - first.getBoundingClientRect().top]).toEqual([230, 32, index * 34])
    const drawn = getComputedStyle(option)
    await expect([px(drawn.borderTopLeftRadius), px(drawn.fontSize), px(drawn.lineHeight)]).toEqual([6, 13, 20])
    const words = wordsOf(option)
    await expect(Math.round(rtl ? row.right - words.right : words.left - row.left)).toBe(10)
    const isChosen = shown[index] === chosen
    await expect(option.getAttribute('aria-selected')).toBe(String(isChosen))
    if (isChosen) {
      await expect(drawn.backgroundColor).toBe(borrowed(option, 'color', palette['bg/brand/container']))
      await expect([drawn.color, drawn.fontWeight]).toEqual([borrowed(option, 'color', palette['text/brand']), '500'])
    } else {
      await expect(alphaOf(drawn.backgroundColor)).toBe(0)
      await expect([drawn.color, drawn.fontWeight]).toEqual([borrowed(option, 'color', palette['text/primary']), '400'])
    }
  }
}

export const Default: Story = {
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async ({ canvasElement }) => {
    // The file's window: ۰۹:۰۰ to ۱۱:۳۰ with ۱۰:۰۰ chosen, the third.
    await isTheFiles(canvasElement, 'fa-IR', semantic, WINDOW, TEN)
  },
}

export const NothingChosen: Story = {
  // With no time chosen the window opens on the morning, ۰۹:۰۰ first.
  args: { value: null },
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async ({ canvasElement }) => {
    await isTheFiles(canvasElement, 'fa-IR', semantic, WINDOW, null)
    await expect(within(listIn(canvasElement)).queryAllByRole('option', { selected: true })).toEqual([])
  },
}

export const Choose: Story = {
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async ({ args, canvasElement }) => {
    // A press on a time chooses it.
    await userEvent.click(within(listIn(canvasElement)).getByRole('option', { name: formatTimeOfDay('fa-IR', 10 * 60 + 30) }))
    await expect(args.onChange).toHaveBeenCalledOnce()
    await expect(args.onChange).toHaveBeenCalledWith(10 * 60 + 30)
  },
}

export const Hover: Story = {
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async ({ canvasElement }) => {
    // Hover, 786:1749: bg/surface-secondary under the runner's real pointer,
    // since :hover is the browser's hit-testing, KN-225.
    if (!('__KARNAMA_STORY_TEST__' in globalThis)) {
      if (import.meta.env.MODE !== 'test') return
      throw new Error('Hover is running outside Storybook without the story-test flag that .storybook/vitest.setup.ts sets')
    }
    const browser = await import('vitest/browser')
    const option = within(listIn(canvasElement)).getByRole('option', { name: formatTimeOfDay('fa-IR', 10 * 60 + 30) })
    const fill = borrowed(option, 'color', semantic['bg/surface-secondary'])
    await browser.userEvent.hover(option)
    await waitFor(() => expect(getComputedStyle(option).backgroundColor).toBe(fill))
    await expect(getComputedStyle(option).color).toBe(borrowed(option, 'color', semantic['text/primary']))
  },
}

export const KeyboardFocus: Story = {
  // Told to, it puts focus on the chosen time as it mounts; the arrows move it,
  // the keyboard's row taking the Hover fill and the three pixel ring, End goes
  // to the last time and brings it into the window, and Enter chooses.
  args: { autoFocus: true },
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async ({ args, canvasElement }) => {
    const list = listIn(canvasElement)
    const named = (minutes: number) => within(list).getByRole('option', { name: formatTimeOfDay('fa-IR', minutes) })
    await waitFor(() => expect(named(TEN)).toHaveFocus())
    await userEvent.keyboard('{ArrowDown}')
    const next = named(10 * 60 + 30)
    await expect(next).toHaveFocus()
    await expect(getComputedStyle(next).backgroundColor).toBe(borrowed(next, 'color', semantic['bg/surface-secondary']))
    const ring = getComputedStyle(next, '::after')
    await expect([px(ring.borderTopWidth), ring.borderTopColor]).toEqual([3, borrowed(next, 'color', semantic['border/focus'])])
    await userEvent.keyboard('{End}')
    const last = named(23 * 60 + 30)
    await expect(last).toHaveFocus()
    await waitFor(() => expect(shownIn(list)).toContain(last))
    await userEvent.keyboard('{Enter}')
    await expect(args.onChange).toHaveBeenCalledWith(23 * 60 + 30)
  },
}

export const InEnglish: Story = {
  globals: { locale: 'en-US', colorScheme: 'light' },
  play: async ({ canvasElement }) => {
    // Latin digits, each time at the left, the inline start.
    await isTheFiles(canvasElement, 'en-US', semantic, WINDOW, TEN)
  },
}

export const Dark: Story = {
  globals: { locale: 'fa-IR', colorScheme: 'dark' },
  play: async ({ canvasElement }) => {
    await isTheFiles(canvasElement, 'fa-IR', darkSemantic, WINDOW, TEN)
  },
}
