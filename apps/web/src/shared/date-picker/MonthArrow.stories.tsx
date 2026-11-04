import type { StoryObj } from '@storybook/react-vite'
import { expect, fn, userEvent, waitFor, within } from 'storybook/test'
import { i18nFor, type Locale } from '../../i18n'
import { darkSemantic } from '../../theme/darkMode'
import { semantic, type SemanticToken } from '../../theme/tokens'
import type { StoryMeta } from '../story-docs/story-meta'
import { MonthArrow, type MonthArrowProps } from './MonthArrow'

// The two directions, typed so the lint rule reads them as values.
type Direction = MonthArrowProps['direction']
const NEXT: Direction = 'next'
const PREVIOUS: Direction = 'previous'

const meta = {
  title: 'Shared/MonthArrow',
  component: MonthArrow,
  args: { direction: NEXT, onClick: fn() },
  parameters: { controls: { include: ['direction'] } },
} satisfies StoryMeta<typeof MonthArrow>

export default meta
type Story = StoryObj<typeof meta>

type Palette = Record<SemanticToken, string>
type Clear = 'rgba(0, 0, 0, 0)'
const CLEAR: Clear = 'rgba(0, 0, 0, 0)'

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

// The runner's own pointer, which only the runner has; outside it the story
// shows the arrow at rest.
const pointAt = async (element: HTMLElement) => {
  if (!('__KARNAMA_STORY_TEST__' in globalThis)) return false
  await (await import('vitest/browser')).userEvent.hover(element)
  return true
}

const nameOf = (locale: Locale, direction: Direction) => {
  const i18n = i18nFor(locale)
  return direction === 'next' ? i18n._('Next month') : i18n._('Previous month')
}

// Which way the chevron points, read from its turn: its tip to the inline end
// for the next month, to the inline start for the previous one.
const pointsLeft = (glyph: Element) => {
  const turn = new DOMMatrixReadOnly(getComputedStyle(glyph).transform)
  // chevron-down turned a quarter: clockwise it points left, b = 1; the other
  // way right, b = -1.
  return Math.round(turn.b) === 1
}

// Node 848:2238: 28 square at radius 8, the 16 chevron in text/secondary turned
// a quarter, and on hover bg/surface-secondary.
const isTheFrame = async (
  host: HTMLElement,
  button: HTMLElement,
  direction: Direction,
  locale: Locale,
  palette: Palette,
  hovered: boolean,
) => {
  const fill = hovered ? computed(host, palette['bg/surface-secondary']) : CLEAR
  const ink = computed(host, palette['text/secondary'])
  const box = button.getBoundingClientRect()
  await expect([box.width, box.height, px(getComputedStyle(button).borderTopLeftRadius)]).toEqual([28, 28, 8])
  await waitFor(() => expect(getComputedStyle(button).backgroundColor).toBe(fill))
  await expect(button).toHaveAccessibleName(nameOf(locale, direction))
  const glyph = button.querySelector('svg')
  if (glyph === null) throw new Error('no chevron')
  const round = glyph.getBoundingClientRect()
  await expect([round.width, round.height]).toEqual([16, 16])
  await expect(getComputedStyle(glyph).color).toBe(ink)
  const rtl = locale === 'fa-IR'
  // In Persian the next month lies to the left, as the days run.
  await expect(pointsLeft(glyph)).toBe(rtl === (direction === 'next'))
}

const variant = (direction: Direction, hovered: boolean): Story => ({
  args: { direction },
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async ({ canvasElement }) => {
    const button = within(canvasElement).getByRole('button')
    if (hovered && !(await pointAt(button))) return
    await isTheFrame(canvasElement, button, direction, 'fa-IR', semantic, hovered)
  },
})

export const Next: Story = variant(NEXT, false)
export const NextHover: Story = variant(NEXT, true)
export const Previous: Story = variant(PREVIOUS, false)
export const PreviousHover: Story = variant(PREVIOUS, true)

export const Pressed: Story = {
  // A press turns the month, by pointer or by keyboard.
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async ({ args, canvasElement }) => {
    const button = within(canvasElement).getByRole('button')
    await userEvent.click(button)
    await expect(args.onClick).toHaveBeenCalledTimes(1)
  },
}

export const InEnglish: Story = {
  // In English the days run left to right, so the next month's arrow points
  // right and the previous month's left.
  globals: { locale: 'en-US', colorScheme: 'light' },
  play: async ({ canvasElement }) => {
    await isTheFrame(canvasElement, within(canvasElement).getByRole('button'), NEXT, 'en-US', semantic, false)
  },
}

export const Dark: Story = {
  args: { direction: PREVIOUS },
  globals: { locale: 'fa-IR', colorScheme: 'dark' },
  play: async ({ canvasElement }) => {
    await isTheFrame(canvasElement, within(canvasElement).getByRole('button'), PREVIOUS, 'fa-IR', darkSemantic, false)
  },
}
