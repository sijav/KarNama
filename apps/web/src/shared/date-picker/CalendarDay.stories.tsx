import type { StoryObj } from '@storybook/react-vite'
import { expect, fn, userEvent, waitFor, within } from 'storybook/test'
import { usePreferences } from '../../core/preferences'
import { darkSemantic } from '../../theme/darkMode'
import { semantic, type SemanticToken } from '../../theme/tokens'
import type { StoryMeta } from '../story-docs/story-meta'
import { CalendarDay } from './CalendarDay'
import { dayLabel, dayName } from './words'

// The day the stories draw, Sunday 4 October 2026, 12 Mehr 1405: the frame's
// «۱۲».
const DAY = '2026-10-04'

const meta = {
  title: 'Shared/CalendarDay',
  component: CalendarDay,
  args: {
    label: '',
    name: '',
    friday: false,
    today: false,
    selected: false,
    disabled: false,
    tabbable: true,
    onKeyDown: fn(),
    onSelect: fn(),
  },
  // The number and the name are the day's, drawn in the reader's digits inside
  // the render; the states are the controls.
  parameters: { controls: { include: ['friday', 'today', 'selected', 'disabled'] } },
  render: function Render(args) {
    const { locale } = usePreferences()
    return <CalendarDay {...args} label={args.label === null ? null : dayLabel(locale, DAY)} name={dayName(locale, DAY)} />
  },
} satisfies StoryMeta<typeof CalendarDay>

export default meta
type Story = StoryObj<typeof meta>

type Palette = Record<SemanticToken, string>
type Clear = 'rgba(0, 0, 0, 0)'
const CLEAR: Clear = 'rgba(0, 0, 0, 0)'

const px = (value: string) => Number.parseFloat(value) || 0

// A colour as the browser computes it, borrowed on the host's own inline style
// and put back in the same tick. Never inside waitFor, KN-014, and never on the
// day itself, whose colour moves over 150 ms, KN-365: on the canvas.
const computed = (host: HTMLElement, value: string) => {
  const previous = host.style.color
  host.style.color = value
  const result = getComputedStyle(host).color
  host.style.color = previous
  return result
}

// The runner's own pointer, which only the runner has; outside it the story
// shows the day at rest.
const pointAt = async (element: HTMLElement) => {
  if (!('__KARNAMA_STORY_TEST__' in globalThis)) return false
  await (await import('vitest/browser')).userEvent.hover(element)
  return true
}

// What each variant of 773:16113 draws: a 34 by 32 cell round a 28 circle at
// radius 14, and the number 13 on 20. The fill and today's ring of one inside
// are the circle's; the ring is an edge, which forced colours keep.
interface DayFrame {
  fill: SemanticToken | null
  ring: boolean
  ink: SemanticToken
  weight: number
}

type Variant = 'default' | 'friday' | 'hover' | 'today' | 'selected' | 'disabled' | 'fridayHover' | 'todayHover'
const FRAMES: Record<Variant, DayFrame> = {
  default: { fill: null, ring: false, ink: 'text/primary', weight: 400 },
  friday: { fill: null, ring: false, ink: 'red/500', weight: 400 },
  hover: { fill: 'bg/surface-secondary', ring: false, ink: 'text/primary', weight: 400 },
  today: { fill: null, ring: true, ink: 'text/brand', weight: 500 },
  selected: { fill: 'bg/brand/default', ring: false, ink: 'text/on-accent', weight: 500 },
  disabled: { fill: null, ring: false, ink: 'text/disabled', weight: 400 },
  fridayHover: { fill: 'bg/surface-secondary', ring: false, ink: 'red/500', weight: 400 },
  todayHover: { fill: 'bg/surface-secondary', ring: true, ink: 'text/brand', weight: 500 },
}

const buttonIn = (canvasElement: HTMLElement) => within(canvasElement).getByRole('button')
const circleOf = (button: HTMLElement) => {
  const circle = button.firstElementChild
  if (!(circle instanceof HTMLElement)) throw new Error('no circle')
  return circle
}

