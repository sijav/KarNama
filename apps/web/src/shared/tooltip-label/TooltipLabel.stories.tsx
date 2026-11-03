import { setupI18n } from '@lingui/core'
import { Box } from '@mui/material'
import type { Decorator, StoryObj } from '@storybook/react-vite'
import type { ComponentPropsWithRef } from 'react'
import { expect, userEvent, waitFor, within } from 'storybook/test'
import type { Locale } from '../../i18n'
import { messages as en } from '../../i18n/locales/en-US'
import { messages as fa } from '../../i18n/locales/fa-IR'
import { darkSemantic, ensureContrast } from '../../theme/darkMode'
import { semantic, spacing } from '../../theme/tokens'
import { Icon } from '../icon'
import type { StoryMeta } from '../story-docs/story-meta'
import { TOOLTIP_LABEL_SURFACE, TooltipLabel } from './TooltipLabel'

// The network row's copy email, the label the file draws, read from each
// language's catalog, so a story's args are the copy the product shows.
const copyEmailIn = (locale: Locale) => {
  const i18n = setupI18n({ locale, messages: { [locale]: locale === 'fa-IR' ? fa : en } })
  return i18n._('Copy email')
}
const COPY_EMAIL = { 'fa-IR': copyEmailIn('fa-IR'), 'en-US': copyEmailIn('en-US') }

// An icon-only trigger, the button this label names, by its own aria-label: the
// same text, as the spec asks. A bare button that forwards its props and ref, as
// a tooltip's child must, and not the Icon Button, which carries a label of its
// own.
const Trigger = ({ name, ...props }: ComponentPropsWithRef<'button'> & { name: string }) => (
  <Box
    component="button"
    type="button"
    {...props}
    aria-label={name}
    sx={(theme) => ({
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: spacing.xl,
      height: spacing.xl,
      padding: 0,
      border: 0,
      background: 'none',
      color: theme.karnama.semantic['text/secondary'],
    })}
  >
    <Icon name="mail" size="sm" color="inherit" />
  </Box>
)

const meta = {
  title: 'Shared/TooltipLabel',
  component: TooltipLabel,
  args: { title: COPY_EMAIL['fa-IR'], children: <Trigger name={COPY_EMAIL['fa-IR']} /> },
  // The trigger is a React element, which no control can take, KN-255.
  argTypes: { children: { control: false } },
} satisfies StoryMeta<typeof TooltipLabel>

export default meta
type Story = StoryObj<typeof meta>

// Room above the trigger for the label to open where the file draws it, and the
// trigger centred, so nothing pushes the label off its middle.
const withRoomAbove: Decorator = (Story) => (
  <Box sx={{ display: 'flex', justifyContent: 'center', paddingTop: `${spacing['2xl']}px` }}>
    <Story />
  </Box>
)

// The trigger centred at the very top of the page, where there is no room above.
const atTheTop: Decorator = (Story) => (
  <Box sx={{ display: 'flex', justifyContent: 'center' }}>
    <Story />
  </Box>
)

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

// The open label's drawn surface, by the class the component puts on it, since
// the element with the role is MUI's popper around it, KN-222.
const surfaceOf = () => {
  const surface = document.body.querySelector(`.${TOOLTIP_LABEL_SURFACE}`)
  if (!(surface instanceof HTMLElement)) throw new Error('the label has no drawn surface')
  return surface
}

const tooltips = () => within(document.body).queryAllByRole('tooltip')

// About 300 ms before it opens, the spec's delay: shut at half of it, open by
// twice it.
const HALF_THE_DELAY_MS = 150
const twiceTheDelay = { timeout: 600 }

