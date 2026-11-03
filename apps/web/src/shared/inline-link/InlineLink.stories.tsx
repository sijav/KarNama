import { useLingui } from '@lingui/react'
import type { StoryObj } from '@storybook/react-vite'
import { expect, fn, userEvent, within } from 'storybook/test'
import { darkSemantic } from '../../theme/darkMode'
import { semantic } from '../../theme/tokens'
import type { StoryMeta } from '../story-docs/story-meta'
import { InlineLink } from './InlineLink'

const meta = {
  title: 'Shared/InlineLink',
  component: InlineLink,
  args: { label: '', onClick: fn() },
  // The label is copy, the file's «تاریخش عوض شد», drawn in the reader's
  // language inside the render, so no control is left to drive the link.
  parameters: { controls: { disable: true } },
  render: function Render(args) {
    const { i18n } = useLingui()
    return <InlineLink {...args} label={i18n._('Its date changed')} />
  },
} satisfies StoryMeta<typeof InlineLink>

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

const linkIn = (canvasElement: HTMLElement) => within(canvasElement).getByRole('button')

// What node 961:98862 draws, in either state: 19 high, the label at 12 and
// Regular in text/secondary on one line, underlined, and nothing round it.
const isTheFiles = async (link: HTMLElement, palette: Record<keyof typeof semantic, string>) => {
  const style = getComputedStyle(link)
  await expect(Math.round(link.getBoundingClientRect().height)).toBe(19)
  await expect([px(style.fontSize), style.fontWeight, style.whiteSpace]).toEqual([12, '400', 'nowrap'])
  await expect(style.textDecorationLine).toBe('underline')
  await expect(style.color).toBe(computed(link, palette['text/secondary']))
  await expect([px(style.paddingTop), px(style.paddingInlineStart), px(style.borderTopWidth)]).toEqual([0, 0, 0])
}

export const Default: Story = {
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async ({ args, canvasElement }) => {
    const link = linkIn(canvasElement)
    await isTheFiles(link, semantic)
    await userEvent.click(link)
    await expect(args.onClick).toHaveBeenCalledOnce()
  },
}

export const InEnglish: Story = {
  globals: { locale: 'en-US', colorScheme: 'light' },
  play: async ({ canvasElement }) => {
    await isTheFiles(linkIn(canvasElement), semantic)
  },
}

export const Dark: Story = {
  globals: { locale: 'fa-IR', colorScheme: 'dark' },
  play: async ({ canvasElement }) => {
    await isTheFiles(linkIn(canvasElement), darkSemantic)
  },
}

export const Hover: Story = {
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async ({ canvasElement }) => {
    const link = linkIn(canvasElement)
    // A real pointer, which only the runner has, KN-225's flag.
    if (!('__KARNAMA_STORY_TEST__' in globalThis)) {
      if (import.meta.env.MODE !== 'test') return
      throw new Error('Hover is running outside Storybook without the story-test flag that .storybook/vitest.setup.ts sets')
    }
    const browser = await import('vitest/browser')
    // The file's State=Hover draws exactly what State=Default does.
    await browser.userEvent.hover(link)
    await expect(link.matches(':hover')).toBe(true)
    await isTheFiles(link, semantic)
  },
}

export const KeyboardFocus: Story = {
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async ({ canvasElement }) => {
    const link = linkIn(canvasElement)
    // A real Tab, which only the runner has; KN-225's flag, as Hover's.
    if (!('__KARNAMA_STORY_TEST__' in globalThis)) {
      if (import.meta.env.MODE !== 'test') return
      throw new Error('KeyboardFocus is running outside Storybook without the story-test flag that .storybook/vitest.setup.ts sets')
    }
    const browser = await import('vitest/browser')
    await browser.userEvent.keyboard('{Tab}')
    await expect(link).toHaveFocus()
    // Three wide in border/focus round the text, which the file draws no box for.
    const style = getComputedStyle(link)
    await expect([style.outlineStyle, px(style.outlineWidth)]).toEqual(['solid', 3])
    await expect(style.outlineColor).toBe(computed(link, semantic['border/focus']))
  },
}
