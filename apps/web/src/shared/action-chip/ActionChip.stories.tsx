import { useLingui } from '@lingui/react'
import type { StoryObj } from '@storybook/react-vite'
import { expect, fn, userEvent, waitFor, within } from 'storybook/test'
import { darkSemantic } from '../../theme/darkMode'
import { semantic } from '../../theme/tokens'
import type { StoryMeta } from '../story-docs/story-meta'
import { ActionChip } from './ActionChip'

const meta = {
  title: 'Shared/ActionChip',
  component: ActionChip,
  args: { label: '', onClick: fn() },
  // The label is copy, the file's «نتیجه گرفتم», drawn in the reader's language
  // inside the render, so no control is left to drive the chip.
  parameters: { controls: { disable: true } },
  render: function Render(args) {
    const { i18n } = useLingui()
    return <ActionChip {...args} label={i18n._('Got the result')} />
  },
} satisfies StoryMeta<typeof ActionChip>

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

// What node 961:98854 draws at rest, State=Default: 27 high, an edge of one in
// border/default round a corner of 6, bg/surface, 3 above and below and 8 at
// the sides, and the label at 12 and Medium in text/brand on one line.
const isAtRest = async (chip: HTMLElement, palette: Record<keyof typeof semantic, string>) => {
  const style = getComputedStyle(chip)
  await expect(Math.round(chip.getBoundingClientRect().height)).toBe(27)
  await expect([px(style.borderTopWidth), style.borderTopStyle]).toEqual([1, 'solid'])
  await expect(style.borderTopColor).toBe(computed(chip, palette['border/default']))
  await expect(px(style.borderTopLeftRadius)).toBe(6)
  await expect(style.backgroundColor).toBe(computed(chip, palette['bg/surface']))
  await expect([px(style.paddingTop), px(style.paddingBottom), px(style.paddingInlineStart), px(style.paddingInlineEnd)]).toEqual([
    3, 3, 8, 8,
  ])
  await expect([px(style.fontSize), style.fontWeight, style.whiteSpace]).toEqual([12, '500', 'nowrap'])
  await expect(style.color).toBe(computed(chip, palette['text/brand']))
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
    // State=Hover: bg/surface-secondary inside an edge of text/secondary, the
    // label unchanged. Worked out before waiting, KN-014.
    const [fill, edge, label] = [
      computed(chip, semantic['bg/surface-secondary']),
      computed(chip, semantic['text/secondary']),
      computed(chip, semantic['text/brand']),
    ]
    await browser.userEvent.hover(chip)
    await waitFor(() => expect(getComputedStyle(chip).backgroundColor).toBe(fill))
    await expect(getComputedStyle(chip).borderTopColor).toBe(edge)
    await expect(getComputedStyle(chip).color).toBe(label)
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
    // The ring the Icon Button draws, three wide in border/focus inside the edge,
    // since the file draws the chip no focus of its own.
    const ring = getComputedStyle(chip, '::after')
    await expect([ring.borderTopStyle, px(ring.borderTopWidth)]).toEqual(['solid', 3])
    await expect(ring.borderTopColor).toBe(computed(chip, semantic['border/focus']))
  },
}
