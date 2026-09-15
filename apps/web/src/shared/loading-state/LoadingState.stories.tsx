import type { StoryObj } from '@storybook/react-vite'
import { expect, within } from 'storybook/test'
import { i18n } from '../../i18n'
import { semantic } from '../../theme/tokens'
import type { StoryMeta } from '../story-docs/story-meta'
import { LoadingState } from './LoadingState'
import { COLD_START_AFTER_MS } from './wait'

const meta = {
  title: 'Shared/LoadingState',
  component: LoadingState,
  // A time: pick one more than fifteen seconds back and the line says why the
  // wait is slow; leave it unset and the wait starts when the story shows.
  argTypes: { startedAt: { control: 'date' } },
} satisfies StoryMeta<typeof LoadingState>

export default meta
type Story = StoryObj<typeof meta>

const px = (value: string) => Number.parseFloat(value) || 0

// A token's colour as the browser computes it, borrowed on the host's own
// inline style and put back in the same tick.
const computedColour = (host: HTMLElement, colour: string) => {
  const previous = host.style.color
  host.style.color = colour
  const value = getComputedStyle(host).color
  host.style.color = previous
  return value
}

// Node 159:92 as drawn: 32 of padding, three dots of 10, 4 apart, turning one
// after another, and the line 16 below them at 14 on 22, all in a status
// region. The colours, border/focus and text/secondary, are the light
// palette's, so they are read only where a story pins the light scheme.
const drawsTheFrame = async (canvasElement: HTMLElement, { colours }: { colours: boolean }) => {
  const region = within(canvasElement).getByRole('status')
  const line = region.lastElementChild
  const dots = [...(region.firstElementChild?.children ?? [])].filter((dot) => dot instanceof HTMLElement)
  if (!(line instanceof HTMLParagraphElement)) throw new Error('the loading state does not end in its line')
  await expect([getComputedStyle(region).paddingTop, getComputedStyle(region).paddingLeft].map(px)).toEqual([32, 32])
  await expect(dots).toHaveLength(3)
  const boxes = dots.map((dot) => dot.getBoundingClientRect())
  for (const [index, dot] of dots.entries()) {
    const style = getComputedStyle(dot)
    await expect([boxes[index]?.width, boxes[index]?.height]).toEqual([10, 10])
    if (colours) await expect(style.backgroundColor).toBe(computedColour(dot, semantic['border/focus']))
    await expect([style.animationDuration, style.animationIterationCount]).toEqual(['0.9s', 'infinite'])
  }
  // The turns are a third of the cycle apart, so the lit dot travels.
  await expect(new Set(dots.map((dot) => getComputedStyle(dot).animationDelay)).size).toBe(3)
  const [first, second] = boxes
  if (!first || !second) throw new Error('a dot has no box')
  await expect(Math.round(Math.abs(second.left - first.left) - 10)).toBe(4)
  const lineStyle = getComputedStyle(line)
  await expect([px(lineStyle.fontSize), Number(lineStyle.fontWeight), px(lineStyle.lineHeight)]).toEqual([14, 400, 22])
  if (colours) await expect(lineStyle.color).toBe(computedColour(line, semantic['text/secondary']))
  await expect(Math.round(line.getBoundingClientRect().top - first.bottom)).toBe(16)
  return { line, dots }
}

// The dots' motion read where it stands, KN-324: each dot's one animation,
// once ready, is paused and put at a time. At 0, the frame painted first, the
// dots are the file's, the middle one lit and the others at 0.4; a turn of
// 300 ms on, the lit dot is the next one. They play again after.
const startsOnTheFilesFrame = async (dots: HTMLElement[]) => {
  await expect(dots.map((dot) => dot.getAnimations().length)).toEqual([1, 1, 1])
  const animations = dots.flatMap((dot) => dot.getAnimations())
  await Promise.all(animations.map((animation) => animation.ready))
  const opacitiesAt = (time: number) => {
    for (const animation of animations) {
      animation.pause()
      animation.currentTime = time
    }
    return dots.map((dot) => Number(getComputedStyle(dot).opacity))
  }
  try {
    await expect(opacitiesAt(0)).toEqual([0.4, 1, 0.4])
    await expect(opacitiesAt(300)).toEqual([0.4, 0.4, 1])
  } finally {
    for (const animation of animations) animation.play()
  }
}

export const Reading: Story = {
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async ({ canvasElement }) => {
    const { line, dots } = await drawsTheFrame(canvasElement, { colours: true })
    await expect(line.textContent).toBe(i18n._('Reading the job posting…'))
    await startsOnTheFilesFrame(dots)
  },
}

export const PastFifteenSeconds: Story = {
  // Set when this file loads, so the wait is past fifteen seconds whenever
  // the story is opened.
  args: { startedAt: Date.now() - 2 * COLD_START_AFTER_MS },
  globals: { locale: 'fa-IR' },
  play: async ({ canvasElement }) => {
    // The cold start: the line says the wait is slow and why, and the dots
    // keep turning.
    const { line } = await drawsTheFrame(canvasElement, { colours: false })
    await expect(line.textContent).toBe(i18n._('Still reading. If the server was asleep, waking it takes up to a minute.'))
  },
}

export const InEnglish: Story = {
  globals: { locale: 'en-US', colorScheme: 'light' },
  play: async ({ canvasElement }) => {
    const { line, dots } = await drawsTheFrame(canvasElement, { colours: true })
    await expect(line.textContent).toBe(i18n._('Reading the job posting…'))
    // Left to right, the first dot sits at the left, so the lit dot, which
    // travels from the first dot to the last, moves from left to right.
    const [first, last] = [dots[0], dots.at(-1)]
    if (!first || !last) throw new Error('no dots')
    await expect(first.getBoundingClientRect().left).toBeLessThan(last.getBoundingClientRect().left)
  },
}
