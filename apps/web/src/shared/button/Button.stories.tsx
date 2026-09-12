import { useLingui } from '@lingui/react'
import { Box } from '@mui/material'
import type { StoryObj } from '@storybook/react-vite'
import { expect, fn, waitFor, within } from 'storybook/test'
import { semantic, spacing } from '../../theme/tokens'
import { ICON_NAMES } from '../icon'
import type { StoryMeta } from '../story-docs/story-meta'
import { Button, type ButtonProps, type ButtonSize, type ButtonVariant } from './Button'

const VARIANTS: readonly ButtonVariant[] = ['primary', 'secondary', 'text', 'destructive', 'ghost']
const SIZES: readonly ButtonSize[] = ['S', 'M', 'L']

// The label is copy, the file's «دکمه», drawn in the reader's language inside
// the render, so its arg is a placeholder no control shows.
const Labelled = (args: ButtonProps) => {
  const { i18n } = useLingui()
  return <Button {...args}>{i18n._('Button')}</Button>
}

// The five the file draws, node 31:4. `rest` and `disabled` a button reaches on
// its own; the other three are transient and only a pointer or a keyboard puts
// it in them, KN-316.
/* eslint-disable lingui/no-unlocalized-strings -- state names and a DOM attribute, not copy: nothing here is ever rendered */
const STATES = ['rest', 'hover', 'pressed', 'disabled', 'focus'] as const
type ButtonState = (typeof STATES)[number]

// The mechanism the component's users never see: the component draws each
// transient state for `data-state` as well as for the browser's own
// pseudo-class, and this puts the attribute on the rendered button. It cannot
// be a prop, because Button declares its props and forwards nothing else, so
// the cell holds a ref to its own box and reaches the button inside it.
const Forced = ({ state, ...args }: ButtonProps & { state: ButtonState }) => (
  // A ref callback, not an effect: React runs a passive effect AFTER the
  // browser has painted, so every transient cell showed its REST look for a
  // frame first, KN-454. A ref callback runs in the commit, before the paint,
  // and an inline one runs again on every render, so a changed `state` lands
  // before the frame that shows it. Refs attach from the bottom up, so the
  // button inside this box is already in the tree when this runs.
  <Box
    ref={(cell: HTMLDivElement | null) => {
      const button = cell?.querySelector('button')
      if (!button) return
      if (state === 'rest' || state === 'disabled') button.removeAttribute('data-state')
      else button.setAttribute('data-state', state)
    }}
    sx={{ display: 'inline-flex' }}
  >
    <Labelled {...args} disabled={state === 'disabled'} />
  </Box>
)

// What the browser had to draw at the first frame, filled by a frame callback
// the story schedules BEFORE it renders: a frame callback runs after layout and
// before the paint it belongs to, so what it counts is what the reader sees
// first. With the attribute set from an effect this was zero, KN-454.
let forcedAtFirstFrame: number | null = null
/* eslint-enable lingui/no-unlocalized-strings */

const meta = {
  title: 'Shared/Button',
  component: Button,
  args: { children: '', variant: 'primary', size: 'M', disabled: false, onClick: fn() },
  argTypes: {
    variant: { control: 'select', options: VARIANTS },
    size: { control: 'radio', options: SIZES },
    disabled: { control: 'boolean' },
    startIcon: { control: 'select', options: ICON_NAMES },
    endIcon: { control: 'select', options: ICON_NAMES },
  },
  parameters: { controls: { include: ['variant', 'size', 'disabled', 'startIcon', 'endIcon'] } },
  render: (args) => <Labelled {...args} />,
} satisfies StoryMeta<typeof Button>

export default meta
type Story = StoryObj<typeof meta>

const px = (value: string) => Number.parseFloat(value) || 0

// A token's colour as the browser computes it, borrowed on the host's own
// inline style and put back in the same tick. Never called inside waitFor,
// which would see the borrowing as a change and run again, KN-014.
const computedColour = (host: HTMLElement, colour: string) => {
  const previous = host.style.color
  host.style.color = colour
  const value = getComputedStyle(host).color
  host.style.color = previous
  return value
}

type Role = keyof typeof semantic
// Token names and a CSS colour a computed style is compared with, KN-214: a
// fill may be none, so the table is typed Role or null, which the lint rule
// does not read as a union of names.
/* eslint-disable lingui/no-unlocalized-strings -- token names and a CSS value, not copy */
const CLEAR = 'rgba(0, 0, 0, 0)'

