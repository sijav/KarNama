import { useLingui } from '@lingui/react'
import type { StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { expect, fireEvent, waitFor, within } from 'storybook/test'
import { i18n } from '../../i18n'
import { darkSemantic } from '../../theme/darkMode'
import { semantic } from '../../theme/tokens'
import { Button } from '../button'
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

// Whether the viewer has asked for less motion, read as the component's own
// media query reads it. For them the dots stand on Step 1 with no animation,
// and every story reads that frame instead of the motion, KN-615.
const stillForTheViewer = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

// The state's parts: its status region, the box of dots, and its two out of
// sight lines, the one it speaks and the one a panel is named by.
const partsOf = (canvasElement: HTMLElement) => {
  const region = within(canvasElement).getByRole('status')
  const [box, spoken, line] = [...region.children]
  if (!(box instanceof HTMLElement) || !(spoken instanceof HTMLSpanElement) || !(line instanceof HTMLParagraphElement))
    throw new Error('the loading state is not the dots, the spoken line and the line')
  const dots = [...box.children].filter((dot) => dot instanceof HTMLElement)
  return { region, box, dots, spoken, line }
}

// Each dot as it stands, from the left of the page whatever the language: how
// far below the top of its box it is, and how opaque.
const frameOf = (box: HTMLElement, dots: HTMLElement[]) => {
  const top = box.getBoundingClientRect().top
  return dots
    .map((dot) => ({ rect: dot.getBoundingClientRect(), opacity: Number(getComputedStyle(dot).opacity) }))
    .sort((a, b) => a.rect.left - b.rect.left)
    .map(({ rect, opacity }) => [rect.top - top, opacity])
}

// The variants of node 1031:3818, Step 1, 2 and 3: the lit dot, first the left
// one, then the middle one, then the right one, at the top of the box and
// opaque, and the other two 8 lower at 0.45.
const STEPS = [
  [
    [0, 1],
    [8, 0.45],
    [8, 0.45],
  ],
  [
    [8, 0.45],
    [0, 1],
    [8, 0.45],
  ],
  [
    [8, 0.45],
    [8, 0.45],
    [0, 1],
  ],
] as const

// The prototype's times: each step holds 300 ms, then moves to the next in 250.
const HOLD_MS = 300
const MOVE_MS = 250
const STEP_MS = HOLD_MS + MOVE_MS

// Node 1031:3818 as drawn, every step alike: 32 of padding round a box of 38 by
// 22, so the frame is 102 by 86; three round dots of 10 in border/focus, 4
// apart, at 0, 14 and 28 from the box's left in both languages; and nothing
// else on screen, both lines being a clipped pixel out of the flow. The palette
// is the scheme the story pins.
const drawsTheFrame = async (canvasElement: HTMLElement, palette: Record<keyof typeof semantic, string>) => {
  const parts = partsOf(canvasElement)
  const { region, box, dots, spoken, line } = parts
  const style = getComputedStyle(region)
  await expect([style.paddingTop, style.paddingRight, style.paddingBottom, style.paddingLeft].map(px)).toEqual([32, 32, 32, 32])
  const frame = region.getBoundingClientRect()
  const area = box.getBoundingClientRect()
  await expect([frame.width, frame.height, area.width, area.height]).toEqual([102, 86, 38, 22])
  await expect(dots).toHaveLength(3)
  const lefts: number[] = []
  for (const dot of dots) {
    const rect = dot.getBoundingClientRect()
    const dotStyle = getComputedStyle(dot)
    await expect([rect.width, rect.height]).toEqual([10, 10])
    await expect(px(dotStyle.borderTopLeftRadius)).toBeGreaterThanOrEqual(5)
    await expect(dotStyle.backgroundColor).toBe(computedColour(dot, palette['border/focus']))
    lefts.push(rect.left - area.left)
  }
  await expect(lefts).toEqual([0, 14, 28])
  for (const hidden of [spoken, line]) {
    const rect = hidden.getBoundingClientRect()
    const hiddenStyle = getComputedStyle(hidden)
    await expect([rect.width, rect.height, hiddenStyle.position, hiddenStyle.overflow]).toEqual([1, 1, 'absolute', 'hidden'])
  }
  return parts
}

// The motion, read where it stands, KN-324: each dot's one animation, once
// ready, is paused and put at a time, and played again after. At 0, the frame
// painted first, the dots are Step 1, and still are at the end of its hold; a
// step on they are Step 2, then Step 3, then Step 1 again; halfway through the
// first move the falling dot and the rising one meet, ease in and out being
// symmetric. For a viewer who asked for less motion there is none, and the dots
// stand on Step 1.
const moves = async (box: HTMLElement, dots: HTMLElement[]) => {
  if (stillForTheViewer()) {
    await expect(dots.map((dot) => dot.getAnimations().length)).toEqual([0, 0, 0])
    await expect(frameOf(box, dots)).toEqual(STEPS[0])
    return
  }
  await expect(dots.map((dot) => dot.getAnimations().length)).toEqual([1, 1, 1])
  for (const dot of dots) {
    const style = getComputedStyle(dot)
    await expect([style.animationDuration, style.animationTimingFunction, style.animationIterationCount]).toEqual([
      '1.65s',
      'ease-in-out',
      'infinite',
    ])
  }
  const animations = dots.flatMap((dot) => dot.getAnimations())
  await Promise.all(animations.map((animation) => animation.ready))
  const frameAt = (time: number) => {
    for (const animation of animations) {
      animation.pause()
      animation.currentTime = time
    }
    return frameOf(box, dots)
  }
  try {
    await expect(frameAt(0)).toEqual(STEPS[0])
    await expect(frameAt(HOLD_MS - 1)).toEqual(STEPS[0])
    await expect(frameAt(STEP_MS)).toEqual(STEPS[1])
    await expect(frameAt(2 * STEP_MS)).toEqual(STEPS[2])
    await expect(frameAt(3 * STEP_MS)).toEqual(STEPS[0])
    const [falling, rising, resting] = frameAt(HOLD_MS + MOVE_MS / 2)
    for (const meeting of [falling, rising]) {
      await expect(meeting?.[0]).toBeCloseTo(4, 1)
      await expect(meeting?.[1]).toBeCloseTo((1 + 0.45) / 2, 2)
    }
    await expect(resting).toEqual([8, 0.45])
  } finally {
    for (const animation of animations) animation.play()
  }
}

// A variant of the file held still: the dots' animations paused on that step,
// which the story then shows, and not played again. For a viewer who asked for
// less motion the dots stand on Step 1, which is all a story can show them.
const holds = async (canvasElement: HTMLElement, index: 0 | 1 | 2) => {
  const { box, dots } = await drawsTheFrame(canvasElement, semantic)
  if (stillForTheViewer()) {
    await expect(frameOf(box, dots)).toEqual(STEPS[0])
    return
  }
  const animations = dots.flatMap((dot) => dot.getAnimations())
  await Promise.all(animations.map((animation) => animation.ready))
  for (const animation of animations) {
    animation.pause()
    animation.currentTime = index * STEP_MS
  }
  await expect(frameOf(box, dots)).toEqual(STEPS[index])
}

export const Reading: Story = {
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async ({ canvasElement }) => {
    const { box, dots, line } = await drawsTheFrame(canvasElement, semantic)
    await expect(line.textContent).toBe(i18n._('Reading the job posting…'))
    await moves(box, dots)
  },
}

export const Step1: Story = {
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async ({ canvasElement }) => {
    await holds(canvasElement, 0)
  },
}

export const Step2: Story = {
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async ({ canvasElement }) => {
    await holds(canvasElement, 1)
  },
}

export const Step3: Story = {
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async ({ canvasElement }) => {
    await holds(canvasElement, 2)
  },
}

export const InEnglish: Story = {
  globals: { locale: 'en-US', colorScheme: 'light' },
  play: async ({ canvasElement }) => {
    // The same steps as in Persian: the lit dot goes from left to right
    // whatever the language.
    const { box, dots, line } = await drawsTheFrame(canvasElement, semantic)
    await expect(line.textContent).toBe(i18n._('Reading the job posting…'))
    await moves(box, dots)
  },
}

export const Dark: Story = {
  globals: { locale: 'fa-IR', colorScheme: 'dark' },
  play: async ({ canvasElement }) => {
    const { box, dots } = await drawsTheFrame(canvasElement, darkSemantic)
    await moves(box, dots)
  },
}

// The animation each dot is given for a reader who asked for less motion, read
// off the page's own style sheets: every rule under the media query for reduced
// motion whose selector matches the dot. Each story's providers insert their
// own copy of the rule, so there are as many as stories have run.
const stillAnimationsOf = (dot: HTMLElement) =>
  [...document.styleSheets]
    .flatMap((sheet) => [...sheet.cssRules])
    .filter((rule) => rule instanceof CSSMediaRule && rule.conditionText === '(prefers-reduced-motion: reduce)')
    .flatMap((rule) => (rule instanceof CSSMediaRule ? [...rule.cssRules] : []))
    .filter((rule) => rule instanceof CSSStyleRule && dot.matches(rule.selectorText))
    .map((rule) => (rule instanceof CSSStyleRule ? rule.style.animationName : ''))

export const ReducedMotion: Story = {
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async ({ canvasElement }) => {
    // A reader who asked for less motion: each dot's animation is none, and
    // what is left is the dots' resting frame, Step 1. Both are read here
    // without asking the browser for less motion, which would reach every
    // story the runner draws in the same page beside this one, KN-768: the rule
    // off the style sheets, and the resting frame with the animations taken off
    // and put back after. A viewer whose own setting asks for less motion sees
    // the rule at work in every story, KN-615.
    const { box, dots } = await drawsTheFrame(canvasElement, semantic)
    for (const dot of dots) {
      const still = stillAnimationsOf(dot)
      await expect(still.length).toBeGreaterThan(0)
      await expect(still.filter((name) => name !== 'none')).toEqual([])
    }
    const animations = dots.flatMap((dot) => dot.getAnimations())
    for (const animation of animations) animation.cancel()
    try {
      await expect(frameOf(box, dots)).toEqual(STEPS[0])
    } finally {
      for (const animation of animations) animation.play()
    }
  },
}

export const PastFifteenSeconds: Story = {
  // Set when this file loads, so the wait is past fifteen seconds whenever
  // the story is opened.
  args: { startedAt: Date.now() - 2 * COLD_START_AFTER_MS },
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async ({ canvasElement }) => {
    // The cold start: the line, out of sight, says the wait is slow and why,
    // and the dots keep stepping.
    const { box, dots, line } = await drawsTheFrame(canvasElement, semantic)
    await expect(line.textContent).toBe(i18n._('Still reading. If the server was asleep, waking it takes up to a minute.'))
    await moves(box, dots)
  },
}

// A wait whose start moves while the state shows, as a host restarting it would: the start
// begins when the story shows, and the button moves it to twice fifteen seconds before the press.
// The start is the story's own state and not an arg, so the story's Controls are off.
const MovingStart = () => {
  const { i18n } = useLingui()
  const [startedAt, setStartedAt] = useState(Date.now)
  return (
    <>
      <LoadingState startedAt={startedAt} />
      <Button
        onClick={() => {
          setStartedAt(Date.now() - 2 * COLD_START_AFTER_MS)
        }}
      >
        {i18n._('Move the start back')}
      </Button>
    </>
  )
}

export const StartMovesPastFifteenSeconds: Story = {
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  parameters: { controls: { disable: true } },
  render: () => <MovingStart />,
  play: async ({ canvasElement }) => {
    // A start moved past fifteen seconds has the slow line on the render that moves it,
    // KN-325: each press goes through fireEvent, which Storybook runs inside React's act, so the
    // line is read once the press has rendered and before any timer can run. Every text the line
    // holds is recorded, and after one more microtask, when the observer has had its records,
    // the reading line is not among them.
    const { line } = partsOf(canvasElement)
    const slow = i18n._('Still reading. If the server was asleep, waking it takes up to a minute.')
    const reading = i18n._('Reading the job posting…')
    await expect(line.textContent).toBe(reading)
    const shown: (string | null)[] = []
    const observer = new window.MutationObserver(() => {
      shown.push(line.textContent)
    })
    observer.observe(line, { subtree: true, childList: true, characterData: true })
    const button = within(canvasElement).getByRole('button')
    try {
      await fireEvent.click(button)
      await expect(line.textContent).toBe(slow)
      await fireEvent.click(button)
      await expect(line.textContent).toBe(slow)
      await Promise.resolve()
      await expect(shown.filter((text) => text === reading)).toEqual([])
    } finally {
      observer.disconnect()
    }
  },
}

// A wait that starts when the story's button is pressed, «Extract details», the add flow's own:
// the Loading State mounts on the press, as it does in the add flow. A story that mounted it from
// its play through Storybook's mount would be left off the Docs page, KN-326. What shows is the
// story's own state and not an arg, so the story's Controls are off.
const Extracting = () => {
  const { i18n } = useLingui()
  const [reading, setReading] = useState(false)
  return reading ? (
    <LoadingState />
  ) : (
    <Button
      onClick={() => {
        setReading(true)
      }}
    >
      {i18n._('Extract details')}
    </Button>
  )
}

export const WritesItsFirstLineAfterMounting: Story = {
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  parameters: { controls: { disable: true } },
  render: () => <Extracting />,
  play: async ({ canvasElement }) => {
    // The status region is in the page, empty, on the render that mounts the state, and the line
    // is written into its out of sight span after, so the first line reaches the region as a
    // change, which is what a screen reader announces from, KN-326; no screen reader was run to
    // hear it, KN-619. The press goes through fireEvent, which Storybook runs inside React's act,
    // so the state has mounted and no timer has run when the span is read.
    await fireEvent.click(within(canvasElement).getByRole('button'))
    const { region, box, spoken, line } = partsOf(canvasElement)
    await expect([region.getAttribute('aria-atomic'), box.getAttribute('aria-hidden'), line.getAttribute('aria-hidden')]).toEqual([
      'true',
      'true',
      'true',
    ])
    await expect(spoken.textContent).toBe('')
    await waitFor(() => expect(spoken.textContent).toBe(i18n._('Reading the job posting…')))
  },
}

// A wait whose first line is said by the focus it gets, as the add flow's panel names itself by
// the line: the status stays quiet for that line and speaks when the line changes. The button
// moves the start, as in StartMovesPastFifteenSeconds, so the Controls are off.
const Quiet = () => {
  const { i18n } = useLingui()
  const [startedAt, setStartedAt] = useState(Date.now)
  return (
    <>
      <LoadingState startedAt={startedAt} announceFirstLine={false} />
      <Button
        onClick={() => {
          setStartedAt(Date.now() - 2 * COLD_START_AFTER_MS)
        }}
      >
        {i18n._('Move the start back')}
      </Button>
    </>
  )
}

// Longer than the 100 ms before a first spoken line, KN-326.
const QUIET_MS = 300

export const SpeaksOnlyALaterLine: Story = {
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  parameters: { controls: { disable: true } },
  render: () => <Quiet />,
  play: async ({ canvasElement }) => {
    // KN-362: given announceFirstLine false, the spoken line stays empty past the 100 ms KN-326
    // waits, since focus names the panel by that line, and holds the slow line once the wait
    // runs past fifteen seconds, which reaches the region as a change.
    const { spoken } = partsOf(canvasElement)
    await new Promise((resolve) => window.setTimeout(resolve, QUIET_MS))
    await expect(spoken.textContent).toBe('')
    await fireEvent.click(within(canvasElement).getByRole('button'))
    await expect(spoken.textContent).toBe(i18n._('Still reading. If the server was asleep, waking it takes up to a minute.'))
  },
}

export const SpeaksTheSlowLineAtOnce: Story = {
  // Set when this file loads, as in PastFifteenSeconds. Its play reads the spoken line at once,
  // which a Controls change to either arg would move, so the Controls are off.
  args: { startedAt: Date.now() - 2 * COLD_START_AFTER_MS, announceFirstLine: false },
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  parameters: { controls: { disable: true } },
  play: async ({ canvasElement }) => {
    // KN-362: told not to speak its first line, a wait already past fifteen seconds holds the
    // slow line on its first render, so the state is never silent for good.
    const { spoken } = partsOf(canvasElement)
    await expect(spoken.textContent).toBe(i18n._('Still reading. If the server was asleep, waking it takes up to a minute.'))
  },
}
