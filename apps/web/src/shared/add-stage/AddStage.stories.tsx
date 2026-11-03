import type { StoryObj } from '@storybook/react-vite'
import { expect, fn, userEvent, waitFor, within } from 'storybook/test'
import { darkSemantic } from '../../theme/darkMode'
import { semantic } from '../../theme/tokens'
import type { StoryMeta } from '../story-docs/story-meta'
import { AddStage } from './AddStage'

const meta = {
  title: 'Shared/AddStage',
  component: AddStage,
  args: { onClick: fn() },
} satisfies StoryMeta<typeof AddStage>

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

const chipIn = (canvasElement: HTMLElement) => within(canvasElement).getByRole('button')

// What node 961:101245 draws at rest, State=Default: a pill 30 high, an edge of
// one dashed in bg/brand/default and counted in the layout, 3 above and below
// and 12 at the sides, the 16 plus at the inline start and 4 after it the label
// at 13 on 22 and Medium in text/brand.
const isAtRest = async (chip: HTMLElement, palette: Record<keyof typeof semantic, string>) => {
  const style = getComputedStyle(chip)
  const box = chip.getBoundingClientRect()
  await expect(Math.round(box.height)).toBe(30)
  await expect([px(style.borderTopWidth), style.borderTopStyle]).toEqual([1, 'dashed'])
  await expect(style.borderTopColor).toBe(computed(chip, palette['bg/brand/default']))
  await expect(px(style.borderTopLeftRadius)).toBeGreaterThanOrEqual(box.height / 2)
  await expect([px(style.paddingTop), px(style.paddingBottom), px(style.paddingInlineStart), px(style.paddingInlineEnd)]).toEqual([
    3, 3, 12, 12,
  ])
  await expect(px(style.columnGap)).toBe(4)
  await expect([px(style.fontSize), px(style.lineHeight), style.fontWeight]).toEqual([13, 22, '500'])
  await expect(style.color).toBe(computed(chip, palette['text/brand']))
  const plus = chip.querySelector('svg')
  if (!plus) throw new Error('no plus')
  const plusBox = plus.getBoundingClientRect()
  await expect([plusBox.width, plusBox.height]).toEqual([16, 16])
  // The plus leads the label: on its right in Persian, on its left in English.
  const rtl = style.direction === 'rtl'
  await expect(Math.round(rtl ? box.right - 1 - 12 - plusBox.right : plusBox.left - box.left - 1 - 12)).toBe(0)
}

export const Default: Story = {
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async ({ args, canvasElement }) => {
    const chip = chipIn(canvasElement)
    await isAtRest(chip, semantic)
    await userEvent.click(chip)
    await expect(args.onClick).toHaveBeenCalledOnce()
  },
}

export const InEnglish: Story = {
  globals: { locale: 'en-US', colorScheme: 'light' },
  play: async ({ canvasElement }) => {
    await isAtRest(chipIn(canvasElement), semantic)
  },
}

export const Dark: Story = {
  globals: { locale: 'fa-IR', colorScheme: 'dark' },
  play: async ({ canvasElement }) => {
    await isAtRest(chipIn(canvasElement), darkSemantic)
  },
}

export const Hover: Story = {
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async ({ canvasElement }) => {
    const chip = chipIn(canvasElement)
    // A real pointer, since :hover is the browser's hit-testing; in the
    // published Storybook there is none to move, so hover the chip yourself.
    // The runner is known by the flag .storybook/vitest.setup.ts sets, KN-225.
    if (!('__KARNAMA_STORY_TEST__' in globalThis)) {
      if (import.meta.env.MODE !== 'test') return
      throw new Error('Hover is running outside Storybook without the story-test flag that .storybook/vitest.setup.ts sets')
    }
    const browser = await import('vitest/browser')
    // State=Hover: the same edge and label over bg/surface-secondary. Worked
    // out before waiting, KN-014.
    const [fill, edge] = [computed(chip, semantic['bg/surface-secondary']), computed(chip, semantic['bg/brand/default'])]
    await browser.userEvent.hover(chip)
    await waitFor(() => expect(getComputedStyle(chip).backgroundColor).toBe(fill))
    await expect(getComputedStyle(chip).borderTopColor).toBe(edge)
  },
}

export const KeyboardFocus: Story = {
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async ({ canvasElement }) => {
    const chip = chipIn(canvasElement)
    // A real Tab, which only the runner has; KN-225's flag, as Hover's.
    if (!('__KARNAMA_STORY_TEST__' in globalThis)) {
      if (import.meta.env.MODE !== 'test') return
      throw new Error('KeyboardFocus is running outside Storybook without the story-test flag that .storybook/vitest.setup.ts sets')
    }
    const browser = await import('vitest/browser')
    await browser.userEvent.keyboard('{Tab}')
    await expect(chip).toHaveFocus()
    // The ring the old add chip and the Icon Button draw, three wide in
    // border/focus inside the edge, since the file draws the chip no focus.
    const ring = getComputedStyle(chip, '::after')
    await expect([ring.borderTopStyle, px(ring.borderTopWidth)]).toEqual(['solid', 3])
    await expect(ring.borderTopColor).toBe(computed(chip, semantic['border/focus']))
  },
}