// Node 31:4, read with use_figma: each style's fill and text in each state.
const EXPECTED: Record<ButtonVariant, Record<'rest' | 'hover' | 'pressed' | 'disabled', [Role | null, Role]>> = {
  primary: { rest: ['bg/brand/default', 'text/on-accent'], hover: ['bg/brand/hover', 'text/on-accent'], pressed: ['accent/700', 'text/on-accent'], disabled: ['gray/200', 'text/disabled'] },
  secondary: { rest: [null, 'text/brand'], hover: ['bg/brand/container', 'text/brand'], pressed: ['accent/200', 'text/brand'], disabled: [null, 'text/disabled'] },
  text: { rest: [null, 'text/brand'], hover: ['bg/brand/container', 'text/brand'], pressed: ['accent/200', 'text/brand'], disabled: [null, 'text/disabled'] },
  destructive: { rest: ['bg/danger/default', 'text/on-accent'], hover: ['bg/danger/hover', 'text/on-accent'], pressed: ['red/700', 'text/on-accent'], disabled: ['gray/200', 'text/disabled'] },
  ghost: { rest: [null, 'text/secondary'], hover: ['bg/surface-secondary', 'text/primary'], pressed: ['bg/surface-secondary', 'text/primary'], disabled: [null, 'text/disabled'] },
}
/* eslint-enable lingui/no-unlocalized-strings */

// Ghost's pressed state is its hover at 0.9, node 33:58, and the focus ring
// is two pixels of border/focus. Read from the file, held here rather than
// taken from the component, so one wrong token cannot move both.
const GHOST_PRESSED = 0.9
const FOCUS_EDGE = 2

const HEIGHTS: Record<ButtonSize, number> = { S: 36, M: 44, L: 52 }
const PADDING: Record<ButtonSize, number> = { S: 12, M: 16, L: 24 }

// The colours a state should show, worked out before any waiting.
const wanted = (button: HTMLElement, variant: ButtonVariant, state: keyof (typeof EXPECTED)['primary']) => {
  const [fill, text] = EXPECTED[variant][state]
  return { fill: fill === null ? CLEAR : computedColour(button, semantic[fill]), text: computedColour(button, semantic[text]) }
}

// A button at rest: its size's height and padding, radius md, and its style's
// fill and text.
const atRest = async (button: HTMLElement, variant: ButtonVariant, size: ButtonSize) => {
  const style = getComputedStyle(button)
  await expect(button.getBoundingClientRect().height).toBe(HEIGHTS[size])
  await expect([px(style.paddingLeft), px(style.paddingRight)]).toEqual([PADDING[size], PADDING[size]])
  await expect(px(style.borderTopLeftRadius)).toBe(8)
  const { fill, text } = wanted(button, variant, 'rest')
  await expect([style.backgroundColor, style.color]).toEqual([fill, text])
}

export const Playground: Story = {
  globals: { colorScheme: 'light' },
  play: async ({ args, canvasElement }) => {
    const button = within(canvasElement).getByRole('button')
    const variant = args.variant ?? 'primary'
    const size = args.size ?? 'M'
    if (args.disabled) {
      const { fill, text } = wanted(button, variant, 'disabled')
      await expect([getComputedStyle(button).backgroundColor, getComputedStyle(button).color]).toEqual([fill, text])
      await expect(button).toBeDisabled()
      return
    }
    await atRest(button, variant, size)
  },
}

/**
 * Every one of the 75: five styles, three sizes, five states, all rendered from
 * args and all visible without a test running, KN-316.
 */