// The cell as its frame draws it, in a palette. The colours are worked out
// first and waited for after, since the fill and the ink move over 120 ms.
const isTheFrame = async (host: HTMLElement, button: HTMLElement, frame: DayFrame, palette: Palette) => {
  const fill = frame.fill === null ? CLEAR : computed(host, palette[frame.fill])
  const ink = computed(host, palette[frame.ink])
  const focus = computed(host, palette['border/focus'])
  const box = button.getBoundingClientRect()
  await expect([box.width, box.height]).toEqual([34, 32])
  const circle = circleOf(button)
  const round = circle.getBoundingClientRect()
  await expect([round.width, round.height, px(getComputedStyle(circle).borderTopLeftRadius)]).toEqual([28, 28, 14])
  await expect([round.left - box.left, round.top - box.top]).toEqual([3, 2])
  await waitFor(() => expect([getComputedStyle(circle).backgroundColor, getComputedStyle(circle).color]).toEqual([fill, ink]))
  const style = getComputedStyle(circle)
  await expect(px(style.borderTopWidth)).toBe(frame.ring ? 1 : 0)
  if (frame.ring) await expect([style.borderTopStyle, style.borderTopColor]).toEqual(['solid', focus])
  await expect([px(style.fontSize), px(style.lineHeight), Number(style.fontWeight)]).toEqual([13, 20, frame.weight])
}

// A variant, at rest or under the pointer.
const variant = (name: Variant, args: NonNullable<Story['args']>, hovered = false): Story => ({
  args,
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async ({ canvasElement }) => {
    const button = buttonIn(canvasElement)
    await expect(button).toHaveTextContent('۱۲')
    if (hovered && !(await pointAt(button))) return
    await isTheFrame(canvasElement, button, FRAMES[name], semantic)
  },
})

export const Default: Story = variant('default', {})
export const Friday: Story = variant('friday', { friday: true })
export const Hover: Story = variant('hover', {}, true)
export const Today: Story = variant('today', { today: true })
export const Selected: Story = variant('selected', { selected: true })
export const Disabled: Story = variant('disabled', { disabled: true })
export const FridayHover: Story = variant('fridayHover', { friday: true }, true)
export const TodayHover: Story = variant('todayHover', { today: true }, true)

export const Empty: Story = {
  // A cell the month has no day for: its room, and nothing to press.
  args: { label: null },
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).queryByRole('button')).toBeNull()
    await expect(canvasElement.textContent).toBe('')
  },
}

export const Choosing: Story = {
  // A press selects the day, and the day is named in full for a screen reader.
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async ({ args, canvasElement }) => {
    const button = buttonIn(canvasElement)
    await expect(button).toHaveAccessibleName('یکشنبه ۱۲ مهر ۱۴۰۵')
    await expect(button).toHaveAttribute('tabindex', '0')
    await userEvent.click(button)
    await expect(args.onSelect).toHaveBeenCalledTimes(1)
  },
}

export const Off: Story = {
  // A day the field does not allow: no press reaches it, and it says so.
  args: { disabled: true },
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async ({ args, canvasElement }) => {
    const button = buttonIn(canvasElement)
    await expect(button).toHaveAttribute('aria-disabled', 'true')
    await userEvent.click(button)
    await expect(args.onSelect).not.toHaveBeenCalled()
  },
}

export const KeyboardFocus: Story = {
  // The file draws no focus, so Tab draws two of border/focus round the circle,
  // apart from today's ring of one inside it.
  args: { today: true },
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async ({ canvasElement }) => {
    const button = buttonIn(canvasElement)
    await userEvent.tab()
    await expect(button).toHaveFocus()
    const circle = getComputedStyle(circleOf(button))
    await expect([circle.outlineStyle, px(circle.outlineWidth), px(circle.outlineOffset), circle.outlineColor]).toEqual([
      'solid',
      2,
      1,
      computed(canvasElement, semantic['border/focus']),
    ])
  },
}

export const InEnglish: Story = {
  // The same day in English digits, «4».
  args: { selected: true },
  globals: { locale: 'en-US', colorScheme: 'light' },
  play: async ({ canvasElement }) => {
    const button = buttonIn(canvasElement)
    await expect(button).toHaveTextContent('4')
    await expect(button).toHaveAccessibleName('Sunday, October 4, 2026')
    await isTheFrame(canvasElement, button, FRAMES.selected, semantic)
  },
}

export const Dark: Story = {
  // Today in the dark scheme, in the theme's dark colours.
  args: { today: true },
  globals: { locale: 'fa-IR', colorScheme: 'dark' },
  play: async ({ canvasElement }) => {
    await isTheFrame(canvasElement, buttonIn(canvasElement), FRAMES.today, darkSemantic)
  },
}
