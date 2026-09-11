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