export const States: Story = {
  globals: { colorScheme: 'light' },
  parameters: { controls: { include: ['startIcon', 'endIcon'] } },
  beforeEach: () => {
    forcedAtFirstFrame = null
    const frame = requestAnimationFrame(() => {
      forcedAtFirstFrame = document.querySelectorAll('button[data-state]').length
    })
    return () => {
      cancelAnimationFrame(frame)
    }
  },
  render: (args) => (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: `${spacing.lg}px` }}>
      {STATES.map((state) => (
        <Box key={state} sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, max-content)', gap: `${spacing.md}px`, alignItems: 'center' }}>
          {VARIANTS.flatMap((variant) => SIZES.map((size) => <Forced key={`${variant}-${size}`} {...args} variant={variant} size={size} state={state} />))}
        </Box>
      ))}
    </Box>
  ),
  play: async ({ canvasElement }) => {
    // All 75 read where they stand, with no pointer and no keyboard: the fill
    // and the text of every one, Ghost's pressed opacity, and the focus ring,
    // which is an outline on four styles and Secondary's own inside edge.
    // The 45 transient cells carried their state into the FIRST frame the
    // browser drew, rather than being painted at rest and corrected after,
    // KN-454. Read from a frame callback the story scheduled before it
    // rendered, because by the time a play runs every effect has long since
    // caught up and the flash is invisible to it.
    const transient = STATES.filter((state) => state !== 'rest' && state !== 'disabled').length
    await waitFor(async () => {
      await expect(forcedAtFirstFrame).not.toBeNull()
    })
    await expect(forcedAtFirstFrame).toBe(transient * VARIANTS.length * SIZES.length)

    const buttons = within(canvasElement).getAllByRole('button')
    await expect(buttons).toHaveLength(STATES.length * VARIANTS.length * SIZES.length)
    const cells = STATES.flatMap((state) => VARIANTS.flatMap((variant) => SIZES.map((size) => ({ state, variant, size }))))
    for (const [index, cell] of cells.entries()) {
      const button = buttons[index]
      if (!button) throw new Error('a button is missing')
      await expect(button.getBoundingClientRect().height).toBe(HEIGHTS[cell.size])
      if (cell.state === 'disabled') await expect(button).toBeDisabled()
      // eslint-disable-next-line lingui/no-unlocalized-strings -- state names, not copy
      const shown = cell.state === 'focus' ? 'rest' : cell.state
      const { fill, text } = wanted(button, cell.variant, shown)
      const style = getComputedStyle(button)
      await expect([style.backgroundColor, style.color]).toEqual([fill, text])
      await expect(Number(style.opacity)).toBe(cell.state === 'pressed' && cell.variant === 'ghost' ? GHOST_PRESSED : 1)
      // The focus ring, 31:4: two pixels of border/focus, drawn inside in place
      // of Secondary's own edge and outside on every other style.
      const ring = cell.variant === 'secondary' ? getComputedStyle(button, '::before').borderTopWidth : style.outlineWidth
      await expect(px(ring)).toBe(cell.state === 'focus' ? FOCUS_EDGE : cell.variant === 'secondary' ? 1 : 0)
    }

    // A forced cell is in ONE state. Without the `:not([data-state])` gate a
    // pointer crossing this matrix would add a real hover on top of a forced
    // focus and draw something node 31:4 never draws. Only the runner has a
    // pointer, KN-225.
    if (!('__KARNAMA_STORY_TEST__' in globalThis)) return
    const browser = await import('vitest/browser')
    // eslint-disable-next-line lingui/no-unlocalized-strings -- a state name, not copy
    const focused = buttons[STATES.indexOf('focus') * VARIANTS.length * SIZES.length]
    if (!focused) throw new Error('the focus row is missing')
    const rest = wanted(focused, 'primary', 'rest')
    await browser.userEvent.hover(focused)
    await expect(getComputedStyle(focused).backgroundColor).toBe(rest.fill)
    await browser.userEvent.unhover(focused)
  },
}

