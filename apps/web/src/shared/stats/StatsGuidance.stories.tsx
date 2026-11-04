import { Box } from '@mui/material'
import type { StoryObj } from '@storybook/react-vite'
import { expect, fn, userEvent, within } from 'storybook/test'
import { darkSemantic } from '../../theme/darkMode'
import { semantic } from '../../theme/tokens'
import type { StoryMeta } from '../story-docs/story-meta'
import { fixtures } from '../story-fixtures'
import { StatsGuidance, type StatsGuidanceProps } from './StatsGuidance'

// The Stats page's Content is 1200 wide less 32 at each side, and at 480 the
// first message no longer fits on one line.
const PAGE_WIDTH = 1136
const NARROW_WIDTH = 480

const FA = fixtures('fa-IR')
const EN = fixtures('en-US')
type Fixtures = typeof FA

// One of the handoff's two messages with its action: the first the
// applications unanswered for more than three weeks, the second a week with
// none.
const guidanceOf = (set: Fixtures, which: number): StatsGuidanceProps => {
  const found = set.statsGuidance[which]
  if (!found) throw new Error('the fixtures hold no such guidance')
  return { message: found.message, action: { label: found.action, onClick: fn() } }
}

const OnThePage = ({ width = PAGE_WIDTH, ...args }: StatsGuidanceProps & { width?: number }) => (
  <Box sx={{ width }}>
    <StatsGuidance {...args} />
  </Box>
)

const meta = {
  title: 'Shared/StatsGuidance',
  component: StatsGuidance,
  args: guidanceOf(FA, 0),
  parameters: { controls: { include: ['message', 'action'] } },
  render: (args) => <OnThePage {...args} />,
} satisfies StoryMeta<typeof StatsGuidance>

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

type Palette = Record<keyof typeof semantic, string>

// No fill, under an sx key, which the lint rule reads as CSS.
const noFill = { sx: { backgroundColor: 'transparent' } } as const

const actionOf = (args: StatsGuidanceProps) => {
  if (args.action === undefined) throw new Error('the story has no action')
  return args.action
}

// The message, and the row that holds it.
const partsOf = (canvasElement: HTMLElement, args: StatsGuidanceProps) => {
  const message = within(canvasElement).getByText(args.message)
  const box = message.parentElement
  if (!box) throw new Error('the message has no row')
  return { message, box, rtl: getComputedStyle(box).direction === 'rtl' }
}

// How far a part sits from the inline start or end of what holds it.
const fromStart = (outer: DOMRect, inner: DOMRect, rtl: boolean) => Math.round(rtl ? outer.right - inner.right : inner.left - outer.left)
const fromEnd = (outer: DOMRect, inner: DOMRect, rtl: boolean) => Math.round(rtl ? inner.left - outer.left : outer.right - inner.right)

// Node 1168:3170: the page's width and 60 tall, 12 above and below, 16 at the
// sides and 16 between, at radius md in bg/brand/container. The message in
// Body in text/primary from the inline start, 22 tall and centred, filling the
// row to 16 before the action; the action a Secondary S, 36 tall and centred,
// at the inline end, with no fill of its own and its label in text/brand.
const isTheFiles = async (canvasElement: HTMLElement, args: StatsGuidanceProps, palette: Palette) => {
  const { message, box, rtl } = partsOf(canvasElement, args)
  const outer = box.getBoundingClientRect()
  const style = getComputedStyle(box)
  await expect([outer.width, outer.height]).toEqual([PAGE_WIDTH, 60])
  await expect([px(style.paddingTop), px(style.paddingBottom), px(style.paddingInlineStart), px(style.paddingInlineEnd), px(style.columnGap)]).toEqual([
    12, 12, 16, 16, 16,
  ])
  await expect(px(style.borderTopLeftRadius)).toBe(8)
  await expect(style.backgroundColor).toBe(computed(box, palette['bg/brand/container']))
  const text = getComputedStyle(message)
  await expect([px(text.fontSize), px(text.lineHeight), text.fontWeight]).toEqual([14, 22, '400'])
  await expect(text.color).toBe(computed(message, palette['text/primary']))
  const said = message.getBoundingClientRect()
  await expect([said.height, Math.round(said.top - outer.top), fromStart(outer, said, rtl)]).toEqual([22, 19, 16])
  const button = within(box).getByRole('button', { name: actionOf(args).label })
  const pressed = button.getBoundingClientRect()
  await expect([pressed.height, Math.round(pressed.top - outer.top), fromEnd(outer, pressed, rtl)]).toEqual([36, 12, 16])
  await expect(Math.round(rtl ? said.left - pressed.right : pressed.left - said.right)).toBe(16)
  await expect(getComputedStyle(button).backgroundColor).toBe(computed(button, noFill.sx.backgroundColor))
  await expect(getComputedStyle(button).color).toBe(computed(button, palette['text/brand']))
}

