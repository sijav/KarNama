import type { StoryObj } from '@storybook/react-vite'
import { expect, fn, userEvent, waitFor, within } from 'storybook/test'
import { i18nFor } from '../../i18n'
import { darkSemantic } from '../../theme/darkMode'
import { semantic, type SemanticToken } from '../../theme/tokens'
import type { StoryMeta } from '../story-docs/story-meta'
import { ClearLink } from './ClearLink'

const meta = {
  title: 'Shared/ClearLink',
  component: ClearLink,
  args: { onClick: fn() },
  parameters: { controls: { disable: true } },
} satisfies StoryMeta<typeof ClearLink>

export default meta
type Story = StoryObj<typeof meta>

type Palette = Record<SemanticToken, string>
// The link's two colours, typed so the lint rule reads them as values.
const REST_INK: SemanticToken = 'text/secondary'
const HOVER_INK: SemanticToken = 'text/primary'
const px = (value: string) => Number.parseFloat(value) || 0

// A colour as the browser computes it, borrowed on the canvas's own inline
// style, which no transition moves, and put back in the same tick. Never inside
// waitFor, KN-014.
const computed = (host: HTMLElement, value: string) => {
  const previous = host.style.color
  host.style.color = value
  const result = getComputedStyle(host).color
  host.style.color = previous
  return result
}
type Clear = 'rgba(0, 0, 0, 0)'
const CLEAR: Clear = 'rgba(0, 0, 0, 0)'

// The runner's own pointer, which only the runner has; outside it the story
// shows the link at rest.
const pointAt = async (element: HTMLElement) => {
  if (!('__KARNAMA_STORY_TEST__' in globalThis)) return false
  await (await import('vitest/browser')).userEvent.hover(element)
  return true
}

// Node 848:2253: «پاک کردن» 12 on 19 at Regular in text/secondary, on one line
// with no box; under the pointer text/primary and underlined, over 120 ms.
const isTheFrame = async (canvasElement: HTMLElement, palette: Palette, hovered: boolean) => {
  const ink = computed(canvasElement, palette[hovered ? HOVER_INK : REST_INK])
  const link = within(canvasElement).getByRole('button')
  const style = getComputedStyle(link)
  await expect([link.getBoundingClientRect().height, px(style.fontSize), px(style.lineHeight), Number(style.fontWeight)]).toEqual([
    19, 12, 19, 400,
  ])
  await expect([px(style.paddingTop), px(style.paddingInlineStart), style.backgroundColor]).toEqual([0, 0, CLEAR])
  await waitFor(() => expect(getComputedStyle(link).color).toBe(ink))
  await waitFor(() => expect(getComputedStyle(link).textDecorationColor).toBe(hovered ? ink : CLEAR))
  await expect(getComputedStyle(link).textDecorationLine).toBe('underline')
  return link
}

export const Default: Story = {
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async ({ canvasElement }) => {
    await expect(await isTheFrame(canvasElement, semantic, false)).toHaveTextContent('پاک کردن')
  },
}

export const Hover: Story = {
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async ({ canvasElement }) => {
    if (!(await pointAt(within(canvasElement).getByRole('button')))) return
    await isTheFrame(canvasElement, semantic, true)
  },
}

export const Pressed: Story = {
  // A press empties the field and closes the calendar.
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async ({ args, canvasElement }) => {
    const link = within(canvasElement).getByRole('button', { name: i18nFor('fa-IR')._('Clear') })
    await userEvent.click(link)
    await expect(args.onClick).toHaveBeenCalledTimes(1)
  },
}

export const InEnglish: Story = {
  globals: { locale: 'en-US', colorScheme: 'light' },
  play: async ({ canvasElement }) => {
    await expect(await isTheFrame(canvasElement, semantic, false)).toHaveTextContent('Clear')
  },
}

export const Dark: Story = {
  globals: { locale: 'fa-IR', colorScheme: 'dark' },
  play: async ({ canvasElement }) => {
    await isTheFrame(canvasElement, darkSemantic, false)
  },
}
