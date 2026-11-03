import type { StoryObj } from '@storybook/react-vite'
import { expect, fn, userEvent, waitFor, within } from 'storybook/test'
import { i18n } from '../../i18n'
import { darkSemantic } from '../../theme/darkMode'
import { semantic } from '../../theme/tokens'
import { GLYPHS } from '../icon'
import type { StoryMeta } from '../story-docs/story-meta'
import { AddStatusColumn } from './AddStatusColumn'

const meta = {
  title: 'Shared/AddStatusColumn',
  component: AddStatusColumn,
  args: { onAdd: fn() },
} satisfies StoryMeta<typeof AddStatusColumn>

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

// How opaque a computed colour is: rgb() is whole, rgba() says.
const alphaOf = (colour: string) => Number(/rgba\([^)]*,\s*([\d.]+)\)$/.exec(colour)?.[1] ?? 1)

const columnIn = (canvasElement: HTMLElement) => within(canvasElement).getByRole('button', { name: i18n._('Add status') })

// What node 961:95530 draws at rest, State=Default: 300 by 50, an edge of one
// dashed in text/disabled and counted in the layout, 13 above and below and 16
// at the sides, radius 16 and no fill; centred in it the set's plus at 18 and 8
// after it «افزودن وضعیت» at 14 on 22 and Medium, both in text/secondary.
const isAtRest = async (column: HTMLElement, palette: Record<keyof typeof semantic, string>) => {
  const style = getComputedStyle(column)
  const box = column.getBoundingClientRect()
  await expect([box.width, box.height]).toEqual([300, 50])
  await expect([px(style.borderTopWidth), style.borderTopStyle]).toEqual([1, 'dashed'])
  await expect(style.borderTopColor).toBe(computed(column, palette['text/disabled']))
  await expect([px(style.paddingTop), px(style.paddingBottom), px(style.paddingInlineStart), px(style.paddingInlineEnd)]).toEqual([13, 13, 16, 16])
  await expect([px(style.borderTopLeftRadius), px(style.columnGap)]).toEqual([16, 8])
  await expect(alphaOf(style.backgroundColor)).toBe(0)
  await expect([px(style.fontSize), px(style.lineHeight), style.fontWeight]).toEqual([14, 22, '500'])
  await expect(style.color).toBe(computed(column, palette['text/secondary']))
  const plus = column.querySelector('svg')
  if (!plus) throw new Error('no plus')
  const mark = plus.getBoundingClientRect()
  await expect([mark.width, mark.height]).toEqual([18, 18])
  const paths = [...plus.querySelectorAll('path')]
  await expect(paths.map((path) => path.getAttribute('d'))).toEqual(GLYPHS.plus.stroke)
  for (const path of paths) await expect(px(getComputedStyle(path).strokeWidth)).toBe(2)
  // Centred: as much room before the plus as after the label, and the plus
  // leads, on the label's right in Persian and on its left in English.
  const range = column.ownerDocument.createRange()
  range.selectNodeContents(column)
  const content = range.getBoundingClientRect()
  await expect(Math.abs(content.left - box.left - (box.right - content.right))).toBeLessThanOrEqual(1)
  const rtl = style.direction === 'rtl'
  await expect(rtl ? mark.right : mark.left).toBe(rtl ? content.right : content.left)
}

export const Default: Story = {
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async ({ args, canvasElement }) => {
    const column = columnIn(canvasElement)
    await isAtRest(column, semantic)
    await userEvent.click(column)
    await expect(args.onAdd).toHaveBeenCalledOnce()
  },
}

export const Hover: Story = {
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async ({ canvasElement }) => {
    const column = columnIn(canvasElement)
    // A real pointer, since :hover is the browser's hit-testing, KN-225.
    if (!('__KARNAMA_STORY_TEST__' in globalThis)) {
      if (import.meta.env.MODE !== 'test') return
      throw new Error('Hover is running outside Storybook without the story-test flag that .storybook/vitest.setup.ts sets')
    }
    const browser = await import('vitest/browser')
    // State=Hover: the same column on bg/surface-secondary, its edge unchanged.
    // Worked out before waiting, KN-014.
    const [fill, edge] = [computed(column, semantic['bg/surface-secondary']), computed(column, semantic['text/disabled'])]
    await browser.userEvent.hover(column)
    await waitFor(() => expect(getComputedStyle(column).backgroundColor).toBe(fill))
    await expect(getComputedStyle(column).borderTopColor).toBe(edge)
  },
}

export const KeyboardFocus: Story = {
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async ({ canvasElement }) => {
    const column = columnIn(canvasElement)
    // A real Tab, which only the runner has; KN-225's flag, as Hover's.
    if (!('__KARNAMA_STORY_TEST__' in globalThis)) {
      if (import.meta.env.MODE !== 'test') return
      throw new Error('KeyboardFocus is running outside Storybook without the story-test flag that .storybook/vitest.setup.ts sets')
    }
    const browser = await import('vitest/browser')
    await browser.userEvent.keyboard('{Tab}')
    await expect(column).toHaveFocus()
    // The Add Stage's ring, three wide in border/focus inside the edge, since
    // the file draws it no focus.
    const ring = getComputedStyle(column, '::after')
    await expect([ring.borderTopStyle, px(ring.borderTopWidth)]).toEqual(['solid', 3])
    await expect(ring.borderTopColor).toBe(computed(column, semantic['border/focus']))
  },
}

export const InEnglish: Story = {
  globals: { locale: 'en-US', colorScheme: 'light' },
  play: async ({ canvasElement }) => {
    await isAtRest(columnIn(canvasElement), semantic)
  },
}

export const Dark: Story = {
  globals: { locale: 'fa-IR', colorScheme: 'dark' },
  play: async ({ canvasElement }) => {
    await isAtRest(columnIn(canvasElement), darkSemantic)
  },
}
