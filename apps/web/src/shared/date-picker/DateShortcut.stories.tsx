import { useLingui } from '@lingui/react'
import type { StoryObj } from '@storybook/react-vite'
import { expect, fn, userEvent, waitFor, within } from 'storybook/test'
import { darkSemantic } from '../../theme/darkMode'
import { semantic, type SemanticToken } from '../../theme/tokens'
import type { StoryMeta } from '../story-docs/story-meta'
import { DateShortcut } from './DateShortcut'

const meta = {
  title: 'Shared/DateShortcut',
  component: DateShortcut,
  args: { label: '', onClick: fn() },
  // The label is copy, the file's «امروز», drawn in the reader's language
  // inside the render, so no control is left to drive the shortcut.
  parameters: { controls: { disable: true } },
  render: function Render(args) {
    const { i18n } = useLingui()
    return <DateShortcut {...args} label={i18n._('Today')} />
  },
} satisfies StoryMeta<typeof DateShortcut>

export default meta
type Story = StoryObj<typeof meta>

type Palette = Record<SemanticToken, string>
// The pill's two fills, typed so the lint rule reads them as values.
const REST_FILL: SemanticToken = 'bg/surface-secondary'
const HOVER_FILL: SemanticToken = 'border/default'
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

// The runner's own pointer, which only the runner has; outside it the story
// shows the shortcut at rest.
const pointAt = async (element: HTMLElement) => {
  if (!('__KARNAMA_STORY_TEST__' in globalThis)) return false
  await (await import('vitest/browser')).userEvent.hover(element)
  return true
}

// Node 780:44444: a pill 25 high at radius 999, 3 above and below and 10 at the
// sides, at least the frame's 47 wide; the label 12 on 19 at Regular in
// text/primary; bg/surface-secondary, and border/default under the pointer.
const isTheFrame = async (canvasElement: HTMLElement, palette: Palette, hovered: boolean) => {
  const fill = computed(canvasElement, palette[hovered ? HOVER_FILL : REST_FILL])
  const ink = computed(canvasElement, palette['text/primary'])
  const pill = within(canvasElement).getByRole('button')
  const style = getComputedStyle(pill)
  const box = pill.getBoundingClientRect()
  await expect(box.height).toBe(25)
  await expect(box.width).toBeGreaterThanOrEqual(47)
  await expect([px(style.paddingTop), px(style.paddingBottom), px(style.paddingInlineStart), px(style.paddingInlineEnd)]).toEqual([
    3, 3, 10, 10,
  ])
  await expect(px(style.borderTopLeftRadius)).toBe(999)
  await expect([px(style.fontSize), px(style.lineHeight), Number(style.fontWeight), style.whiteSpace]).toEqual([12, 19, 400, 'nowrap'])
  await expect(style.color).toBe(ink)
  await waitFor(() => expect(getComputedStyle(pill).backgroundColor).toBe(fill))
  return pill
}

export const Default: Story = {
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async ({ canvasElement }) => {
    const pill = await isTheFrame(canvasElement, semantic, false)
    await expect(pill).toHaveTextContent('امروز')
    await expect(pill.getBoundingClientRect().width).toBe(47)
  },
}

export const Hover: Story = {
  // Under the pointer the pill takes border/default over 120 ms.
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async ({ canvasElement }) => {
    if (!(await pointAt(within(canvasElement).getByRole('button')))) return
    await isTheFrame(canvasElement, semantic, true)
  },
}

export const Pressed: Story = {
  // A press chooses the shortcut's day.
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async ({ args, canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole('button'))
    await expect(args.onClick).toHaveBeenCalledTimes(1)
  },
}

export const InEnglish: Story = {
  globals: { locale: 'en-US', colorScheme: 'light' },
  play: async ({ canvasElement }) => {
    await expect(await isTheFrame(canvasElement, semantic, false)).toHaveTextContent('Today')
  },
}

export const Dark: Story = {
  globals: { locale: 'fa-IR', colorScheme: 'dark' },
  play: async ({ canvasElement }) => {
    await isTheFrame(canvasElement, darkSemantic, false)
  },
}