// Node 1123:56919 as drawn: the name on one line, 12 on 15 at Regular, inside 4
// above and below and 8 at the sides, radius sm, no shadow, 23 high, over the
// trigger and centred on it, 4 away. The colours are the palette the story pins:
// text/primary under text/on-accent, which in dark follows its fill, KN-398.
const isDrawn = async (trigger: HTMLElement, name: string, palette: Record<keyof typeof semantic, string>) => {
  const surface = surfaceOf()
  await expect(surface).toHaveTextContent(name)
  const style = getComputedStyle(surface)
  await expect([style.paddingTop, style.paddingRight, style.paddingBottom, style.paddingLeft].map(px)).toEqual([4, 8, 4, 8])
  await expect([px(style.borderTopLeftRadius), style.boxShadow, style.whiteSpace]).toEqual([4, 'none', 'nowrap'])
  await expect([px(style.fontSize), px(style.lineHeight), style.fontWeight, px(style.letterSpacing)]).toEqual([12, 15, '400', 0])
  await expect(style.backgroundColor).toBe(computed(surface, palette['text/primary']))
  await expect(style.color).toBe(computed(surface, ensureContrast(palette['text/on-accent'], palette['text/primary'])))
  const tip = surface.getBoundingClientRect()
  const button = trigger.getBoundingClientRect()
  await expect(tip.height).toBe(23)
  await expect(Math.round(button.top - tip.bottom)).toBe(4)
  await expect(Math.abs((tip.left + tip.right) / 2 - (button.left + button.right) / 2)).toBeLessThan(1)
}

// Opened by the pointer over the trigger, not at once but after about 300 ms;
// drawn as the file draws it; and gone as soon as the pointer leaves, with no
// transition either way.
const opensOnHover = async (canvasElement: HTMLElement, name: string, palette: Record<keyof typeof semantic, string>) => {
  const trigger = within(canvasElement).getByRole('button', { name })
  await userEvent.hover(trigger)
  await new Promise((resolve) => window.setTimeout(resolve, HALF_THE_DELAY_MS))
  await expect(tooltips()).toEqual([])
  await waitFor(() => expect(tooltips()).toHaveLength(1), twiceTheDelay)
  // At its full size and opacity the moment it is there: no grow, no fade.
  const shown = getComputedStyle(surfaceOf())
  await expect([new DOMMatrix(shown.transform).isIdentity, shown.opacity]).toEqual([true, '1'])
  await isDrawn(trigger, name, palette)
  // The label adds no name: the trigger is called what it was.
  await expect(trigger).toHaveAccessibleName(name)
  await userEvent.unhover(trigger)
  await waitFor(() => expect(tooltips()).toEqual([]), { timeout: 50 })
}

export const Default: Story = {
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  decorators: [withRoomAbove],
  play: async ({ args, canvasElement }) => {
    await opensOnHover(canvasElement, args.title, semantic)
  },
}

export const InEnglish: Story = {
  args: { title: COPY_EMAIL['en-US'], children: <Trigger name={COPY_EMAIL['en-US']} /> },
  globals: { locale: 'en-US', colorScheme: 'light' },
  decorators: [withRoomAbove],
  play: async ({ args, canvasElement }) => {
    await opensOnHover(canvasElement, args.title, semantic)
  },
}

export const Dark: Story = {
  globals: { locale: 'fa-IR', colorScheme: 'dark' },
  decorators: [withRoomAbove],
  play: async ({ args, canvasElement }) => {
    await opensOnHover(canvasElement, args.title, darkSemantic)
  },
}

export const KeyboardFocus: Story = {
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  decorators: [withRoomAbove],
  play: async ({ args, canvasElement }) => {
    // Focus from the keyboard opens it too, on the same delay, and leaving the
    // trigger shuts it at once.
    const trigger = within(canvasElement).getByRole('button', { name: args.title })
    await userEvent.tab()
    await expect(trigger).toHaveFocus()
    await waitFor(() => expect(tooltips()).toHaveLength(1), twiceTheDelay)
    await isDrawn(trigger, args.title, semantic)
    await userEvent.tab()
    await waitFor(() => expect(tooltips()).toEqual([]), { timeout: 50 })
  },
}

export const BelowWhenNoRoom: Story = {
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  // The trigger at the very top of the page, where there is no room above it.
  parameters: { layout: 'fullscreen' },
  decorators: [atTheTop],
  play: async ({ args, canvasElement }) => {
    // The spec's second place: below the trigger, still centred, still 4 away.
    const trigger = within(canvasElement).getByRole('button', { name: args.title })
    await userEvent.hover(trigger)
    await waitFor(() => expect(tooltips()).toHaveLength(1), twiceTheDelay)
    const tip = surfaceOf().getBoundingClientRect()
    const button = trigger.getBoundingClientRect()
    await expect(Math.round(tip.top - button.bottom)).toBe(4)
    await expect(Math.abs((tip.left + tip.right) / 2 - (button.left + button.right) / 2)).toBeLessThan(1)
    await userEvent.unhover(trigger)
  },
}
