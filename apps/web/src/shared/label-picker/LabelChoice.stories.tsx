import { useLingui } from '@lingui/react'
import type { StoryObj } from '@storybook/react-vite'
import { expect, fn, userEvent, waitFor, within } from 'storybook/test'
import { darkSemantic } from '../../theme/darkMode'
import { semantic, type SemanticToken } from '../../theme/tokens'
import type { StoryMeta } from '../story-docs/story-meta'
import { LabelChoice } from './LabelChoice'

const meta = {
  title: 'Shared/LabelChoice',
  component: LabelChoice,
  args: { label: '', selected: false, add: false, onClick: fn() },
  // The label is copy, the file's «آشنا» or «برچسب تازه», drawn in the reader's
  // language inside the render; the states are the controls.
  parameters: { controls: { include: ['selected', 'add'] } },
  render: function Render(args) {
    const { i18n } = useLingui()
    return <LabelChoice {...args} label={args.add === true ? i18n._('New label') : i18n._('Acquaintance')} />
  },
} satisfies StoryMeta<typeof LabelChoice>

export default meta
type Story = StoryObj<typeof meta>

type Palette = Record<SemanticToken, string>
type Clear = 'rgba(0, 0, 0, 0)'
const CLEAR: Clear = 'rgba(0, 0, 0, 0)'
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
// shows the choice at rest.
const pointAt = async (element: HTMLElement) => {
  if (!('__KARNAMA_STORY_TEST__' in globalThis)) return false
  await (await import('vitest/browser')).userEvent.hover(element)
  return true
}

// What each variant of 1086:2944 draws: a pill 32 high at radius 999, 4 above
// and below and 12 at the sides, 4 between, one pixel of edge inside; the label
// Body, 14 on 22 at Regular.
interface ChoiceFrame {
  fill: SemanticToken | null
  edge: SemanticToken
  dashed: boolean
  ink: SemanticToken
  glyph: boolean
}

type Variant = 'default' | 'hover' | 'selected' | 'add'
const FRAMES: Record<Variant, ChoiceFrame> = {
  default: { fill: 'bg/surface', edge: 'border/default', dashed: false, ink: 'text/secondary', glyph: false },
  hover: { fill: 'bg/surface-secondary', edge: 'border/default', dashed: false, ink: 'text/secondary', glyph: false },
  selected: { fill: 'bg/brand/container', edge: 'border/focus', dashed: false, ink: 'text/brand', glyph: true },
  add: { fill: null, edge: 'border/default', dashed: true, ink: 'text/brand', glyph: true },
}

const isTheFrame = async (canvasElement: HTMLElement, frame: ChoiceFrame, palette: Palette, rtl: boolean) => {
  const fill = frame.fill === null ? CLEAR : computed(canvasElement, palette[frame.fill])
  const edge = computed(canvasElement, palette[frame.edge])
  const ink = computed(canvasElement, palette[frame.ink])
  const choice = within(canvasElement).getByRole('button')
  const style = getComputedStyle(choice)
  const box = choice.getBoundingClientRect()
  await expect(box.height).toBe(32)
  await expect([px(style.paddingTop), px(style.paddingInlineStart), px(style.columnGap), px(style.borderTopLeftRadius)]).toEqual([
    4, 12, 4, 999,
  ])
  await expect([px(style.borderTopWidth), style.borderTopStyle, style.borderTopColor]).toEqual([1, frame.dashed ? 'dashed' : 'solid', edge])
  await waitFor(() => expect(getComputedStyle(choice).backgroundColor).toBe(fill))
  await expect([px(style.fontSize), px(style.lineHeight), Number(style.fontWeight)]).toEqual([14, 22, 400])
  await expect(style.color).toBe(ink)
  const glyph = choice.querySelector('svg')
  await expect(glyph !== null).toBe(frame.glyph)
  if (glyph !== null) {
    const [glyphBox, text] = [glyph.getBoundingClientRect(), choice.querySelector('span')?.getBoundingClientRect()]
    if (!text) throw new Error('no label')
    await expect([glyphBox.width, glyphBox.height]).toEqual([16, 16])
    // The glyph leads the label from the inline start.
    await expect(Math.round(rtl ? glyphBox.left - text.right : text.left - glyphBox.right)).toBe(4)
  }
  return choice
}

export const Default: Story = {
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async ({ canvasElement }) => {
    const choice = await isTheFrame(canvasElement, FRAMES.default, semantic, true)
    await expect(choice).toHaveTextContent('آشنا')
    await expect(choice).toHaveAttribute('aria-pressed', 'false')
  },
}

export const Hover: Story = {
  // Under the pointer the pill fills with bg/surface-secondary over 120 ms.
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async ({ canvasElement }) => {
    if (!(await pointAt(within(canvasElement).getByRole('button')))) return
    await isTheFrame(canvasElement, FRAMES.hover, semantic, true)
  },
}

export const Selected: Story = {
  args: { selected: true },
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async ({ canvasElement }) => {
    await expect(await isTheFrame(canvasElement, FRAMES.selected, semantic, true)).toHaveAttribute('aria-pressed', 'true')
  },
}

export const Add: Story = {
  // The dashed «برچسب تازه», which starts a new label.
  args: { add: true },
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async ({ canvasElement }) => {
    const choice = await isTheFrame(canvasElement, FRAMES.add, semantic, true)
    await expect(choice).toHaveTextContent('برچسب تازه')
    await expect(choice).not.toHaveAttribute('aria-pressed')
  },
}

export const Pressed: Story = {
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async ({ args, canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole('button'))
    await expect(args.onClick).toHaveBeenCalledTimes(1)
  },
}

export const InEnglish: Story = {
  args: { selected: true },
  globals: { locale: 'en-US', colorScheme: 'light' },
  play: async ({ canvasElement }) => {
    await expect(await isTheFrame(canvasElement, FRAMES.selected, semantic, false)).toHaveTextContent('Acquaintance')
  },
}

export const Dark: Story = {
  args: { selected: true },
  globals: { locale: 'fa-IR', colorScheme: 'dark' },
  play: async ({ canvasElement }) => {
    await isTheFrame(canvasElement, FRAMES.selected, darkSemantic, true)
  },
}