// Every style in every size, twice: the enabled fifteen, then the disabled.
export const Matrix: Story = {
  globals: { colorScheme: 'light' },
  parameters: { controls: { include: ['startIcon', 'endIcon'] } },
  render: (args) => (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: `${spacing.md}px` }}>
      {[false, true].map((disabled) => (
        <Box key={String(disabled)} sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, max-content)', gap: `${spacing.md}px`, alignItems: 'center' }}>
          {VARIANTS.flatMap((variant) => SIZES.map((size) => <Labelled key={`${variant}-${size}`} {...args} variant={variant} size={size} disabled={disabled} />))}
        </Box>
      ))}
    </Box>
  ),
  play: async ({ canvasElement }) => {
    const buttons = within(canvasElement).getAllByRole('button')
    await expect(buttons).toHaveLength(30)
    const combos = [false, true].flatMap((disabled) => VARIANTS.flatMap((variant) => SIZES.map((size) => ({ disabled, variant, size }))))
    // At rest and disabled: the thirty, read as they render.
    for (const [index, combo] of combos.entries()) {
      const button = buttons[index]
      if (!button) throw new Error('a button is missing')
      if (combo.disabled) {
        const { fill, text } = wanted(button, combo.variant, 'disabled')
        await expect([getComputedStyle(button).backgroundColor, getComputedStyle(button).color]).toEqual([fill, text])
        await expect(button).toBeDisabled()
      } else await atRest(button, combo.variant, combo.size)
    }
    // Hover, pressed and focus need the browser's own pointer and keyboard;
    // in the published Storybook there is none, so try them by hand. The
    // runner is known by the flag .storybook/vitest.setup.ts sets, KN-225.
    if (!('__KARNAMA_STORY_TEST__' in globalThis)) {
      if ('__STORYBOOK_PREVIEW__' in globalThis) return
      throw new Error('Matrix is running outside Storybook without the story-test flag that .storybook/vitest.setup.ts sets')
    }
    const browser = await import('vitest/browser')
    for (const [index, combo] of combos.entries()) {
      const button = buttons[index]
      if (!button || combo.disabled) continue
      // Hover: MUI eases the fill, so its end is waited for.
      const hover = wanted(button, combo.variant, 'hover')
      await browser.userEvent.hover(button)
      await waitFor(() => expect([getComputedStyle(button).backgroundColor, getComputedStyle(button).color]).toEqual([hover.fill, hover.text]))
      // Focus by the keyboard, then pressed by holding Space.
      button.focus()
      const pressed = wanted(button, combo.variant, 'pressed')
      await browser.userEvent.keyboard('{Space>}')
      await waitFor(() => expect(getComputedStyle(button).backgroundColor).toBe(pressed.fill))
      await expect(Number(getComputedStyle(button).opacity)).toBe(combo.variant === 'ghost' ? 0.9 : 1)
      await browser.userEvent.keyboard('{/Space}')
    }
    await browser.userEvent.unhover(buttons[0] ?? canvasElement)
  },
}

export const KeyboardFocus: Story = {
  globals: { colorScheme: 'light' },
  parameters: { controls: { include: ['size'] } },
  render: (args) => (
    <Box sx={{ display: 'flex', gap: `${spacing.md}px` }}>
      {VARIANTS.map((variant) => (
        <Labelled key={variant} {...args} variant={variant} />
      ))}
    </Box>
  ),
  play: async ({ canvasElement }) => {
    // Focus by the keyboard shows the file's two pixels of border/focus:
    // inside, in place of the edge, on Secondary; outside on every other.
    if (!('__KARNAMA_STORY_TEST__' in globalThis)) {
      if ('__STORYBOOK_PREVIEW__' in globalThis) return
      throw new Error('KeyboardFocus is running outside Storybook without the story-test flag that .storybook/vitest.setup.ts sets')
    }
    const browser = await import('vitest/browser')
    const buttons = within(canvasElement).getAllByRole('button')
    for (const [index, button] of buttons.entries()) {
      const variant = VARIANTS[index]
      await browser.userEvent.keyboard('{Tab}')
      await expect(button).toHaveFocus()
      await expect(button).toHaveClass('Mui-focusVisible')
      const focus = computedColour(button, semantic['border/focus'])
      if (variant === 'secondary') {
        const edge = getComputedStyle(button, '::before')
        await expect([px(edge.borderTopWidth), edge.borderTopColor]).toEqual([2, focus])
      } else {
        const style = getComputedStyle(button)
        await expect([style.outlineStyle, px(style.outlineWidth), px(style.outlineOffset), style.outlineColor]).toEqual(['solid', 2, 0, focus])
      }
    }
  },
}

export const WithIcons: Story = {
  args: { startIcon: 'plus', endIcon: 'chevron-down' },
  globals: { colorScheme: 'light' },
  parameters: { controls: { include: ['size', 'variant'] } },
  play: async ({ args, canvasElement }) => {
    // The icons take the size's scale, 16, 20 or 24, and the label's colour,
    // with the size's gap between.
    const button = within(canvasElement).getByRole('button')
    const icons = [...button.querySelectorAll('svg')]
    await expect(icons).toHaveLength(2)
    const size = args.size ?? 'M'
    const scale = { S: 16, M: 20, L: 24 }[size]
    for (const icon of icons) await expect(icon.getBoundingClientRect().width).toBe(scale)
    await expect(px(getComputedStyle(button).columnGap)).toBe({ S: 4, M: 8, L: 8 }[size])
  },
}