export const Default: Story = {
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async ({ args, canvasElement }) => {
    await isTheFiles(canvasElement, args, semantic)
  },
}

export const QuietWeek: Story = {
  // The handoff's second message, which has no frame: a week with no
  // application while job opportunities are saved.
  args: guidanceOf(FA, 1),
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async ({ args, canvasElement }) => {
    await isTheFiles(canvasElement, args, semantic)
  },
}

export const Action: Story = {
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async ({ args, canvasElement }) => {
    // The action is pressed with a pointer, then reached by Tab and pressed
    // with Enter.
    const action = actionOf(args)
    const button = within(canvasElement).getByRole('button', { name: action.label })
    await userEvent.click(button)
    await expect(action.onClick).toHaveBeenCalledOnce()
    button.blur()
    await userEvent.tab()
    await expect(button).toHaveFocus()
    await userEvent.keyboard('{Enter}')
    await expect(action.onClick).toHaveBeenCalledTimes(2)
  },
}

export const WithoutAnAction: Story = {
  // A message with no action fills the row, which is 46 tall.
  render: ({ action: _action, ...args }) => <OnThePage {...args} />,
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async ({ args, canvasElement }) => {
    const { message, box, rtl } = partsOf(canvasElement, args)
    await expect(within(box).queryByRole('button')).toBeNull()
    const outer = box.getBoundingClientRect()
    const said = message.getBoundingClientRect()
    await expect([outer.height, fromStart(outer, said, rtl), fromEnd(outer, said, rtl)]).toEqual([46, 16, 16])
  },
}

export const Wraps: Story = {
  // At 480 the message wraps and the row grows with it; the action keeps its
  // size and stays centred.
  render: (args) => <OnThePage {...args} width={NARROW_WIDTH} />,
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async ({ args, canvasElement }) => {
    const { message, box } = partsOf(canvasElement, args)
    const outer = box.getBoundingClientRect()
    const said = message.getBoundingClientRect()
    await expect(said.height).toBeGreaterThanOrEqual(44)
    await expect(said.height % 22).toBe(0)
    await expect(outer.height).toBe(said.height + 24)
    const button = within(box).getByRole('button', { name: actionOf(args).label })
    const pressed = button.getBoundingClientRect()
    await expect(Math.round(pressed.top - outer.top)).toBe(Math.round((outer.height - 36) / 2))
    await expect(button.scrollWidth).toBeLessThanOrEqual(button.clientWidth)
  },
}

export const InEnglish: Story = {
  args: guidanceOf(EN, 0),
  globals: { locale: 'en-US', colorScheme: 'light' },
  play: async ({ args, canvasElement }) => {
    await isTheFiles(canvasElement, args, semantic)
  },
}

export const Dark: Story = {
  globals: { locale: 'fa-IR', colorScheme: 'dark' },
  play: async ({ args, canvasElement }) => {
    await isTheFiles(canvasElement, args, darkSemantic)
  },
}
