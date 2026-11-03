import { useLingui } from '@lingui/react'
import type { StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { expect, fn, userEvent, waitFor, within } from 'storybook/test'
import { i18n } from '../../i18n'
import { darkSemantic } from '../../theme/darkMode'
import { buildTheme } from '../../theme/theme'
import { elevation, semantic } from '../../theme/tokens'
import { SIDEBAR_WIDTH, TAB_BAR_HEIGHT } from '../navigation'
import type { StoryMeta } from '../story-docs/story-meta'
import { fixtures } from '../story-fixtures'
import { Toast, type ToastProps } from './Toast'

// Open as the story mounts and closed when it says so, as the board will hold
// it; its action named «لغو» from the catalog, since that is copy.
const Shown = ({ onClose, action, ...args }: ToastProps) => {
  const { i18n } = useLingui()
  const [open, setOpen] = useState(true)
  return (
    <Toast
      {...args}
      {...(action === undefined ? {} : { action: { ...action, label: i18n._('Undo') } })}
      open={open}
      onClose={() => {
        setOpen(false)
        onClose()
      }}
    />
  )
}

// «تغییرات ذخیره شد», the message with no action.
const Saved = ({ message: _message, action: _action, ...args }: ToastProps) => {
  const { i18n } = useLingui()
  return <Shown {...args} message={i18n._('Changes saved')} />
}

const meta = {
  title: 'Shared/Toast',
  component: Toast,
  args: { open: true, message: fixtures('fa-IR').toastMessage, action: { label: '', onClick: fn() }, onClose: fn() },
  // What it says is the board's, and every play reads the drawing.
  parameters: { controls: { disable: true } },
  render: (args) => <Shown {...args} />,
} satisfies StoryMeta<typeof Toast>

export default meta
type Story = StoryObj<typeof meta>

const px = (value: string) => Number.parseFloat(value) || 0

// A value as the browser computes it, borrowed on the host's own inline style
// and put back in the same tick. Never inside waitFor, KN-014.
const borrowed = (host: HTMLElement, property: 'color' | 'backgroundColor' | 'boxShadow', value: string) => {
  const previous = host.style[property]
  host.style[property] = value
  const result = getComputedStyle(host)[property]
  host.style[property] = previous
  return result
}

const wait = (ms: number) =>
  new Promise((resolve) => {
    window.setTimeout(resolve, ms)
  })

// The drawn pill, the Snackbar's one child.
const pillIn = (canvasElement: HTMLElement) => {
  const pill = canvasElement.querySelector('.MuiSnackbar-root')?.firstElementChild
  if (!(pill instanceof HTMLElement)) throw new Error('no toast is drawn')
  return pill
}

const MD = buildTheme('rtl').breakpoints.values.md

// What the frames draw, 717:12416: a pill 44 tall, 12 above and below and 16 at
// the sides, 16 between its parts, radius 12, text/primary with its own shadow;
// the message at the inline start, 13 on 20 at Regular in bg/surface, and the
// action after it, 13 on 20 at SemiBold in text/brand-inverse. It sits 24 above
// the page's foot, centred over the page beside the sidebar, or 24 over the tab
// bar on a phone.
const isTheFiles = async (canvasElement: HTMLElement, palette: Record<keyof typeof semantic, string>, rtl: boolean, withAction: boolean) => {
  const pill = pillIn(canvasElement)
  // Once it has come up.
  await waitFor(() => expect(pill.getBoundingClientRect().bottom).toBeLessThan(window.innerHeight))
  await wait(300)
  const style = getComputedStyle(pill)
  const box = pill.getBoundingClientRect()
  await expect(box.height).toBe(44)
  await expect([px(style.paddingTop), px(style.paddingBottom), px(style.paddingInlineStart), px(style.paddingInlineEnd)]).toEqual([12, 12, 16, 16])
  await expect([px(style.columnGap), px(style.borderTopLeftRadius)]).toEqual([16, 12])
  await expect(style.backgroundColor).toBe(borrowed(pill, 'backgroundColor', palette['text/primary']))
  await expect(style.boxShadow).toBe(borrowed(pill, 'boxShadow', elevation.toast))
  const wide = window.innerWidth >= MD
  await expect(Math.round(window.innerHeight - box.bottom)).toBe(wide ? 24 : TAB_BAR_HEIGHT + 24)
  const beside = wide ? SIDEBAR_WIDTH : 0
  const centre = rtl ? (window.innerWidth - beside) / 2 : beside + (window.innerWidth - beside) / 2
  await expect(Math.abs(box.left + box.width / 2 - centre)).toBeLessThanOrEqual(1)
  const [words, action] = [...pill.children]
  if (!(words instanceof HTMLElement)) throw new Error('the toast has no message')
  const text = getComputedStyle(words)
  await expect([px(text.fontSize), px(text.lineHeight), text.fontWeight]).toEqual([13, 20, '400'])
  await expect(text.color).toBe(borrowed(words, 'color', palette['bg/surface']))
  await expect(words.getAttribute('aria-hidden')).toBe('true')
  if (!withAction) {
    await expect(action).toBeUndefined()
    return
  }
  if (!(action instanceof HTMLElement)) throw new Error('the toast has no action')
  const label = getComputedStyle(action)
  await expect([px(label.fontSize), px(label.lineHeight), label.fontWeight]).toEqual([13, 20, '600'])
  await expect(label.color).toBe(borrowed(action, 'color', palette['text/brand-inverse']))
  await expect(label.textDecorationLine).toBe('none')
  // The message at the inline start and the action 16 after it.
  const [first, second] = [words.getBoundingClientRect(), action.getBoundingClientRect()]
  await expect(Math.round(rtl ? first.left - second.right : second.left - first.right)).toBe(16)
}

const statusIn = (canvasElement: HTMLElement) => within(canvasElement).getByRole('status')

export const WithAnAction: Story = {
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async ({ args, canvasElement }) => {
    await isTheFiles(canvasElement, semantic, true, true)
    // Spoken from the status region, and the action named with it.
    await waitFor(() => expect(statusIn(canvasElement)).toHaveTextContent(args.message))
    const undo = within(canvasElement).getByRole('button', { name: `${i18n._('Undo')}: ${args.message}` })
    await expect(undo).toHaveTextContent(i18n._('Undo'))
    // A press closes it and hands the action over.
    await userEvent.click(undo)
    await expect(args.onClose).toHaveBeenCalledOnce()
    await expect(args.action?.onClick).toHaveBeenCalledOnce()
    await waitFor(() => expect(canvasElement.querySelector('.MuiSnackbar-root')).toBeNull())
  },
}

export const ChangesSaved: Story = {
  // «تغییرات ذخیره شد» has no action and stays 3 seconds.
  render: (args) => <Saved {...args} />,
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async ({ args, canvasElement }) => {
    await isTheFiles(canvasElement, semantic, true, false)
    await waitFor(() => expect(statusIn(canvasElement)).toHaveTextContent(i18n._('Changes saved')))
    await wait(2000)
    await expect(args.onClose).not.toHaveBeenCalled()
    await waitFor(() => expect(args.onClose).toHaveBeenCalledOnce(), { timeout: 2000 })
  },
}

export const StaysFiveSeconds: Story = {
  // A message with an action stays 5 seconds, then closes by itself.
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async ({ args, canvasElement }) => {
    pillIn(canvasElement)
    await wait(4200)
    await expect(args.onClose).not.toHaveBeenCalled()
    await waitFor(() => expect(args.onClose).toHaveBeenCalledOnce(), { timeout: 2000 })
    await expect(args.action?.onClick).not.toHaveBeenCalled()
  },
}

export const Hover: Story = {
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async ({ args, canvasElement }) => {
    // Toast / Action's Hover, 956:3191: the label underlined, by the runner's
    // real pointer, since :hover is the browser's hit-testing, KN-225.
    if (!('__KARNAMA_STORY_TEST__' in globalThis)) {
      if (import.meta.env.MODE !== 'test') return
      throw new Error('Hover is running outside Storybook without the story-test flag that .storybook/vitest.setup.ts sets')
    }
    const browser = await import('vitest/browser')
    const undo = within(canvasElement).getByRole('button', { name: `${i18n._('Undo')}: ${args.message}` })
    await browser.userEvent.hover(undo)
    await waitFor(() => expect(getComputedStyle(undo).textDecorationLine).toBe('underline'))
  },
}

export const KeyboardFocus: Story = {
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async ({ args, canvasElement }) => {
    // Reached by Tab, the action wears an outline of its own colour, two at an
    // offset of two, which reads on the pill in both schemes.
    const undo = within(canvasElement).getByRole('button', { name: `${i18n._('Undo')}: ${args.message}` })
    await userEvent.tab()
    await expect(undo).toHaveFocus()
    const style = getComputedStyle(undo)
    await expect([style.outlineStyle, px(style.outlineWidth), px(style.outlineOffset)]).toEqual(['solid', 2, 2])
    await expect(style.outlineColor).toBe(style.color)
  },
}

export const Escape: Story = {
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async ({ args, canvasElement }) => {
    // Escape closes it and does not undo.
    pillIn(canvasElement)
    await userEvent.keyboard('{Escape}')
    await expect(args.onClose).toHaveBeenCalledOnce()
    await expect(args.action?.onClick).not.toHaveBeenCalled()
  },
}

export const PressElsewhere: Story = {
  globals: { locale: 'fa-IR', colorScheme: 'light' },
  play: async ({ args, canvasElement }) => {
    // A press elsewhere on the page leaves it, so the reader keeps the undo.
    pillIn(canvasElement)
    await userEvent.click(canvasElement)
    await wait(300)
    await expect(args.onClose).not.toHaveBeenCalled()
  },
}

export const InEnglish: Story = {
  args: { message: fixtures('en-US').toastMessage },
  globals: { locale: 'en-US', colorScheme: 'light' },
  play: async ({ canvasElement }) => {
    // Left to right it mirrors: the message at the left and the action at the
    // right, over the page right of the sidebar.
    await isTheFiles(canvasElement, semantic, false, true)
  },
}

export const Dark: Story = {
  globals: { locale: 'fa-IR', colorScheme: 'dark' },
  play: async ({ canvasElement }) => {
    // Its pill is text/primary, which turns light in dark, with the message and
    // the action dark on it.
    await isTheFiles(canvasElement, darkSemantic, true, true)
  },
}
